'use client';

import { useEffect, useRef, useState } from 'react';

import { SUMMIT } from '@/data/summit';
import { TRACKS } from '@/data/tracks';
import { Logo } from '@/components/logo';

import styles from './preloader.module.css';

/** Held open at least this long so the panel never flashes on a warm cache. */
const MIN_MS = 700;
/** Never held longer than this, whatever the network is doing. */
const MAX_MS = 2400;
/** Matches the exit transition in the stylesheet. */
const EXIT_MS = 640;

/**
 * First-load panel: the summit issuing you a credential.
 *
 * Progress tracks the real document load — it is not a fixed timer — with a
 * floor so it cannot flash and a ceiling so a slow asset can never hold the
 * page hostage. If JavaScript never runs, a CSS failsafe animation clears the
 * panel on its own (see .panel in the stylesheet).
 */
export function Preloader() {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState<'busy' | 'leaving' | 'gone'>('busy');
  const trackIndex = Math.min(
    TRACKS.length - 1,
    Math.floor((progress / 100) * TRACKS.length),
  );
  const startedAt = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    startedAt.current = performance.now();

    let loaded = document.readyState === 'complete';
    const onLoad = () => {
      loaded = true;
    };
    if (!loaded) window.addEventListener('load', onLoad, { once: true });

    document.body.dataset.preloading = 'true';

    let frame = 0;
    let current = 0;
    let done = false;
    let exitTimer: number | undefined;

    const finish = () => {
      if (done) return;
      done = true;
      window.cancelAnimationFrame(frame);
      setProgress(100);
      setState('leaving');
      delete document.body.dataset.preloading;
      exitTimer = window.setTimeout(() => setState('gone'), reduced ? 0 : EXIT_MS);
    };

    /*
     * The ceiling runs on a timer, not on the rAF loop: rAF is suspended
     * entirely in a background tab, so a cap checked only inside tick() would
     * never fire for someone who opened the page in a new tab and looked away.
     */
    const ceilingTimer = window.setTimeout(finish, MAX_MS);

    const tick = () => {
      const elapsed = performance.now() - startedAt.current;

      // Creep toward 92% on a curve while loading, then race to 100 once the
      // document is done — so the number always means something.
      const ceiling = loaded ? 100 : 92;
      const target = Math.min(ceiling, (1 - Math.exp(-elapsed / 620)) * 100);
      current += (target - current) * 0.12;
      setProgress(current);

      if (loaded && current > 99 && elapsed > MIN_MS) {
        finish();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('load', onLoad);
      window.clearTimeout(ceilingTimer);
      window.clearTimeout(exitTimer);
      delete document.body.dataset.preloading;
    };
  }, []);

  if (state === 'gone') return null;

  return (
    <div
      className={`${styles.panel} ${state === 'leaving' ? styles.leaving : ''}`}
      aria-hidden="true"
    >
      <div className={styles.rail}>
        <Logo height={26} priority />
        <span className="meta">{SUMMIT.shorthand}</span>
      </div>

      <div className={styles.middle}>
        <p className="meta meta--orange">Allocating the room</p>
        <p className={`display display--black ${styles.word}`}>
          Delegate
          <br />
          <span className={styles.wordAccent}>credential</span>
        </p>
      </div>

      <div className={styles.foot}>
        <div className={styles.status}>
          <span className="meta">
            Track {TRACKS[trackIndex]?.id} / {TRACKS[trackIndex]?.name}
          </span>
          <span className={`display ${styles.count}`}>
            {String(Math.round(progress)).padStart(3, '0')}
            <span className={styles.pct}>%</span>
          </span>
        </div>

        <div className={styles.track}>
          <span className={styles.fill} style={{ transform: `scaleX(${progress / 100})` }} />
        </div>

        <div className={styles.status}>
          <span className="meta">
            {SUMMIT.city} — {SUMMIT.datesShort}
          </span>
          <span className="meta">{SUMMIT.edition}</span>
        </div>
      </div>
    </div>
  );
}
