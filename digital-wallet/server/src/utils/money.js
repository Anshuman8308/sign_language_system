/**
 * Convert rupees to paise (integer) - for storage
 */
export const toPaise = (rupees) => {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new Error('Invalid amount: must be a number');
  }
  if (rupees < 0) {
    throw new Error('Invalid amount: must be positive');
  }
  return Math.round(rupees * 100);
};

/**
 * Convert paise to rupees - for API responses only, never store
 */
export const toRupees = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return paise / 100;
};

/**
 * Format for display (INR)
 */
export const formatMoney = (paise) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(toRupees(paise));
};
