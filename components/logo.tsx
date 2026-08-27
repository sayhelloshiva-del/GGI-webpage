import Image from 'next/image';

import styles from './logo.module.css';

/* ---------------------------------------------------------------------------
   GGI LOGO
   ---------------------------------------------------------------------------
   The official mark, used as supplied — do not recolour, crop, restyle or
   rebuild it. This component is the only place it is rendered, so any future
   change (a new file, an SVG version) is a one-file swap.

   Source: public/ggi-logo.png — 1152 x 784.
   --------------------------------------------------------------------------- */

const SRC = '/ggi-logo.png';
const ASPECT = 1152 / 784;

export function Logo({
  /** Rendered height in px. Width follows the mark's own aspect ratio. */
  height = 26,
  priority = false,
}: {
  height?: number;
  priority?: boolean;
}) {
  return (
    <Image
      className={styles.logo}
      src={SRC}
      alt="GGI"
      width={Math.round(height * ASPECT)}
      height={height}
      priority={priority}
    />
  );
}
