import { ACTIONS } from '@/data/summit';
import { Reveal } from '@/components/reveal';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';

import styles from './intro.module.css';

export function Intro() {
  return (
    <section className="tone-paper section">
      <div className="shell inner">
        <SectionHead index="01" label="What this is">
          <Headline
            className="d1"
            lines={[
              <>This isn&rsquo;t a conference</>,
              <>
                you <span className="gradientText">watch</span>.
              </>,
            ]}
          />
          <p className="body">
            The first Global Graduate Summit brings 500 Indian students and graduates into
            central London for two days. Everyone here is 18 to 28. Six tracks, each
            opening with keynotes and panels from the people who have actually made the
            decision, then the floor opens. From there you spend most of the summit in a
            working group, writing the position your track takes to the closing plenary.
          </p>
        </SectionHead>

        <ol className={styles.actions}>
          {ACTIONS.map((action, index) => (
            <Reveal
              as="li"
              key={action.verb}
              delay={index * 70}
              className={styles.action}
            >
              <span className="meta">{String(index + 1).padStart(2, '0')}</span>
              <h3 className={`display display--black ${styles.verb}`}>{action.verb}</h3>
              <p className={styles.body}>{action.body}</p>
            </Reveal>
          ))}
        </ol>

        <p className={`lede ${styles.outro}`}>
          Every delegate votes on the final text. Every delegate signs it. Then the biggest
          Indian night London will see this year.
        </p>
      </div>
    </section>
  );
}
