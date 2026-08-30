import { HERO_STATS, SUMMIT } from '@/data/summit';
import { ParallaxLayer } from '@/components/parallax-layer';
import { AmbientVideo } from '@/components/ambient-video';

import styles from './hero.module.css';

export function Hero() {
  return (
    <section id="top" className={`tone-ink ${styles.hero}`}>
      <ParallaxLayer className={styles.backdrop} strength={0.12}>
        <AmbientVideo
          src="/hero-video.mp4"
          poster="/hero-poster.jpg"
          label="footage of the summit floor"
          className={styles.backdropMedia}
        />
      </ParallaxLayer>

      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.rules} aria-hidden="true" />

      {/* Sits outside ParallaxLayer: a footage credit should stay put while the
          plate behind it moves, and it has to clear the stats strip. */}
      <p className={styles.credit}>
        <span className="meta meta--orange">Footage 01 / documentary</span>
      </p>

      <div className={`shell ${styles.inner}`}>
        <p className={`meta ${styles.presents}`}>
          <span className="meta--fg">{SUMMIT.parent} presents</span>
        </p>

        <p className={`display ${styles.wordmark}`}>{SUMMIT.name}</p>

        <ul className={styles.metaRow}>
          <li className="meta">{SUMMIT.edition}</li>
          <li className="meta">{SUMMIT.city}</li>
          <li className="meta">{SUMMIT.datesShort}</li>
        </ul>

        <h1 className={`display display--black ${styles.title}`}>
          The room where
          <br />
          the next
          <br />
          <span className={styles.titleAccent}>generation</span>
          <br />
          turns up.
        </h1>

        <p className={`lede ${styles.lede}`}>
          500 delegates, 18 to 28, from 15 countries. Six of the decisions that will define
          this generation, worked through with the ministers, founders and journalists who
          make them. Two days in London, a signed declaration at the end carrying every
          name in the room, and a network you keep long after it.
        </p>

        <div className={styles.ctas}>
          <a className="btn btnPrimary" href="#apply">
            Apply for a delegate place <span className="arrow" aria-hidden="true">→</span>
          </a>
          <a className="btn btnGhost" href="#tracks">
            See the six tracks
          </a>
        </div>

        <aside className={`frame ${styles.credential}`} aria-label="Sample delegate credential">
          <div className={styles.credentialHead}>
            <span className="meta meta--orange">Delegate 0284</span>
            <span className="meta">Specimen</span>
          </div>
          <dl className={styles.credentialBody}>
            <div>
              <dt className="meta">Country</dt>
              <dd className={`display ${styles.credentialValue}`}>India</dd>
            </div>
            <div>
              <dt className="meta">Track 02</dt>
              <dd className={`display ${styles.credentialValue}`}>AI + Future of Work</dd>
            </div>
            <div>
              <dt className="meta">Floor</dt>
              <dd className={`display ${styles.credentialValue}`}>
                {SUMMIT.city} — {SUMMIT.datesShort}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      <ul className={`shell ${styles.stats}`}>
        {HERO_STATS.map((stat) => (
          <li key={stat.label} className={styles.stat}>
            <span className={`display ${styles.statValue}`}>{stat.value}</span>
            <span className="meta">{stat.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
