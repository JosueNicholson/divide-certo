export const formatCents = (value, maxDigits) => {
  const digits = (value.replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0').slice(0, maxDigits);
  const padded = digits.padStart(3, '0');
  return `${padded.slice(0, -2)},${padded.slice(-2)}`;
};

export const parseBrazilianNumber = (value) => Number.parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
