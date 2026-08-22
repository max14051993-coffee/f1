import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Exo_2, Manrope } from 'next/font/google';
import { withAssetPrefix } from '../lib/assets';
import { SITE_URL } from '../lib/site-url';
import { ScheduleJsonLd } from './schema-org';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RaceSync — F1 · F2 · F3 · MotoGP race times in your timezone',
    template: '%s | RaceSync',
  },
  description:
    'Upcoming F1, F2, F3 and MotoGP qualifying, sprint and race times automatically converted to your time zone.',
  alternates: { canonical: withAssetPrefix('/') },
  openGraph: {
    type: 'website',
    siteName: 'RaceSync',
    url: withAssetPrefix('/'),
    title: 'RaceSync — live weekend calendar',
    description:
      'F1, F2, F3 and MotoGP sessions converted to your timezone. Filter series, pick a window, catch every lights-out.',
    images: [{ url: withAssetPrefix('/og-image.png'), width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RaceSync — live weekend calendar',
    description: 'F1, F2, F3 and MotoGP sessions in your timezone.',
    images: [withAssetPrefix('/og-image.png')],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Applies the stored (or system) theme before first paint to avoid a light/dark flash.
// Keep the storage key in sync with lib/theme.ts.
const themeInitScript = `(function(){try{var t=localStorage.getItem('schedule-theme');var l=t==='light'||(!t&&window.matchMedia('(prefers-color-scheme: light)').matches);var v=l?'light':'dark';var d=document.documentElement;d.dataset.theme=v;d.style.colorScheme=v;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ScheduleJsonLd />
        {children}
      </body>
    </html>
  );
}
