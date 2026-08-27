import { SUMMIT } from '@/data/summit';
import { Reveal } from '@/components/reveal';

import styles from './application.module.css';

const STEPS = [
  {
    id: '01',
    title: 'Apply',
    body: 'Fifteen minutes. Who you are, where you are, which track you want.',
  },
  {
    id: '02',
    title: 'Selection',
    body: 'Read by the programme committee. Decisions in [January 2027].',
  },
  {
    id: '03',
    title: 'Credentials',
    body: 'Receive your allocation, track and briefing pack.',
  },
];

export function Application() {
  return (
    <section id="apply" className={`tone-orange section ${styles.section}`}>
      <div className="shell inner">
        <div className={styles.head}>
          <span className="meta meta--fg">Sec / 06 — How to apply</span>
          <h2 className="display d1">
            Your allocation
            <br />
            starts here.
          </h2>
          <p className={`body ${styles.headNote}`}>
            Places are allocated by country and each country has a fixed number.
            Applications are read as they arrive.
          </p>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <Reveal as="li" key={step.id} delay={index * 80} className={styles.step}>
              <span className={`display ${styles.stepNumber}`}>{step.id}</span>
              <h3 className={`display ${styles.stepTitle}`}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </Reveal>
          ))}
        </ol>

        <div className={styles.foot}>
          <div className={styles.deadline}>
            <span className="meta meta--fg">Applications close</span>
            <p className={`display ${styles.deadlineDate}`}>{SUMMIT.applicationsClose}</p>
            <p className="meta">[X] allocations left for [country]</p>
          </div>

          <div className={styles.cta}>
            <a
              className={`btn ${styles.ctaButton}`}
              href={SUMMIT.applyFormUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply for a delegate place <span className="arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
