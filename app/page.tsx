'use client';

import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

type Row = {
  series: 'F1' | 'F2' | 'F3';
  round: string;
  country?: string;
  circuit?: string;
  session: 'Qualifying' | 'Race' | 'Sprint';
  startsAtUtc: string; // ISO
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

function SeriesLogo({ series }: { series: Row['series'] }) {
  const background: Record<Row['series'], string> = {
    F1: '#111',
    F2: '#0090ff',
    F3: '#ff6f00',
  };

  const accent = series === 'F1' ? '#e10600' : '#fff';

  return (
    <svg
      width={56}
      height={24}
      viewBox="0 0 56 24"
      role="img"
      aria-label={`${series} logo`}
      style={{ display: 'block' }}
    >
      <rect x={0} y={0} width={56} height={24} rx={6} fill={background[series]} />
      {series === 'F1' ? (
        <>
          <path d="M7 17h8l1.8-4H8.8l1.4-3.2h7.2L19.2 6H11c-.9 0-1.7.5-2.1 1.3L5.5 16c-.4.9.2 2 1.5 2Z" fill="#fff" />
          <path d="M33.5 6h-8.6l-3.4 7.5c-.6 1.4.3 3 1.8 3h9.6c1.3 0 2.6-.5 3.5-1.4l2.4-2.4c.6-.6.2-1.7-.7-1.7h-7.5l2.5-5Z" fill={accent} />
        </>
      ) : (
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={accent}
          fontFamily="'Arial Black', 'Segoe UI', sans-serif"
          fontSize={14}
          letterSpacing={1}
        >
          {series}
        </text>
      )}
      {series === 'F2' && (
        <path d="M9 7h14l-1.4 3.2H15l-.8 1.8h6.4L19 15H9l3-8Z" fill="#fff" />
      )}
      {series === 'F3' && (
        <path d="M9 7h15c1 0 1.6 1.1 1.1 2l-1 1.8c.4.3.6.9.4 1.4l-1 2.4c-.2.7-.9 1.2-1.7 1.2H10l1.4-3.2h7.2l.4-.8h-6.6l1.2-2.8h7.6l.4-.8H10.8L9 7Z" fill="#fff" />
      )}
    </svg>
  );
}

const SERIES_COLORS: Record<Row['series'], string> = {
  F1: '#e10600',
  F2: '#0090ff',
  F3: '#ff6f00',
};

const SERIES_ACCENT_RGB: Record<Row['series'], string> = {
  F1: '225, 6, 0',
  F2: '0, 144, 255',
  F3: '255, 111, 0',
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
  const [visibleSeries, setVisibleSeries] = useState<Record<Row['series'], boolean>>({
    F1: true,
    F2: true,
    F3: true,
  });
  const [hours, setHours] = useState<number | undefined>(undefined);
  const [userTz, setUserTz] = useState<string>('UTC');

  useEffect(() => {
    async function load() {
      const text = await fetch('./schedule.ics').then(r => r.text());
      const events = parseICS(text);
      setRows(events);
    }
    load().catch(console.error);
    setUserTz(DateTime.local().zoneName);
  }, []);

  const filtered = useMemo(() => {
    let arr = rows.filter(r => visibleSeries[r.series]);
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
  }, [rows, visibleSeries, hours]);

  const nowLocal = DateTime.local().setZone(userTz);
  const activeSeries = (Object.entries(visibleSeries) as [Row['series'], boolean][])
    .filter(([, active]) => active)
    .map(([series]) => series);
  const activeSeriesLabel = activeSeries.length ? activeSeries.join(' · ') : 'Нет';
  const selectedPeriodLabel =
    PERIOD_OPTIONS.find(opt => opt.value === hours)?.label ?? '30 дней';
  const nextEvent = filtered[0];
  const nextLocal = nextEvent
    ? DateTime.fromISO(nextEvent.startsAtUtc, { zone: 'utc' })
        .setZone(userTz)
        .setLocale('ru')
    : null;
  const nextRelative = nextLocal
    ? nextLocal.toRelative({ base: nowLocal, locale: 'ru', style: 'long' })
    : null;
  const nextCountdown =
    nextLocal && nextRelative
      ? nextLocal > nowLocal
        ? `Старт ${nextRelative}`
        : `Финиш ${nextRelative}`
      : null;
  const nextDescriptor = nextEvent
    ? `${nextEvent.round}${nextEvent.country ? ` • ${nextEvent.country}` : ''}`
    : 'Нет событий';
  const heroAccentColor = nextEvent ? SERIES_COLORS[nextEvent.series] : SERIES_COLORS.F1;
  const heroAccentRgb = nextEvent ? SERIES_ACCENT_RGB[nextEvent.series] : SERIES_ACCENT_RGB.F1;

  return (
    <main className="page-shell">
      <section
        className="hero"
        style={
          {
            '--hero-accent': heroAccentColor,
            '--hero-accent-rgb': heroAccentRgb,
          } as CSSProperties
        }
      >
        <span className="hero__badge">
          <span className="hero__pulse" aria-hidden />
          живой календарь уик-эндов
        </span>
        <h1 className="hero__title">Ближайшие квалификации и гонки — F1 / F2 / F3</h1>
        <p className="hero__subtitle">
          Синхронизируйтесь с динамикой гоночных уик-эндов: фильтруйте серии, управляйте
          горизонтом просмотра и следите за временем старта в собственном часовом поясе.
        </p>
        <div className="hero__stats">
          <div className="hero__stat">
            <span className="hero__stat-label">Активные серии</span>
            <span className="hero__stat-value">{activeSeriesLabel}</span>
            <span className="hero__stat-meta">переключите ниже</span>
          </div>
          <div className="hero__stat hero__stat--accent">
            <span className="hero__stat-label">Ближайший старт</span>
            {nextEvent && nextLocal ? (
              <>
                <span className="hero__stat-value">{nextLocal.toFormat('dd LLL • HH:mm')}</span>
                <span className="hero__stat-meta">
                  {nextEvent.series} · {nextDescriptor}
                </span>
                {nextCountdown && (
                  <span className="hero__stat-meta hero__stat-meta--highlight">
                    {nextCountdown}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="hero__stat-value">Нет событий</span>
                <span className="hero__stat-meta">Попробуйте расширить период</span>
              </>
            )}
          </div>
          <div className="hero__stat">
            <span className="hero__stat-label">Событий в окне</span>
            <span className="hero__stat-value">{filtered.length}</span>
            <span className="hero__stat-meta">{selectedPeriodLabel}</span>
          </div>
        </div>
      </section>

      <section className="control-panel">
        <div className="control-panel__group">
          <span className="control-panel__label">Серии</span>
          <div className="series-chips">
            {(['F1', 'F2', 'F3'] as Row['series'][]).map(series => (
              <label
                key={series}
                className="series-chip"
                data-active={visibleSeries[series]}
                style={
                  {
                    '--chip-color': SERIES_COLORS[series],
                    '--chip-rgb': SERIES_ACCENT_RGB[series],
                  } as CSSProperties
                }
              >
                <input
                  type="checkbox"
                  checked={visibleSeries[series]}
                  onChange={() =>
                    setVisibleSeries(prev => ({
                      ...prev,
                      [series]: !prev[series],
                    }))
                  }
                />
                <span className="series-chip__indicator" aria-hidden />
                <span>{series}</span>
              </label>
            ))}
          </div>
          <span className="control-panel__caption">
            Сочетайте разные формулы, чтобы поймать общий ритм гоночного уик-энда.
          </span>
        </div>

        <div className="control-panel__group">
          <span className="control-panel__label">Период обзора</span>
          <div className="period-buttons">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.label}
                type="button"
                className="period-button"
                data-active={hours === opt.value}
                onClick={() => setHours(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="control-panel__caption">
            Окно прокручивается вместе с настоящим моментом — расширьте диапазон, чтобы увидеть
            больше.
          </span>
        </div>

        <div className="control-panel__group">
          <span className="control-panel__label">Часовой пояс</span>
          <div className="timezone-chip">
            <span className="timezone-chip__dot" aria-hidden />
            <span>{userTz}</span>
          </div>
          <span className="control-panel__caption">
            Все времена на карточках автоматически приведены к вашему устройству.
          </span>
        </div>
      </section>

      <ul className="events-grid">
        {filtered.map((r, index) => {
          const accentColor = SERIES_COLORS[r.series];
          const accentRgb = SERIES_ACCENT_RGB[r.series];
          const local = DateTime.fromISO(r.startsAtUtc, { zone: 'utc' }).setZone(userTz);
          const localized = local.setLocale('ru');
          const isoLocal = local.toISO();
          const timeLabel = localized.toFormat('HH:mm');
          const dayLabel = localized.toFormat('ccc');
          const dateLabel = localized.toFormat('dd LLL');
          const tzLabel = localized.toFormat('ZZZZ');
          const relative = localized.toRelative({ base: nowLocal, locale: 'ru', style: 'long' });
          const countdown = relative
            ? localized > nowLocal
              ? `Старт ${relative}`
              : `Финиш ${relative}`
            : 'По расписанию';

          return (
            <li
              key={`${r.startsAtUtc}-${index}`}
              className="event-card"
              style={
                {
                  '--accent-color': accentColor,
                  '--accent-rgb': accentRgb,
                } as CSSProperties
              }
            >
              <div className="event-card__inner">
                <div className="event-card__top">
                  <div className="event-card__series">
                    <div className="event-card__logo">
                      <SeriesLogo series={r.series} />
                    </div>
                    <span className="event-card__series-pill">{r.series}</span>
                  </div>
                  <time className="event-card__datetime" dateTime={isoLocal ?? undefined}>
                    <span className="event-card__time">{timeLabel}</span>
                    <span className="event-card__date">
                      {dayLabel}, {dateLabel}
                    </span>
                    <span className="event-card__tz">{tzLabel}</span>
                  </time>
                </div>
                <div className="event-card__title">
                  <span>{r.round}</span>
                  {r.country ? <span className="event-card__country">{r.country}</span> : null}
                </div>
                <div className="event-card__meta">
                  {r.circuit ? <span>{r.circuit}</span> : null}
                  <span>{r.session}</span>
                </div>
                <div className="event-card__countdown">
                  <span className="event-card__countdown-dot" aria-hidden />
                  <span>{countdown}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
