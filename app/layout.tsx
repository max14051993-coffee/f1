import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Exo_2, Manrope } from 'next/font/google';
import { withAssetPrefix } from '../lib/assets';

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

// Applies the stored (or system) theme before first paint to avoid a light/dark flash.
// Keep the storage key in sync with lib/theme.ts.
const themeInitScript = `(function(){try{var t=localStorage.getItem('schedule-theme');var l=t==='light'||(!t&&window.matchMedia('(prefers-color-scheme: light)').matches);var v=l?'light':'dark';var d=document.documentElement;d.dataset.theme=v;d.style.colorScheme=v;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
