import { describe, expect, it } from '@jest/globals';
import {
  calculateBillBalances,
  calculateGroupBalance,
  calculateParticipantShares,
} from '../balance';

const equalBill = {
  id: 'dinner-1',
  paid_by: 'a',
  participants: [{ user_id: 'a' }, { user_id: 'b' }],
  split_type: 'equal',
  total_cents: 1000,
};

describe('bill balances', () => {
  it('calculates a two-person equal split paid by one participant', () => {
    expect(calculateBillBalances(equalBill)).toEqual({ a: 500, b: -500 });
  });

  it('keeps every cent in an equal split with a deterministic remainder', () => {
    const bill = {
      ...equalBill,
      id: 'three-people',
      participants: [{ user_id: 'a' }, { user_id: 'b' }, { user_id: 'c' }],
      total_cents: 1000,
    };
    const firstShares = calculateParticipantShares(bill);
    expect(calculateParticipantShares(bill)).toEqual(firstShares);
    expect(Object.values(firstShares).reduce((sum, share) => sum + share, 0)).toBe(1000);
    expect(
      Object.values(calculateBillBalances(bill)).reduce((sum, balance) => sum + balance, 0),
    ).toBe(0);
  });

  it('calculates percentage shares with cent rounding that closes the bill', () => {
    const bill = {
      id: 'percentages',
      paid_by: 'a',
      participants: [
        { percentage_basis_points: 3300, user_id: 'a' },
        { percentage_basis_points: 3300, user_id: 'b' },
        { percentage_basis_points: 3400, user_id: 'c' },
      ],
      split_type: 'percentage',
      total_cents: 1000,
    };
    expect(
      Object.values(calculateParticipantShares(bill)).reduce((sum, share) => sum + share, 0),
    ).toBe(1000);
    expect(
      Object.values(calculateBillBalances(bill)).reduce((sum, balance) => sum + balance, 0),
    ).toBe(0);
  });

  it('calculates exact specific amounts', () => {
    const bill = {
      id: 'amounts',
      paid_by: 'a',
      participants: [
        { amount_cents: 250, user_id: 'a' },
        { amount_cents: 750, user_id: 'b' },
      ],
      split_type: 'amount',
      total_cents: 1000,
    };
    expect(calculateBillBalances(bill)).toEqual({ a: 750, b: -750 });
  });

  it('nets balances across multiple bills', () => {
    const secondBill = { ...equalBill, id: 'dinner-2', paid_by: 'b' };
    expect(calculateGroupBalance([equalBill, secondBill], 'a')).toBe(0);
    expect(calculateGroupBalance([equalBill, secondBill], 'b')).toBe(0);
  });

  it('rejects incomplete splits and a payer outside the participants', () => {
    expect(() =>
      calculateParticipantShares({
        ...equalBill,
        participants: [{ percentage_basis_points: 5000, user_id: 'a' }],
        split_type: 'percentage',
      }),
    ).toThrow('Percentages must equal 100');
    expect(() => calculateBillBalances({ ...equalBill, paid_by: 'outside' })).toThrow(
      'The payer must be a participant',
    );
  });
});
