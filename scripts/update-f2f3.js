const fs = require('fs');

async function fetchSeries(series) {
  const year = new Date().getFullYear();
  const url = `https://api.openf1.org/v1/schedule?series=${series}&year=${year}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Failed to fetch ${series} schedule: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.map(item => ({
      series: series.toUpperCase(),
      round: item.round ?? '',
      country: item.country ?? '',
      circuit: item.circuit_short_name ?? '',
      session: item.session_name ?? '',
      startsAtUtc: item.start_time ?? ''
    }));
  } catch (err) {
    console.error(`Error fetching ${series} schedule`, err);
    return [];
  }
}

async function main() {
  const f2 = await fetchSeries('f2');
  const f3 = await fetchSeries('f3');
  const combined = [...f2, ...f3];
  fs.writeFileSync('public/f2f3.json', JSON.stringify(combined, null, 2) + '\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
