/**
 * Formats a number into Indian currency format.
 *
 * @param amount - The number to be formatted.
 * @returns A string representing the formatted currency.
 */
export function formatToIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
