import { Reveal } from '@/components/reveal';
import { AmbientVideo } from '@/components/ambient-video';

import styles from './closing-night.module.css';

const BILL = ['Live performances', 'Awards', 'Gala dinner', 'DJ until late'];

export function ClosingNight() {
  return (
    <section id="closing-night" className={`tone-ink section ${styles.section}`}>
      <div className="shell inner">
        <h2 className="srOnly">Closing night</h2>
        <div className={styles.split}>
          <Reveal className={styles.half}>
            <span className={`display ${styles.hour}`}>4 PM</span>
            <span className={`display display--black ${styles.word}`}>Policy.</span>
          </Reveal>

          <span className={styles.divider} aria-hidden="true" />

          <Reveal delay={140} className={styles.half}>
            <span className={`display ${styles.hour}`}>11 PM</span>
            <span className={`display display--black ${styles.word} ${styles.wordAccent}`}>
              Dance floor.
            </span>
          </Reveal>
        </div>

        <Reveal as="p" delay={200} className={`lede ${styles.payoff}`}>
          The delegate arguing migration policy at four in the afternoon is the same
          person on the floor at eleven at night. That was the point of the whole thing.
        </Reveal>

        <div className={styles.body}>
          <div className={styles.billCol}>
            <ul className={styles.bill}>
              {BILL.map((item) => (
                <li key={item} className={styles.billItem}>
                  <span className={styles.billMark} aria-hidden="true" />
                  <span className="meta meta--fg">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className={styles.media}>
            <AmbientVideo
              src="/closing-night-video.mp4"
              poster="/closing-night-poster.jpg"
              label="footage of the closing night"
              className={styles.mediaFrame}
            />
            <figcaption style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.5rem' }}>
              <span className="meta meta--orange">Footage 02 / closing night</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
