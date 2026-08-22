/**
 * Notifies IndexNow-participating search engines (Bing, Yandex, Seznam, Naver)
 * that site URLs are available for (re)crawling.
 *
 * Protocol: https://www.indexnow.org/documentation
 * Requires public/<key>.txt to be reachable at <SITE_URL>/<key>.txt.
 *
 * Usage:
 *   node scripts/notify-indexnow.mjs [--dry-run]
 *
 * With no arguments it submits the homepage and the sitemap URL. Extra URLs can
 * be passed positionally.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const repository = process.env.GITHUB_REPOSITORY || '';
const [owner = '', name] = repository.split('/');
const resolvedOwner = owner || 'max14051993-coffee';
const isUserSite = Boolean(name && name === `${resolvedOwner}.github.io`);
const basePath = !name ? '/f1' : isUserSite ? '' : `/${name}`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${resolvedOwner}.github.io${basePath}`;

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function parseArgs(argv) {
  const urls = [];
  let dryRun = false;
  for (const arg of argv) {
    if (arg === '--dry-run') dryRun = true;
    else urls.push(arg);
  }
  return { urls, dryRun };
}

async function main() {
  const { urls: extraUrls, dryRun } = parseArgs(process.argv.slice(2));

  const keyFile = path.join('public', `${process.env.INDEXNOW_KEY}.txt`);
  let key;
  try {
    key = (await readFile(keyFile, 'utf8')).trim();
  } catch {
    console.error(`Key file missing: ${keyFile} (set INDEXNOW_KEY to the key file stem)`);
    process.exit(1);
  }

  const urlList = [extraUrls.length > 0 ? extraUrls : [`${SITE_URL}/`, `${SITE_URL}/sitemap.xml`]].flat();

  const payload = {
    host: `${resolvedOwner}.github.io`,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList,
  };

  if (dryRun) {
    console.log(`[dry-run] would POST ${urlList.length} URL(s) to ${INDEXNOW_ENDPOINT}`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });

  // 200/202 = accepted; 400/403/422 = key or payload problem; 429 = slow down.
  console.log(`IndexNow responded ${response.status} for ${urlList.length} URL(s)`);
  if (!response.ok) {
    console.error(await response.text().catch(() => ''));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
