/**
 * Format large numbers into statistical ones
 * @param x
 */
export function numberWithSpaces(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
