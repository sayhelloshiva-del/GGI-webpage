import { PARTNERS } from '@/data/partners';
import { PartnerMark } from '@/components/partner-mark';

import styles from './partners.module.css';

export function Partners() {
  return (
    <section id="partners" className="tone-ink section">
      <div className="shell inner">
        <h2 className="srOnly">Partners</h2>
        <div className={styles.head}>
          <span className="meta meta--orange">Sec / 08 — Supported by</span>
        </div>

        <ul className={styles.strip}>
          {PARTNERS.map((partner) => (
            <li key={partner.slot} className={styles.slot}>
              <span className={styles.lockup}>
                <PartnerMark mark={partner.mark} />
                <span className={styles.words}>
                  <span className={`display ${styles.name}`}>{partner.name}</span>
                  <span className={`meta ${styles.kind}`}>{partner.kind}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
