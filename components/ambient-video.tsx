'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './ambient-video.module.css';

type Props = {
  src: string;
  poster: string;
  /** Describes the footage for the pause control's accessible name. */
  label: string;
  className?: string;
  videoClassName?: string;
};

/**
 * Looping background footage with a pause control.
 *
 * Autoplay is started in an effect rather than declared on the element: the
 * decision depends on prefers-reduced-motion, which is only knowable on the
 * client. Anyone who has asked for less motion gets the poster frame and a
 * play control instead.
 */
export function AmbientVideo({ src, poster, label, className, videoClassName }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    video.play().then(
      () => setPlaying(true),
      () => setPlaying(false), // autoplay refused — the poster stands in
    );
  }, []);

  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true), () => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <video
        ref={ref}
        src={src}
        poster={poster}
        className={[styles.video, videoClassName].filter(Boolean).join(' ')}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
      />
      <button type="button" className={styles.toggle} onClick={toggle}>
        {playing ? 'Pause' : 'Play'}
        <span className={styles.srOnly}>{` ${label}`}</span>
      </button>
    </div>
  );
}
