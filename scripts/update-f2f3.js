const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { DateTime } = require('luxon');

const CACHE_DIR = path.join(__dirname, '..', 'cache');
const REVALIDATE_MS = 15 * 60 * 1000; // 15 minutes

async function fetchWithCache(url, key) {
  await fs.promises.mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, key);
  try {
    const stat = await fs.promises.stat(file);
    if (Date.now() - stat.mtimeMs < REVALIDATE_MS) {
      return await fs.promises.readFile(file, 'utf8');
    }
  } catch (_) {}

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'f2f3-schedule-bot/1.0' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    await fs.promises.writeFile(file, text);
    return text;
  } catch (err) {
    console.error(`Failed to fetch ${url}`, err);
    try {
      return await fs.promises.readFile(file, 'utf8');
    } catch (_) {
      return '';
    }
  }
}

function parseNextData(html) {
  const match = html.match(/__NEXT_DATA__=(.*);<\/script>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (_) {
    return null;
  }
}

async function getCalendar(series) {
  const url = series === 'f2'
    ? 'https://www.fiaformula2.com/Results/CurrentSeason'
    : 'https://www.fiaformula3.com/Results/CurrentSeason';
  const html = await fetchWithCache(url, `${series}-calendar.html`);
  const data = parseNextData(html);
  const events = data?.props?.pageProps?.results || [];
  return events.map(evt => ({
    round: evt?.meeting?.name || evt?.title || '',
    country: evt?.meeting?.countryName || '',
    circuit: evt?.circuit?.shortName || '',
    slug: evt?.meeting?.slug || '',
    motorsportUrl: evt?.meeting?.motorsportUrl || ''
  }));
}

function parseMotorsportTimes(html) {
  const $ = cheerio.load(html);
  const sessions = [];
  $('table tbody tr').each((_, tr) => {
    const tds = $(tr).find('td');
    const session = tds.eq(0).text().trim();
    const time = tds.eq(1).text().trim();
    if (!session || !time) return;
    const dt = DateTime.fromISO(time, { zone: 'utc', setZone: true });
    if (dt.isValid) {
      sessions.push({ session, startsAtUtc: dt.toUTC().toISO() });
    }
  });
  return sessions;
}

async function getSessions(series, event) {
  if (!event.motorsportUrl) return [];
  const html = await fetchWithCache(event.motorsportUrl, `${series}-${event.slug}.html`);
  if (!html) return [];
  return parseMotorsportTimes(html);
}

async function main() {
  try {
    const seriesList = ['f2', 'f3'];
    const combined = [];
    for (const series of seriesList) {
      const calendar = await getCalendar(series);
      for (const evt of calendar) {
        const sessions = await getSessions(series, evt);
        sessions.forEach(s => {
          combined.push({
            series: series.toUpperCase(),
            round: evt.round,
            country: evt.country,
            circuit: evt.circuit,
            session: s.session,
            startsAtUtc: s.startsAtUtc
          });
        });
      }
    }

    combined.sort((a, b) => {
      const aTime = DateTime.fromISO(a.startsAtUtc, { zone: 'utc' }).setZone('Europe/Belgrade');
      const bTime = DateTime.fromISO(b.startsAtUtc, { zone: 'utc' }).setZone('Europe/Belgrade');
      return aTime.toMillis() - bTime.toMillis();
    });

    await fs.promises.writeFile(
      path.join(__dirname, '..', 'public', 'f2f3.json'),
      JSON.stringify(combined, null, 2) + '\n'
    );
  } catch (err) {
    console.error('Failed to update schedule', err);
  }
}