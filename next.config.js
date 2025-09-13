/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY || '';
const parts = repo.split('/');
const owner = process.env.GITHUB_REPOSITORY_OWNER || parts[0] || '';
const repoName = parts[1] || '';
const isUserSite = repoName === `${owner}.github.io`;
const basePath = isUserSite ? '' : (repoName ? `/${repoName}` : '');

module.exports = {
  output: 'export',
  basePath,
  assetPrefix: basePath || '',
  images: { unoptimized: true },
  trailingSlash: true,
};
