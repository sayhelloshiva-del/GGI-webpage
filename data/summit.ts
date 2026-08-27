/** Single source of truth for the event facts repeated across the site. */
export const SUMMIT = {
  name: 'The Global Graduate Summit',
  shorthand: 'GGS / 27',
  parent: 'GGI',
  edition: 'First Edition',
  city: 'London',
  dates: '06—07 April 2027',
  datesShort: '06—07 APR 2027',
  /** PLACEHOLDER — confirm the deadline before launch. */
  applicationsClose: '30 November 2026',
  /** PLACEHOLDER — swap for the live application form when it exists. */
  applyFormUrl: 'https://example.org/ggs27/apply',
} as const;

export const HERO_STATS = [
  { value: '500', label: 'Delegates' },
  { value: '18–28', label: 'Age' },
  { value: '15+', label: 'Countries' },
  { value: '06', label: 'Tracks' },
  { value: '02', label: 'Days' },
  { value: '01', label: 'Declaration' },
] as const;

export const STAT_STORY = [
  { value: '500', label: 'delegates selected by application' },
  { value: '15+', label: 'countries represented' },
  { value: '06', label: 'questions defining a generation' },
  { value: '01', label: 'declaration carrying every name' },
] as const;

export const ACTIONS = [
  { verb: 'Listen', body: 'to the people making the decisions.' },
  { verb: 'Question', body: 'them from the floor.' },
  { verb: 'Work', body: 'inside small track groups.' },
  { verb: 'Write', body: 'the position your track carries forward.' },
  { verb: 'Vote', body: 'on the final declaration.' },
  { verb: 'Sign', body: 'your name to it.' },
] as const;

export const NAV_LINKS = [
  { label: 'Summit', href: '#summit' },
  { label: 'Tracks', href: '#tracks' },
  { label: 'Programme', href: '#programme' },
  { label: 'FAQ', href: '#faq' },
] as const;
