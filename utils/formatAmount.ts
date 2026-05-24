/**
 * Format a number as a money amount with thousand separators and two decimals.
 *   formatAmount(24380)      → '24,380.00'
 *   formatAmount(80.5)       → '80.50'
 *   formatAmount(0)          → '0.00'
 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Split a money amount into the whole part and the decimal part, so the UI
 * can render them at different sizes (e.g. the hero balance shows large
 * whole + smaller decimals).
 *   splitAmount(24380.5)  → { whole: '24,380', cents: '.50' }
 */
export function splitAmount(amount: number): { whole: string; cents: string } {
  const formatted = formatAmount(amount);
  const [whole, cents] = formatted.split('.');
  return { whole, cents: `.${cents}` };
}

/**
 * Hidden placeholder for the "hide amounts" mode.
 */
export const HIDDEN_AMOUNT = '••••';
