/**
 * The three questions behind the Track Matcher.
 *
 * Every option carries its own weighting across the six tracks. Those weights
 * are what `lib/track-scoring.ts` uses to produce a result without any model
 * involved, so the feature keeps working when the AI provider does not.
 */

export type MatcherOption = {
  /** Stable id sent to the API. Never renumber these — they are the contract. */
  id: string;
  label: string;
  /** trackId -> weight. Higher is a stronger signal. */
  weights: Record<string, number>;
};

export type MatcherQuestion = {
  id: string;
  /** Shown as the credential-style step marker, e.g. "Q 01 / 03". */
  index: string;
  prompt: string;
  options: MatcherOption[];
};

export const MATCHER_QUESTIONS: MatcherQuestion[] = [
  {
    id: 'q1',
    index: '01',
    prompt: 'Which conversation would you most hate to miss?',
    options: [
      {
        id: 'q1-borders',
        label: 'Who gets to cross borders',
        weights: { '01': 3, '06': 0.8 },
      },
      {
        id: 'q1-ai',
        label: 'Whether AI replaces your career',
        weights: { '02': 3, '04': 0.6 },
      },
      {
        id: 'q1-climate',
        label: 'Who carries climate responsibility',
        weights: { '03': 3, '04': 0.5 },
      },
      {
        id: 'q1-economy',
        label: "India's economic influence",
        weights: { '04': 3, '06': 0.6 },
      },
      {
        id: 'q1-narrative',
        label: 'Who controls narratives',
        weights: { '05': 3, '06': 0.5 },
      },
      {
        id: 'q1-diaspora',
        label: 'What India owes its global diaspora',
        weights: { '06': 3, '01': 0.8 },
      },
    ],
  },
  {
    id: 'q2',
    index: '02',
    prompt: 'Which outcome matters most to you?',
    options: [
      {
        id: 'q2-movement',
        label: 'Fairer movement',
        weights: { '01': 2, '06': 0.5 },
      },
      { id: 'q2-work', label: 'Better work', weights: { '02': 2, '04': 0.4 } },
      {
        id: 'q2-climate',
        label: 'Climate accountability',
        weights: { '03': 2, '05': 0.3 },
      },
      {
        id: 'q2-leverage',
        label: 'Economic leverage',
        weights: { '04': 2, '02': 0.4 },
      },
      {
        id: 'q2-representation',
        label: 'Better representation',
        weights: { '05': 2, '01': 0.4 },
      },
      {
        id: 'q2-relationships',
        label: 'Stronger global relationships',
        weights: { '06': 2, '04': 0.4 },
      },
    ],
  },
  {
    id: 'q3',
    index: '03',
    prompt: 'Where do you naturally contribute?',
    options: [
      {
        id: 'q3-challenge',
        label: 'Challenging assumptions',
        weights: { '05': 0.9, '01': 0.6, '03': 0.4 },
      },
      {
        id: 'q3-analyse',
        label: 'Analysing systems',
        weights: { '02': 0.9, '04': 0.7, '03': 0.4 },
      },
      {
        id: 'q3-build',
        label: 'Building practical solutions',
        weights: { '03': 0.9, '02': 0.6, '04': 0.3 },
      },
      {
        id: 'q3-negotiate',
        label: 'Negotiating competing interests',
        weights: { '04': 0.9, '01': 0.6, '06': 0.4 },
      },
      {
        id: 'q3-communicate',
        label: 'Communicating complex ideas',
        weights: { '05': 0.9, '02': 0.4, '06': 0.4 },
      },
      {
        id: 'q3-connect',
        label: 'Connecting different communities',
        weights: { '06': 0.9, '01': 0.7, '05': 0.3 },
      },
    ],
  },
];

const OPTION_INDEX = new Map<string, MatcherOption>();
for (const question of MATCHER_QUESTIONS) {
  for (const option of question.options) {
    OPTION_INDEX.set(option.id, option);
  }
}

export function getOption(id: string): MatcherOption | undefined {
  return OPTION_INDEX.get(id);
}

/** Answer ids that are valid for a given question index (0-based). */
export function optionIdsFor(questionIndex: number): string[] {
  return MATCHER_QUESTIONS[questionIndex]?.options.map((o) => o.id) ?? [];
}
