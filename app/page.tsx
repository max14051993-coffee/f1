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

const BELGRADE_TZ = 'Europe/Belgrade';

export default function Home() {
  const [rows, setRows] = useState<Row[]>([]);
  const [includeF2F3, setIncludeF2F3] = useState(true);
  const [hours, setHours] = useState<number|undefined>(undefined);

  useEffect(() => {
    const now = DateTime.utc().toISO();
    const in180 = DateTime.utc().plus({ days: 180 }).toISO();
    const url = `https://api.openf1.org/v1/sessions?date_start>=${encodeURIComponent(now)}&date_start<=${encodeURIComponent(in180)}&session_name=Qualifying&session_name=Race&session_name=Sprint&csv=false`;

    async function load() {
      const [f1Res, f2f3Res] = await Promise.all([
        fetch(url),
        fetch('./f2f3.json').catch(() => undefined),
      ]);
      const f1Data = await f1Res.json();
      const f1: Row[] = (f1Data || []).map((s: any) => ({
        series: 'F1',
        round: s.meeting_name,
        country: s.country_name,
        circuit: s.circuit_short_name || s.circuit_name,
        session: s.session_name,
        startsAtUtc: s.date_start
      }));

      let extra: Row[] = [];
      if (f2f3Res && f2f3Res.ok) {
        try {
          const json = await f2f3Res.json();
          extra = Array.isArray(json) ? json : [];
        } catch {}
      }

      setRows([...f1, ...extra]);
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
        <a
          href="https://openf1.org"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 12, opacity: 0.8, color: '#fff', textDecoration: 'none' }}
        >
          Источник F1: OpenF1
        </a>
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
        F2/F3 данные читаются из <code>/f2f3.json</code> (обновляется вручную или через GitHub Actions).
      </footer>
    </main>
  );
}
