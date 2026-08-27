import dynamic from 'next/dynamic';

import { Application } from '@/components/application';
import { ClosingNight } from '@/components/closing-night';
import { Declaration } from '@/components/declaration';
import { Faq } from '@/components/faq';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/hero';
import { Intro } from '@/components/intro';
import { Navigation } from '@/components/navigation';
import { Partners } from '@/components/partners';
import { Programme } from '@/components/programme';
import { Speakers } from '@/components/speakers';
import { Stats } from '@/components/stats';
import { TrackMatcher } from '@/components/track-matcher';
import { Tracks } from '@/components/tracks';

/** Nothing on the first screen depends on it — load its JS after the page. */
const MobileCta = dynamic(() =>
  import('@/components/mobile-cta').then((mod) => mod.MobileCta),
);

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Stats />
        <Intro />
        <Tracks />
        <TrackMatcher />
        <Programme />
        <Speakers />
        <Declaration />
        <ClosingNight />
        <Application />
        <Faq />
        <Partners />
      </main>
      <Footer />
      <MobileCta />
    </>
  );
}
