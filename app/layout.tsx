import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Exo_2, Manrope } from 'next/font/google';

const sans = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

const display = Exo_2({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
});

const withAssetPrefix = (path: string) => {
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

export const metadata: Metadata = {
  title: 'RaceSync',
  description: 'Upcoming qualifying & race times (your time zone)',
  icons: {
    icon: withAssetPrefix('/favicon.svg'),
    shortcut: withAssetPrefix('/favicon.svg'),
    apple: withAssetPrefix('/favicon.svg'),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
