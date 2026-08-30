import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { SUMMIT } from '@/data/summit';

export const alt = `${SUMMIT.name} — ${SUMMIT.city}, ${SUMMIT.dates}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#080808';
const PAPER = '#f4f1ea';
const SIGNAL = '#ff8500';
const MUTED = '#a7a49d';
const RULE = 'rgba(244, 241, 234, 0.16)';

const asset = (file: string) => join(process.cwd(), 'app', '_og', file);

export default async function OpengraphImage() {
  const [font, logo] = await Promise.all([
    readFile(asset('barlow-condensed-800.ttf')),
    readFile(join(process.cwd(), 'public', 'ggi-logo.png')),
  ]);

  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const meta = { fontSize: 17, letterSpacing: '0.22em', color: MUTED };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 76,
          backgroundColor: INK,
          backgroundImage: `linear-gradient(125deg, rgba(214,58,0,0.30) 0%, rgba(8,8,8,0) 58%)`,
          color: PAPER,
          fontFamily: 'Barlow Condensed',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 26,
              borderBottom: `1px solid ${RULE}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={65} height={44} alt="" />
            <div style={meta}>{SUMMIT.shorthand.toUpperCase()}</div>
          </div>

          <div style={{ ...meta, color: SIGNAL, marginTop: 34 }}>
            {`${SUMMIT.parent.toUpperCase()} PRESENTS`}
          </div>
          <div style={{ ...meta, marginTop: 14 }}>
            {[
              SUMMIT.edition.toUpperCase(),
              SUMMIT.city.toUpperCase(),
              SUMMIT.datesShort,
            ].join(' · ')}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 98,
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
          }}
        >
          <div style={{ display: 'flex' }}>THE ROOM WHERE</div>
          <div style={{ display: 'flex' }}>
            <div>THE NEXT</div>
            <div style={{ color: SIGNAL, marginLeft: '0.28em' }}>GENERATION</div>
          </div>
          <div style={{ display: 'flex' }}>TURNS UP.</div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: 26,
            borderTop: `1px solid ${RULE}`,
          }}
        >
          <div style={meta}>500 DELEGATES · 15+ COUNTRIES · SIX TRACKS · ONE DECLARATION</div>
          <div style={{ ...meta, color: PAPER }}>APPLY FOR A DELEGATE PLACE</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: 'Barlow Condensed', data: font, weight: 800, style: 'normal' }],
    },
  );
}
