'use client';
import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

type Row = {
  series: 'F1'|'F2'|'F3';
  round: string;
  country?: string;
  circuit?: string;
  session: 'Qualifying'|'Race'|'Sprint';
  startsAtUtc: string;     // ISO
};

function normalizeSession(raw: string): Row['session'] | undefined {
  const s = raw.toLowerCase();
  if (s.includes('sprint')) {
    if (s.includes('qual')) return 'Qualifying';
    return 'Sprint';
  }
  if (s.includes('qual')) return 'Qualifying';
  if (s.includes('race')) return 'Race';
  return undefined;
}

function parseICS(ics: string): Row[] {
  const lines = ics.split(/\r?\n/);
  const events: Row[] = [];
  let current: Record<string, string> = {};
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
    } else if (line === 'END:VEVENT') {
      const summary = current.SUMMARY;
      const dtstart = current.DTSTART;
      if (summary && dtstart) {
        if (summary.includes('|')) {
          const parts = summary.split('|');
          if (parts.length >= 5) {
            const [series, round, country, circuit, session] = parts;
            let dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss'Z'", { zone: 'utc' });
            if (!dt.isValid) {
              const tz = current.DTSTART_TZID || 'utc';
              dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
            }
            if (dt.isValid) {
              events.push({
                series: series as Row['series'],
                round,
                country,
                circuit,
                session: session as Row['session'],
                startsAtUtc: dt.toUTC().toISO()!,
              });
            }
          }
        } else {
          const [rawEvent, rawSession] = summary.split(' - ');
          if (rawEvent && rawSession) {
            const session = normalizeSession(rawSession);
            if (session) {
              const eventName = rawEvent.replace(/^RN365\s*/, '').trim();
              const tz = current.DTSTART_TZID || 'utc';
              const dt = DateTime.fromFormat(dtstart, "yyyyMMdd'T'HHmmss", { zone: tz });
              if (dt.isValid) {
                const circuit = current.LOCATION
                  ?.replace(/\\,/g, ',')
                  .replace(/\\\\/g, '\\');
                events.push({
                  series: 'F1',
                  round: eventName,
                  circuit,
                  session,
                  startsAtUtc: dt.toUTC().toISO()!,
                });
              }
            }
          }
        }
      }
    } else {
      const [rawKey, value] = line.split(':', 2);
      if (!rawKey || !value) continue;
      const [key, ...params] = rawKey.split(';');
      current[key] = value;
      if (key === 'DTSTART') {
        const tzParam = params.find(p => p.startsWith('TZID='));
        if (tzParam) current.DTSTART_TZID = tzParam.split('=')[1];
      }
    }
  }
  return events;
}

const BELGRADE_TZ = 'Europe/Belgrade';

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [includeF2F3, setIncludeF2F3] = useState(true);
  const [hours, setHours] = useState<number|undefined>(undefined);

  useEffect(() => {
    async function load() {
      const text = await fetch('./schedule.ics').then(r => r.text());
      const events = parseICS(text);
      setRows(events);
    }
    load().catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let arr = rows;
    if (!includeF2F3) arr = rows.filter(r => r.series === 'F1');
    const limit = hours && hours > 0 ? hours : 24 * 30; // default 30 days
    const to = DateTime.utc().plus({ hours: limit });
    arr = arr.filter(r => DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }) <= to);
    return arr.slice().sort((a, b) => Date.parse(a.startsAtUtc) - Date.parse(b.startsAtUtc));
  }, [rows, includeF2F3, hours]);

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '32px 16px' }}>
      <header
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          background: '#e10600',
          padding: 16,
          borderRadius: 8,
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(20px, 3vw, 28px)',
            margin: 0,
            color: '#fff',
          }}
        >
          Ближайшие квалификации и гонки — F1 / F2 / F3
        </h1>
        <div
          style={{ fontSize: 12, opacity: 0.8, color: '#fff' }}
        >
          Источник: schedule.ics
        </div>
      </header>

      <section
        style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
        }}
      >
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={includeF2F3}
            onChange={e => setIncludeF2F3(e.target.checked)}
          />
          Показывать F2/F3 (если есть данные)
        </label>
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 14, opacity: 0.8 }}>Период:</span>
          <select
            value={String(hours ?? '')}
            onChange={e => {
              const v = e.target.value;
              setHours(v ? Number(v) : undefined);
            }}
          >
            <option value="">30 дней</option>
            <option value="24">24 часа</option>
            <option value="48">48 часов</option>
            <option value="72">72 часа</option>
            <option value="168">7 дней</option>
          </select>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Часовой пояс: <b>{BELGRADE_TZ}</b>
        </div>
      </section>

      <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0 }}>
        {filtered.map((r, i) => {
          const local = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }).setZone(BELGRADE_TZ);
          const utc = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' });
          return (
            <li
              key={i}
              style={{
                border: '1px solid #333',
                borderRadius: 8,
                padding: 16,
                background: '#111',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>{r.series}</div>
                <div style={{ fontSize: 12, opacity: 0.6 }}>
                  UTC: {utc.toFormat('dd LLL yyyy • HH:mm')}
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>
                {r.round}
                {r.country ? ` • ${r.country}` : ''}
              </div>
              <div style={{ opacity: 0.8 }}>
                {r.circuit ? r.circuit + ' • ' : ''}
                {r.session}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>{local.toFormat('ccc, dd LLL yyyy • HH:mm')}</b> ({BELGRADE_TZ})
              </div>
            </li>
          );
        })}
      </ul>

      <footer style={{ marginTop: 24, fontSize: 12, opacity: 0.7 }}>
        Расписание читается из <code>/schedule.ics</code> (обновляется вручную или через GitHub Actions).
      </footer>
    </main>
  );
}
