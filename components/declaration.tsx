import { Reveal } from '@/components/reveal';

import styles from './declaration.module.css';

/** Abstract signature strokes. Not a seal, not a crest, not a signature of any
 *  real person — six marks standing in for a room that signs its own document. */
const SIGNATURES = [
  'M2 22c8-14 12-18 16-14s-2 16 4 16 12-16 18-16',
  'M2 26c6 0 8-18 14-18s4 20 10 20 10-14 16-14',
  'M2 18c10 8 14-14 20-8s2 18 8 18 8-10 14-12',
  'M2 24c6-16 14-16 18-8s0 14 6 14 10-12 16-12',
  'M2 20c8 2 10-12 16-8s2 16 8 16 10-8 16-10',
  'M2 28c4-12 10-20 16-12s0 16 6 16 10-10 16-12',
];

export function Declaration() {
  return (
    <section id="declaration" className="tone-paper section">
      <div className="shell inner">
        <div className={styles.head}>
          <span className="meta meta--orange">The Declaration / GGS.27</span>

          <div className={styles.sequence}>
            <Reveal as="h2" className={`display d1 ${styles.line}`}>
              Most summits
              <br />
              end with
              <br />
              a photograph.
            </Reveal>

            <Reveal
              as="p"
              delay={140}
              className={`display d1 ${styles.line} ${styles.lineAccent}`}
            >
              This one
              <br />
              ends with
              <br />
              a document.
            </Reveal>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.copy}>
            <p className="lede">Every delegate votes on the final text.</p>
            <p className="lede">Every delegate signs it.</p>
            <p className={`body ${styles.note}`}>
              It goes to the governments, institutions and press represented in the room,
              carrying 500 names from 15 countries. What it says is decided by what the
              room votes for on the day.
            </p>
            <p className={`body ${styles.note}`}>
              You leave as part of the delegation. The network is the half of this that
              lasts.
            </p>
          </div>

          <Reveal variant="mask" className={styles.docWrap}>
            <div className={`frame ${styles.doc}`}>
              <div className={styles.docHead}>
                <span className="meta meta--orange">Draft 03</span>
                <span className="meta">Ratified by the floor</span>
              </div>

              <p className={`display ${styles.docTitle}`}>
                The London
                <br />
                Declaration
              </p>

              <div className={styles.docLines} aria-hidden="true">
                {Array.from({ length: 7 }).map((_, index) => (
                  <span key={index} style={{ width: `${[100, 94, 97, 88, 99, 91, 62][index]}%` }} />
                ))}
              </div>

              <div className={styles.signatures} aria-hidden="true">
                {SIGNATURES.map((path, index) => (
                  <svg key={index} viewBox="0 0 56 32" className={styles.signature}>
                    <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ))}
              </div>

              <p className={`meta ${styles.docFoot}`}>
                500 signatures / London / 07 Apr 2027
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
