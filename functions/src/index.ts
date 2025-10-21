import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { DateTime, Duration } from 'luxon';

import { parseSchedule } from './ics';
import type { ScheduleEvent, SeriesId } from './types';

admin.initializeApp();

const REMINDER_OFFSETS_MINUTES = [120, 5] as const;
type ReminderOffset = (typeof REMINDER_OFFSETS_MINUTES)[number];

const TOKENS_COLLECTION =
  process.env.TOKENS_COLLECTION ?? functions.config().notifications?.tokens_collection ?? 'pushTokens';
const DISPATCH_COLLECTION =
  process.env.DISPATCH_COLLECTION ?? functions.config().notifications?.dispatch_collection ?? 'notificationDispatches';
const SCHEDULE_URL = process.env.SCHEDULE_URL ?? functions.config().schedule?.url;

const firestore = admin.firestore();
const messaging = admin.messaging();

function buildEventKey(event: ScheduleEvent): string {
  if (event.uid && event.uid.trim().length > 0) {
    return event.uid;
  }

  const session = event.session.replace(/\s+/g, '-').toLowerCase();
  const round = event.round.replace(/\s+/g, '-').toLowerCase();
  const start = DateTime.fromISO(event.startsAtUtc).toUTC().toISO() ?? event.startsAtUtc;
  return `${event.series.toLowerCase()}_${session}_${round}_${start}`;
}

type TokenRecord = {
  token: string;
  subscribedSeries?: SeriesId[] | null;
};

async function fetchTokenRecords(): Promise<TokenRecord[]> {
  const snapshot = await firestore.collection(TOKENS_COLLECTION).get();
  const tokens: TokenRecord[] = [];

  snapshot.forEach(doc => {
    const data = doc.data() as TokenRecord | undefined;
    if (!data?.token) {
      return;
    }

    tokens.push({
      token: data.token,
      subscribedSeries: Array.isArray(data.subscribedSeries)
        ? (data.subscribedSeries.filter(series => typeof series === 'string') as SeriesId[])
        : null,
    });
  });

  return tokens;
}

function shouldNotifyToken(record: TokenRecord, series: SeriesId): boolean {
  const { subscribedSeries } = record;
  if (!subscribedSeries) {
    return true;
  }

  return subscribedSeries.includes(series);
}

async function removeInvalidTokens(tokens: string[]) {
  if (!tokens.length) {
    return;
  }

  await Promise.all(
    tokens.map(token => firestore.collection(TOKENS_COLLECTION).doc(token).delete().catch(() => undefined)),
  );
}

function buildNotification(event: ScheduleEvent, offset: ReminderOffset) {
  const offsetLabel = offset === 120 ? '2 hours' : '5 minutes';
  const titleParts = [event.series, event.session];
  const title = titleParts.filter(Boolean).join(' ');
  const roundLabel = event.round.trim();
  const bodyBase = roundLabel.length ? `${roundLabel} starts in ${offsetLabel}.` : `Starts in ${offsetLabel}.`;

  const dataPayload: Record<string, string> = {
    series: event.series,
    session: event.session,
    round: event.round,
    startsAtUtc: event.startsAtUtc,
    offsetMinutes: offset.toString(10),
    eventKey: buildEventKey(event),
  };

  if (event.circuit) {
    dataPayload.circuit = event.circuit;
  }
  if (event.country) {
    dataPayload.country = event.country;
  }

  return {
    notification: {
      title,
      body: bodyBase,
    },
    data: dataPayload,
  };
}

async function fetchSchedule(): Promise<ScheduleEvent[]> {
  if (!SCHEDULE_URL) {
    functions.logger.error('Missing schedule URL, skipping notification run');
    return [];
  }

  const response = await fetch(SCHEDULE_URL);
  if (!response.ok) {
    throw new Error(`Failed to load schedule: ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  return parseSchedule(body);
}

async function markDispatch(
  ref: admin.firestore.DocumentReference,
  update: Record<string, unknown>,
): Promise<void> {
  await ref.update({
    ...update,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export const scheduleEventReminders = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('UTC')
  .onRun(async () => {
    const [events, tokens] = await Promise.all([fetchSchedule(), fetchTokenRecords()]);
    if (!events.length) {
      return null;
    }

    const now = DateTime.utc();
    const tokenValues = tokens.filter(token => token.token);

    for (const event of events) {
      const start = DateTime.fromISO(event.startsAtUtc, { zone: 'utc' });
      if (!start.isValid) {
        continue;
      }

      for (const offset of REMINDER_OFFSETS_MINUTES) {
        const scheduledTime = start.minus(Duration.fromObject({ minutes: offset }));
        const windowEnd = scheduledTime.plus({ minutes: 5 });
        if (now < scheduledTime || now > windowEnd) {
          continue;
        }

        const eventKey = buildEventKey(event);
        const dispatchId = `${eventKey}_${offset}`;
        const dispatchRef = firestore.collection(DISPATCH_COLLECTION).doc(dispatchId);

        const created = await firestore.runTransaction(async tx => {
          const snapshot = await tx.get(dispatchRef);
          if (snapshot.exists) {
            return false;
          }

          tx.create(dispatchRef, {
            status: 'pending',
            eventKey,
            offsetMinutes: offset,
            event,
            scheduledTime: scheduledTime.toISO(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          return true;
        });

        if (!created) {
          continue;
        }

        const targetTokens = tokenValues
          .filter(record => shouldNotifyToken(record, event.series))
          .map(record => record.token);

        if (!targetTokens.length) {
          await markDispatch(dispatchRef, {
            status: 'skipped',
            reason: 'no_targets',
          });
          continue;
        }

        const payload = buildNotification(event, offset);
        const batches: string[][] = [];
        for (let i = 0; i < targetTokens.length; i += 500) {
          batches.push(targetTokens.slice(i, i + 500));
        }

        let successCount = 0;
        let failureCount = 0;
        const invalidTokens: string[] = [];

        for (const batch of batches) {
          const response = await messaging.sendEachForMulticast({
            tokens: batch,
            notification: payload.notification,
            data: payload.data,
          });

          successCount += response.successCount;
          failureCount += response.failureCount;

          response.responses.forEach((res, index) => {
            const error = res.error;
            if (!error) {
              return;
            }

            const code = error.code;
            if (
              code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token'
            ) {
              invalidTokens.push(batch[index]);
            }
          });
        }

        if (invalidTokens.length) {
          await removeInvalidTokens(invalidTokens);
        }

        await markDispatch(dispatchRef, {
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          successCount,
          failureCount,
          targetCount: targetTokens.length,
        });
      }
    }

    return null;
  });
