'use client';

import type { Track } from '@/data/tracks';

import styles from './tracks.module.css';

type TrackCardProps = {
  track: Track;
  open: boolean;
  onToggle: () => void;
  /** Desktop hover-to-expand. Never the only way in — click and keys work too. */
  onPreview: () => void;
};

export function TrackCard({ track, open, onToggle, onPreview }: TrackCardProps) {
  const panelId = `track-panel-${track.id}`;
  const buttonId = `track-button-${track.id}`;

  return (
    <li
      id={`track-${track.id}`}
      className={[styles.row, open ? styles.rowOpen : ''].filter(Boolean).join(' ')}
      onMouseEnter={onPreview}
    >
      <h3 className={styles.heading}>
        <button
          id={buttonId}
          type="button"
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          onFocus={onPreview}
        >
          <span className={`display ${styles.number}`}>{track.id}</span>
          <span className={styles.headingText}>
            <span className={`display ${styles.name}`}>{track.name}</span>
            <span className="meta">{track.question}</span>
          </span>
          <span className={styles.sign} aria-hidden="true" />
        </button>
      </h3>

      <div id={panelId} role="region" aria-labelledby={buttonId} className={styles.panel}>
        <div className={styles.panelInner}>
          <p className={styles.body}>{track.body}</p>
          <p className={styles.output}>
            <span className="meta meta--orange">Working group output</span>
            {track.output}
          </p>
        </div>
      </div>
    </li>
  );
}
