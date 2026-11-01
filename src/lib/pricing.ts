export const price = (minor: number) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'code',
    maximumFractionDigits: 0,
  }).format(minor / 100);
