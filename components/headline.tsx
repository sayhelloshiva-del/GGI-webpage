import type { ElementType, ReactNode } from 'react';

import { Reveal } from '@/components/reveal';

import styles from './headline.module.css';

/**
 * Display headline with a masked line rise.
 *
 * Each line sits in its own overflow box and travels up from behind it on a
 * stagger, so the headline assembles line by line rather than fading in as a
 * block. Pass one array entry per line — the same breaks the headlines were
 * already authored with.
 */
export function Headline({
  lines,
  as = 'h2',
  className,
  delay = 0,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal
      as={as}
      variant="lines"
      delay={delay}
      className={['display', className].filter(Boolean).join(' ')}
    >
      {lines.map((line, index) => (
        <span key={index} className={styles.mask}>
          <span
            className={styles.line}
            style={{ '--line': index } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Reveal>
  );
}
