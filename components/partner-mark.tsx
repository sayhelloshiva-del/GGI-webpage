import type { MarkId } from '@/data/partners';

// Invented marks, all on one 32×32 grid at one stroke weight so they read as a
// set at sponsor-strip size.
const MARKS: Record<MarkId, React.ReactNode> = {
  // Globe with a meridian through it.
  meridian: (
    <>
      <circle cx="16" cy="16" r="12" />
      <ellipse cx="16" cy="16" rx="5" ry="12" />
      <path d="M4.4 16h23.2" />
    </>
  ),
  // Two ascending chevrons.
  altus: (
    <>
      <path d="M5 25.5 16 14.5 27 25.5" />
      <path d="M5 17.5 16 6.5 27 17.5" />
    </>
  ),
  // Bracket with ruled lines — a ledger page.
  ledger: (
    <>
      <path d="M24 5H9v22h15" />
      <path d="M14 12h9M14 16.5h9M14 21h6" />
    </>
  ),
  // Diamond within a diamond.
  northbank: (
    <>
      <path d="M16 3.5 28.5 16 16 28.5 3.5 16Z" />
      <path d="M16 10.5 21.5 16 16 21.5 10.5 16Z" />
    </>
  ),
  // Orbital ring around a core.
  orbit: (
    <>
      <circle cx="16" cy="16" r="3.6" />
      <ellipse cx="16" cy="16" rx="13" ry="5.6" transform="rotate(-28 16 16)" />
    </>
  ),
  // Pediment over columns.
  civic: (
    <>
      <path d="M4 12.5 16 5.5l12 7Z" />
      <path d="M9 15.5v9M16 15.5v9M23 15.5v9" />
      <path d="M5 27h22" />
    </>
  ),
};

export function PartnerMark({ mark }: { mark: MarkId }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="30"
      height="30"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {MARKS[mark]}
    </svg>
  );
}
