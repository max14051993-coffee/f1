/**
 * Absolute origin+basePath of the deployed site.
 * Mirrors the basePath derivation in next.config.js; override with
 * NEXT_PUBLIC_SITE_URL when deploying elsewhere (custom domain, preview).
 */
const repository = process.env.GITHUB_REPOSITORY || '';
const [owner = '', name] = repository.split('/');
const resolvedOwner = owner || 'max14051993-coffee';
const isUserSite = Boolean(name && name === `${resolvedOwner}.github.io`);
const basePath = !name ? '/f1' : isUserSite ? '' : `/${name}`;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${resolvedOwner}.github.io${basePath}`;
