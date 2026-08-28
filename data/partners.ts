export type Partner = {
  slot: string;
  name: string;
  kind: string;
  mark: MarkId;
};

export type MarkId = 'meridian' | 'altus' | 'ledger' | 'northbank' | 'orbit' | 'civic';

// Invented names and marks so the strip can be laid out at the right weight.
// None of these organisations exist. Replace the array when partners sign.
export const PARTNERS: Partner[] = [
  { slot: '01', name: 'Meridian', kind: 'Foundation', mark: 'meridian' },
  { slot: '02', name: 'Altus', kind: 'Institute', mark: 'altus' },
  { slot: '03', name: 'The Ledger', kind: 'Media', mark: 'ledger' },
  { slot: '04', name: 'Northbank', kind: 'Finance', mark: 'northbank' },
  { slot: '05', name: 'Orbit', kind: 'Labs', mark: 'orbit' },
  { slot: '06', name: 'Civic House', kind: 'Culture', mark: 'civic' },
];
