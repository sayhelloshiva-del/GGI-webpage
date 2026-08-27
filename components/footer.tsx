import { SUMMIT } from '@/data/summit';
import { Logo } from '@/components/logo';
import { Headline } from '@/components/headline';

import styles from './footer.module.css';

const FOOTER_LINKS = [
  { label: 'Apply', href: '#apply' },
  { label: 'Programme', href: '#programme' },
  { label: 'Partners', href: '#partners' },
  { label: 'Press', href: '#partners' },
  { label: 'Contact', href: 'mailto:hello@example.org' },
];

export function Footer() {
  return (
    <footer id="site-footer" className={`tone-ink ${styles.footer}`}>
      <div className={`shell inner ${styles.cta}`}>
        <Headline
          className={`display--black ${styles.ctaTitle}`}
          lines={[
            '500 places.',
            '15 countries.',
            <span key="q" className="gradientText">
              Will one be yours?
            </span>,
          ]}
        />

        <div className={styles.ctaAction}>
          <a className="btn btnPrimary" href="#apply">
            Apply for a delegate place <span className="arrow" aria-hidden="true">→</span>
          </a>
          <p className="meta">
            Applications close {SUMMIT.applicationsClose}
          </p>
        </div>
      </div>

      <div className={`shell inner ${styles.base}`}>
        <div className={styles.identity}>
          <Logo height={40} />
          <div>
            <p className={`display ${styles.name}`}>{SUMMIT.name}</p>
            <p className="meta">A {SUMMIT.parent} event</p>
          </div>
        </div>

        <div className={styles.where}>
          <p className="meta meta--fg">{SUMMIT.datesShort}</p>
          <p className="meta">{SUMMIT.city}</p>
        </div>

        <nav className={styles.links} aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <a key={link.label} className={styles.link} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className={`shell inner ${styles.legal}`}>
        <p className="meta">
          © {new Date().getFullYear()} {SUMMIT.parent}.
        </p>
        <p className="meta">{SUMMIT.shorthand}</p>
      </div>
    </footer>
  );
}
