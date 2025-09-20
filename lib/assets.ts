export const withAssetPrefix = (path: string) => {
  const prefix = process.env.NEXT_PUBLIC_ASSET_PREFIX?.trim();

  if (!prefix) {
    return path;
  }

  const sanitizedPrefix = prefix.replace(/^\/+|\/+$/g, '');

  if (!sanitizedPrefix) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, '');

  return `/${sanitizedPrefix}/${normalizedPath}`;
};
