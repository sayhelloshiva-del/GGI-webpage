import { PROGRAMME } from '@/data/programme';
import { Reveal } from '@/components/reveal';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';

import styles from './programme.module.css';

export function Programme() {
  return (
    <section id="programme" className="tone-ink section">
      <div className="shell inner">
        <SectionHead index="04" label="How the two days run">
          <Headline
            className="d1"
            lines={[
              'Two days.',
              <>
                No <span className="gradientText">passengers</span>.
              </>,
            ]}
          />
          <p className="body">
            Indicative running order. Timings follow speaker confirmation — treat the
            clock times below as indicative.
          </p>
        </SectionHead>

        <ol className={styles.timeline}>
          {PROGRAMME.map((slot, index) => (
            <Reveal as="li" key={slot.title} delay={index * 60} className={styles.slot}>
              <div className={styles.marker} aria-hidden="true">
                <span className={styles.node} />
              </div>

              <div className={styles.when}>
                <span className="meta meta--orange">{slot.day}</span>
                <span className="meta">{slot.part}</span>
                <span className={`meta ${styles.time}`}>{slot.time}</span>
              </div>

              <div className={styles.what}>
                <h3 className={`display ${styles.title}`}>{slot.title}</h3>
                <p className={styles.body}>{slot.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
