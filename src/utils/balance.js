const stableHash = (value) =>
  [...value].reduce(
    (hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0) % 2147483647,
    0,
  );

const orderedParticipantIds = (billId, participants) => {
  const ids = participants.map(({ user_id }) => user_id).sort();
  const start = stableHash(billId) % ids.length;
  return [...ids.slice(start), ...ids.slice(0, start)];
};

const distributeRemainder = (billId, participants, baseAmounts, remainder) => {
  const amounts = { ...baseAmounts };
  orderedParticipantIds(billId, participants)
    .slice(0, remainder)
    .forEach((userId) => {
      amounts[userId] += 1;
    });
  return amounts;
};

export const calculateParticipantShares = ({ id, participants = [], split_type, total_cents }) => {
  if (!participants.length) throw new Error('A bill needs participants');

  if (split_type === 'equal') {
    const baseAmount = Math.floor(total_cents / participants.length);
    const baseAmounts = Object.fromEntries(
      participants.map(({ user_id }) => [user_id, baseAmount]),
    );
    return distributeRemainder(id, participants, baseAmounts, total_cents % participants.length);
  }

  if (split_type === 'amount') {
    const shares = Object.fromEntries(
      participants.map(({ amount_cents, user_id }) => [user_id, amount_cents]),
    );
    if (Object.values(shares).reduce((sum, amount) => sum + amount, 0) !== total_cents) {
      throw new Error('Specific amounts must equal the bill total');
    }
    return shares;
  }

  const totalBasisPoints = participants.reduce(
    (sum, { percentage_basis_points }) => sum + percentage_basis_points,
    0,
  );
  if (totalBasisPoints !== 10000) throw new Error('Percentages must equal 100');

  const baseAmounts = Object.fromEntries(
    participants.map(({ percentage_basis_points, user_id }) => [
      user_id,
      Math.floor((total_cents * percentage_basis_points) / 10000),
    ]),
  );
  const distributedTotal = Object.values(baseAmounts).reduce((sum, amount) => sum + amount, 0);
  return distributeRemainder(id, participants, baseAmounts, total_cents - distributedTotal);
};

export const calculateBillBalances = (bill) => {
  if (!bill.paid_by) throw new Error('A bill needs a payer');
  const shares = calculateParticipantShares(bill);
  if (!Object.hasOwn(shares, bill.paid_by)) throw new Error('The payer must be a participant');

  const balances = Object.fromEntries(
    Object.entries(shares).map(([userId, share]) => [userId, -share]),
  );
  balances[bill.paid_by] += bill.total_cents;
  return balances;
};

export const calculateGroupBalance = (bills, userId) =>
  bills.reduce((balance, bill) => balance + (calculateBillBalances(bill)[userId] || 0), 0);
