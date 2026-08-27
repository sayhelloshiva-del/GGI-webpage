'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

type Variant = 'fade' | 'numeral' | 'mask' | 'wipe' | 'lines';

const VARIANT_CLASS: Record<Variant, string> = {
  fade: 'reveal',
  numeral: 'revealNum',
  mask: 'revealMask',
  wipe: 'wipe',
  // Styling lives in headline.module.css; this only needs the is-in hook.
  lines: 'revealLines',
};

type RevealProps = {
  children: ReactNode;
  /** Element to render. Defaults to a div. */
  as?: ElementType;
  variant?: Variant;
  /** Stagger in milliseconds. */
  delay?: number;
  className?: string;
  id?: string;
};

/**
 * Scroll reveal. One IntersectionObserver per element, disconnected the moment
 * it fires — nothing observes anything after it has been seen. The animation
 * itself is CSS, and `prefers-reduced-motion` neutralises it in globals.css.
 */
export function Reveal({
  children,
  as: Tag = 'div',
  variant = 'fade',
  delay = 0,
  className,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    // No IntersectionObserver (very old browsers): show everything rather than
    // leaving the page blank. Deferred a tick so it never renders in the effect.
    if (typeof IntersectionObserver === 'undefined') {
      const id = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  const classes = [VARIANT_CLASS[variant], shown ? 'is-in' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      ref={ref}
      id={id}
      className={classes}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
