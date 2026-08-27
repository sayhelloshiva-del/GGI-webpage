import type { ReactNode } from 'react';

import styles from './section-head.module.css';

/** The briefing-document header: section index and label left, headline right. */
export function SectionHead({
  index,
  label,
  children,
  className,
}: {
  index: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={['secHead', className].filter(Boolean).join(' ')}>
      <div className={styles.index}>
        <span className="meta meta--orange">Sec / {index}</span>
        <span className="meta">{label}</span>
      </div>
      <div className={styles.title}>{children}</div>
    </header>
  );
}
