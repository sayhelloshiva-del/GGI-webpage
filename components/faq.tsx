'use client';

import { useState } from 'react';

import { FAQ } from '@/data/faq';
import { SectionHead } from '@/components/section-head';
import { Headline } from '@/components/headline';

import styles from './faq.module.css';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="tone-ink section">
      <div className="shell inner">
        <SectionHead index="07" label="Questions">
          <Headline
            className="d1"
            lines={[
              'Before you',
              <>
                <span className="gradientText">apply</span>.
              </>,
            ]}
          />
        </SectionHead>

        <dl className={styles.list}>
          {FAQ.map((item, index) => {
            const open = openIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div key={item.question} className={styles.item}>
                <dt>
                  <button
                    id={buttonId}
                    type="button"
                    className={styles.trigger}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    <span className={styles.question}>{item.question}</span>
                    <span
                      className={`${styles.sign} ${open ? styles.signOpen : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                </dt>

                <dd
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
                >
                  <div className={styles.panelInner}>
                    <p className={styles.answer}>{item.answer}</p>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
