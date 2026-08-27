export type FaqItem = {
  question: string;
  answer: string;
  /** True where the copy is not final — rendered with a visible placeholder mark. */
  placeholder?: boolean;
};

export const FAQ: FaqItem[] = [
  {
    question: 'Who can apply?',
    answer:
      'Indian students and graduates aged 18 to 28, based anywhere in the world.',
  },
  {
    question: 'What does it cost?',
    answer:
      'Delegate places are [free / cost X]. Travel and accommodation are yours, and there are a limited number of bursaries.',
    placeholder: true,
  },
  {
    question: 'Can I pick my track?',
    answer:
      'You state a preference. Allocations balance the room, so you might get your second choice.',
  },
  {
    question: 'I graduated already.',
    answer: 'Still eligible up to 28.',
  },
  {
    question: 'Is there a dress code?',
    answer:
      'For the floor, whatever you argue best in. For the closing night, dress for it.',
  },
];
