import type { Metadata } from 'next';
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

export const metadata: Metadata = {
  title: 'F1/F2/F3 schedule',
  description: 'Upcoming qualifying & race times (your time zone)',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${sans.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
