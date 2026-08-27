'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Hero parallax, desktop only.
 *
 * Opted into by capability, not by width alone: a fine pointer, a hover-capable
 * device, a viewport wide enough to matter, and no reduced-motion preference.
 * Everywhere else this renders a plain div and never attaches a scroll listener.
 */
export function ParallaxLayer({
  children,
  strength = 0.14,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const capable = window.matchMedia(
      '(min-width: 1024px) and (hover: hover) and (pointer: fine)',
    );
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!capable.matches || reduced.matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = Math.min(window.scrollY, window.innerHeight) * strength;
      node.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      node.style.transform = '';
    };
  }, [strength]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}
