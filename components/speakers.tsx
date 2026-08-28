import Image from 'next/image';

import { Reveal } from '@/components/reveal';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';

import styles from './speakers.module.css';

// Unfilled programme slots, not people. Portraits are indicative and marked
// UNFILLED; fill a slot by adding a name and swapping the image.
const SLOTS = [
  {
    slot: '01',
    category: 'Minister',
    note: 'Policy — plenary',
    image: '/speaker-minister.png',
  },
  {
    slot: '02',
    category: 'Founder',
    note: 'Industry — plenary',
    image: '/speaker-founder.png',
  },
  {
    slot: '03',
    category: 'Journalist',
    note: 'Press — floor questions',
    image: '/speaker-journalist.png',
  },
  {
    slot: '04',
    category: 'Academic',
    note: 'Research — working groups',
    image: '/speaker-academic.png',
  },
] as const;

export function Speakers() {
  return (
    <section id="people" className="tone-ink section">
      <div className="shell inner">
        <SectionHead index="05" label="Who you work with">
          <Headline
            className="d1"
            lines={[
              'Speaker announcements',
              <>
                <span className="gradientText">coming soon</span>.
              </>,
            ]}
          />
          <p className="body">
            Ministers. Founders building at scale. Journalists who cover these decisions
            for a living. Academics who have given careers to one of the six questions.
          </p>
          <p className="body">
            The programme committee is confirming the floor now. Delegates hear first —
            announcements go to applicants before they go anywhere else.
          </p>
        </SectionHead>

        <div className={styles.rail}>
          <span className="meta meta--fg">Slots 01—04</span>
          <span className="meta">Four seats, none of them confirmed yet</span>
        </div>

        <ul className={styles.grid}>
          {SLOTS.map((slot, index) => (
            <Reveal as="li" key={slot.slot} delay={index * 70} className={styles.card}>
              <div className={styles.portrait}>
                <Image
                  src={slot.image}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 320px"
                  className={styles.portraitImage}
                />
                <span className={styles.tint} aria-hidden="true" />
                <span className={styles.scrim} aria-hidden="true" />
                <span className={`meta ${styles.slotNo}`}>Slot {slot.slot}</span>
                <span className={`meta ${styles.status}`}>Unfilled</span>
              </div>

              <h3 className={`display ${styles.category}`}>{slot.category}</h3>
              <p className={`meta ${styles.note}`}>{slot.note}</p>

              <p className={styles.nameField}>
                <span className="meta">Name</span>
                <span className={styles.nameRule} aria-hidden="true" />
                <span className={`meta ${styles.nameValue}`}>To be announced</span>
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
