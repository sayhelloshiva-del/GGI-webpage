export type ProgrammeSlot = {
  day: string;
  part: string;
  title: string;
  body: string;
  /** Indicative only — the published timetable follows speaker confirmation. */
  time: string;
};

export const PROGRAMME: ProgrammeSlot[] = [
  {
    day: 'Day 01',
    part: 'Morning',
    title: 'Opening Plenary',
    body:
      'Opening plenary and keynote. Then into your track: a panel from the people who make these decisions, and questions from the floor.',
    time: '09:30 — 13:00',
  },
  {
    day: 'Day 01',
    part: 'Afternoon',
    title: 'Working Groups',
    body:
      'Small tables, one facilitator each, drafting the positions your track will take forward. This is most of what you came for.',
    time: '14:00 — 18:00',
  },
  {
    day: 'Day 02',
    part: 'Morning',
    title: 'Final Draft',
    body:
      'Working groups finish. Each track consolidates its drafts into a single position.',
    time: '09:30 — 12:30',
  },
  {
    day: 'Day 02',
    part: 'Afternoon',
    title: 'The Floor Votes',
    body:
      'Each track presents its position, the floor amends, and all 500 delegates vote on it.',
    time: '14:00 — 18:00',
  },
  {
    day: 'Day 02',
    part: 'Evening',
    title: 'Sign. Then Celebrate.',
    body: 'The declaration is signed. Then the closing night.',
    time: '19:00 — late',
  },
];
