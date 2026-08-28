import Image from 'next/image';

import styles from './logo.module.css';

// The official mark, used as supplied. Don't recolour or rebuild it.
const SRC = '/ggi-logo.png';
const ASPECT = 1152 / 784;

export function Logo({
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
