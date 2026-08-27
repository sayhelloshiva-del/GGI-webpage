import { STAT_STORY } from '@/data/summit';
import { Reveal } from '@/components/reveal';

import styles from './stats.module.css';

export function Stats() {
  return (
    <section id="summit" className="tone-ink section">
      <div className="shell inner">
        <h2 className="srOnly">The summit in numbers</h2>
        <ol className={styles.list}>
          {STAT_STORY.map((stat, index) => (
            <li key={stat.value} className={styles.row}>
              <Reveal variant="numeral" delay={index * 60} className={styles.figure}>
                <span className={`display display--black ${styles.value}`}>{stat.value}</span>
              </Reveal>
              <Reveal delay={index * 60 + 90} className={styles.labelWrap}>
                <span className="meta">Fact {String(index + 1).padStart(2, '0')}</span>
                <p className={`display ${styles.label}`}>{stat.label}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
