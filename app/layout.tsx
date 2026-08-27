import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter } from 'next/font/google';

import { SUMMIT } from '@/data/summit';
import { CursorSpotlight } from '@/components/cursor-spotlight';
import { Preloader } from '@/components/preloader';

import './globals.css';

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://summit.example.org';
const description =
  '500 Indian students and graduates. 15+ countries. Six global questions. Two days in London. One declaration written by the room.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SUMMIT.name} — ${SUMMIT.city}, ${SUMMIT.dates}`,
    template: `%s — ${SUMMIT.name}`,
  },
  description,
  applicationName: SUMMIT.name,
  keywords: [
    'Global Graduate Summit',
    'GGI',
    'GGS 27',
    'delegate',
    'London 2027',
    'Indian students',
    'graduate summit',
  ],
  openGraph: {
    type: 'website',
    title: `${SUMMIT.name} — ${SUMMIT.city}, ${SUMMIT.dates}`,
    description,
    siteName: SUMMIT.name,
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SUMMIT.name} — ${SUMMIT.city}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: browser extensions inject attributes onto <html>
    // before React hydrates, which otherwise reports as a mismatch in dev.
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Preloader />
        {children}
        <CursorSpotlight />
      </body>
    </html>
  );
}
