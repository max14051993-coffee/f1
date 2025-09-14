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

const SERIES_COLORS: Record<Row['series'], string> = {
  F1: '#e10600',
  F2: '#0090ff',
  F3: '#ff6f00',
};

const PERIOD_OPTIONS: { label: string; value?: number }[] = [
  { label: '24 часа', value: 24 },
  { label: '48 часов', value: 48 },
  { label: '72 часа', value: 72 },
  { label: '7 дней', value: 168 },
  { label: '30 дней', value: undefined },
];

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
    const now = DateTime.utc();
    const limit = hours && hours > 0 ? hours : 24 * 30; // default 30 days
    const from = now.minus({ hours: 24 });
    const to = now.plus({ hours: limit });
    arr = arr.filter(r => {
      const dt = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' });
      return dt >= from && dt <= to;
    });
    return arr
      .slice()
      .sort((a, b) => Date.parse(a.startsAtUtc) - Date.parse(b.startsAtUtc));
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
      </header>

      <section
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 20,
          padding: '12px 16px',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            role="switch"
            aria-checked={includeF2F3}
            onClick={() => setIncludeF2F3(v => !v)}
            style={{
              position: 'relative',
              width: 40,
              height: 20,
              border: 'none',
              borderRadius: 10,
              background: includeF2F3 ? '#e10600' : '#ccc',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 2,
                left: includeF2F3 ? 22 : 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
              }}
            />
          </button>
          <span>Показывать F2/F3 (если есть данные)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8 }}>Период:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setHours(opt.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 12,
                  border: '1px solid #ccc',
                  background: hours === opt.value ? '#e10600' : '#fff',
                  color: hours === opt.value ? '#fff' : '#000',
                  cursor: 'pointer',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Часовой пояс: <b>{BELGRADE_TZ}</b>
        </div>
      </section>

      <ul
        style={{
          display: 'grid',
          gap: 16,
          listStyle: 'none',
          padding: 0,
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        }}
      >
        {filtered.map((r, i) => {
          const local = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }).setZone(BELGRADE_TZ);
          const utc = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' });
          return (
            <li
              key={i}
              style={{
                borderTop: `4px solid ${SERIES_COLORS[r.series]}`,
                borderRadius: 12,
                padding: 20,
                background: '#fff',
                color: '#111',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: SERIES_COLORS[r.series] }}>{r.series}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>
                  UTC: {utc.toFormat('dd LLL yyyy • HH:mm')}
                </span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {r.round}
                {r.country ? ` • ${r.country}` : ''}
              </div>
              <div style={{ opacity: 0.8 }}>
                {r.circuit ? r.circuit + ' • ' : ''}
                {r.session}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  fontSize: 14,
                  background: '#f5f5f5',
                  padding: '8px 12px',
                  borderRadius: 8,
                  alignSelf: 'flex-start',
                }}
              >
                <b>{local.toFormat('ccc, dd LLL yyyy • HH:mm')}</b> ({BELGRADE_TZ})
              </div>
            </li>
          );
        })}
      </ul>

    </main>
  );
}
