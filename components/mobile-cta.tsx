'use client';

import { useEffect, useState } from 'react';

import styles from './mobile-cta.module.css';

/**
 * Sticky mobile apply bar.
 *
 * Appears once the hero is behind you and gets out of the way whenever the
 * application section or the footer is on screen, so it never sits on top of
 * the thing it is pointing at.
 */
export function MobileCta({ hideNear = ['apply', 'site-footer'] }: { hideNear?: string[] }) {
  const [pastHero, setPastHero] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setPastHero(window.scrollY > window.innerHeight * 0.55);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const targets = hideNear
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));

    if (!targets.length || typeof IntersectionObserver === 'undefined') return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        });
        setBlocked(visible.size > 0);
      },
      { rootMargin: '0px 0px -12% 0px' },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [hideNear]);

  const shown = pastHero && !blocked;

  return (
    <div
      className={`${styles.bar} ${shown ? styles.barShown : ''}`}
      aria-hidden={!shown}
      {...(shown ? {} : { inert: true })}
    >
      <div className={styles.info}>
        <span className="meta meta--fg">500 places</span>
        <span className="meta">Applications open</span>
      </div>
      <a className={`btn btnPrimary ${styles.button}`} href="#apply" tabIndex={shown ? 0 : -1}>
        Apply <span className="arrow" aria-hidden="true">→</span>
      </a>
    </div>
  );
}
