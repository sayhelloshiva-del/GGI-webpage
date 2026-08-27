'use client';

import { useEffect, useRef } from 'react';
import styles from './cursor-spotlight.module.css';

export function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return;

    const onMove = (e: MouseEvent) => {
      spot.style.setProperty('--x', `${e.clientX}px`);
      spot.style.setProperty('--y', `${e.clientY}px`);
      spot.style.opacity = '1';
    };

    const onLeave = () => {
      spot.style.opacity = '0';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <div ref={spotRef} className={styles.spotlight} aria-hidden="true" />;
}
