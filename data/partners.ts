export type Partner = {
  slot: string;
  /** Invented name — see the note below. Replace wholesale when partners sign. */
  name: string;
  /** What kind of organisation the slot is reserved for. */
  kind: string;
  mark: MarkId;
};

export type MarkId = 'meridian' | 'altus' | 'ledger' | 'northbank' | 'orbit' | 'civic';

/*
 * PLACEHOLDER PARTNERS
 *
 * Every name and mark below is invented for layout purposes. None of these
 * organisations exist and none has any relationship with the summit. They are
 * here so the strip can be designed and reviewed at the right visual weight
 * instead of sitting empty — delete the whole array and drop in real assets
 * once partners are signed.
 */
export const PARTNERS: Partner[] = [
  { slot: '01', name: 'Meridian', kind: 'Foundation', mark: 'meridian' },
  { slot: '02', name: 'Altus', kind: 'Institute', mark: 'altus' },
  { slot: '03', name: 'The Ledger', kind: 'Media', mark: 'ledger' },
  { slot: '04', name: 'Northbank', kind: 'Finance', mark: 'northbank' },
  { slot: '05', name: 'Orbit', kind: 'Labs', mark: 'orbit' },
  { slot: '06', name: 'Civic House', kind: 'Culture', mark: 'civic' },
];
