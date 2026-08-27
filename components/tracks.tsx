'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { TRACKS } from '@/data/tracks';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';
import { TrackCard } from '@/components/track-card';

import styles from './tracks.module.css';

export function Tracks() {
  const [openId, setOpenId] = useState<string | null>(null);
  const hoverEnabled = useRef(false);

  useEffect(() => {
    hoverEnabled.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const preview = useCallback((id: string) => {
    if (hoverEnabled.current) setOpenId(id);
  }, []);

  const clearPreview = useCallback(() => {
    if (hoverEnabled.current) setOpenId(null);
  }, []);

  return (
    <section id="tracks" className="tone-ink section">
      <div className="shell inner">
        <SectionHead index="02" label="The six tracks">
          <Headline
            className="d1"
            lines={[
              'Six questions.',
              <>
                One <span className="gradientText">room</span> each.
              </>,
            ]}
          />
          <p className="body">
            Every delegate is allocated to one track and works it for two days. Open a
            track to see what its group is expected to produce.
          </p>
        </SectionHead>

        <ol className={styles.list} onMouseLeave={clearPreview}>
          {TRACKS.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              open={openId === track.id}
              onToggle={() => setOpenId((current) => (current === track.id ? null : track.id))}
              onPreview={() => preview(track.id)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
