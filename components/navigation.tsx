'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { NAV_LINKS, SUMMIT } from '@/data/summit';
import { Logo } from '@/components/logo';

import styles from './navigation.module.css';

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        frame = 0;
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    // Focus stays on the toggle — the standard disclosure pattern. The panel
    // follows it in DOM order, so Tab walks straight into the menu.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.isScrolled : ''}`}>
      <a className={styles.skip} href="#summit">
        Skip to content
      </a>

      <div className={`shell ${styles.bar}`}>
        <a className={styles.brand} href="#top">
          <Logo height={26} priority />
          <span className={styles.brandDivider} aria-hidden="true" />
          <span className={`meta ${styles.brandMeta}`}>{SUMMIT.shorthand}</span>
        </a>

        <nav className={styles.links} aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} className={styles.link} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a className={`btn btnPrimary ${styles.apply}`} href="#apply">
            Apply <span className="arrow" aria-hidden="true">→</span>
          </a>

          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
      >
        <nav className={styles.panelLinks} aria-label="Mobile">
          {NAV_LINKS.map((link, index) => (
            <a key={link.href} href={link.href} onClick={close} className={styles.panelLink}>
              <span className="meta">{String(index + 1).padStart(2, '0')}</span>
              <span className="display d2">{link.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.panelFoot}>
          <a className="btn btnPrimary btnFull" href="#apply" onClick={close}>
            Apply for a delegate place <span className="arrow" aria-hidden="true">→</span>
          </a>
          <p className="meta">
            {SUMMIT.city} / {SUMMIT.datesShort}
          </p>
        </div>
      </div>
    </header>
  );
}
