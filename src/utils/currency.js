export const money = (value, locale = 'pt-BR') => new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
}).format(value || 0);
