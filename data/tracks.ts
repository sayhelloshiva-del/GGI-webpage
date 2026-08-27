export type Track = {
  /** Two-digit track number used across credentials, briefing packs and the UI. */
  id: string;
  /** Short name used in navigation and credential strips. */
  name: string;
  /** Full name used in headings and in the AI matcher response. */
  fullName: string;
  /** The question the track exists to answer. */
  question: string;
  /** Editorial description shown when the card is open. */
  body: string;
  /** What the working group actually produces on day two. */
  output: string;
};

export const TRACKS: Track[] = [
  {
    id: '01',
    name: 'Migration',
    fullName: 'Migration',
    question: 'Who gets to move?',
    body: 'Who gets to move, who decides, and what you owe the country you left and the one you landed in.',
    output:
      'A position on student and skilled-worker routes, and on what a fair system owes the people inside it.',
  },
  {
    id: '02',
    name: 'AI + The Future of Work',
    fullName: 'AI and the Future of Work',
    question: 'Which jobs survive?',
    body: 'The jobs you trained for, and which of them survive the decade.',
    output:
      'A position on automation, entry-level work, and what a training pathway is worth in 2030.',
  },
  {
    id: '03',
    name: 'Climate',
    fullName: 'Climate',
    question: 'Who pays?',
    body: 'Who pays for a crisis nobody in this room started.',
    output:
      'A position on responsibility, finance, and who carries the cost of adaptation.',
  },
  {
    id: '04',
    name: 'Trade',
    fullName: 'Trade',
    question: 'What gets traded?',
    body: "India's leverage, and what it gets traded for.",
    output:
      'A position on trade terms, supply chains, and where leverage should be spent.',
  },
  {
    id: '05',
    name: 'Media',
    fullName: 'Media',
    question: 'Who tells your story?',
    body: 'Who tells your story, and what it costs when they get it wrong.',
    output:
      'A position on representation, platforms, and accountability for narrative.',
  },
  {
    id: '06',
    name: 'India + Its Diaspora',
    fullName: 'India and its Diaspora',
    question: 'What are the terms?',
    body: 'Twenty million people abroad, and a relationship neither side has set the terms of.',
    output:
      'A position on what the diaspora owes India, and what India owes it back.',
  },
];

export const TRACK_IDS = TRACKS.map((track) => track.id) as [string, ...string[]];

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((track) => track.id === id);
}
