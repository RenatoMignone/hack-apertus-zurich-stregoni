/**
 * Display formatting only. Never compute business values here: totals and conversions come from the API.
 * Dates are formatted from their ISO strings, without `new Date()`, so no time zone can shift them.
 */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** 8034.42 → "8'034.42" (Swiss style, ASCII apostrophe). */
export function formatNumber(value: number, decimals = 2): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int, frac] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  const sign = value < 0 && Number(fixed) !== 0 ? "-" : "";
  return sign + grouped + (frac ? `.${frac}` : "");
}

/** (8034.42, "CHF") → "CHF 8'034.42" */
export function formatAmount(value: number, currency: string): string {
  return `${currency} ${formatNumber(value)}`;
}

/** "2026-11-27" → "27/11/2026" */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

/** "2026-11-27" → "27 Nov 2026" */
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

/** "2026-11-26T08:31:00" → "26 Nov 2026 at 08:31" */
export function formatDateTime(iso: string): string {
  return `${formatDateLong(iso)} at ${iso.slice(11, 16)}`;
}

/** "2026-11" → "11/2026" (card expiry) */
export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${m}/${y}`;
}

/** Whole numbers without decimals, others with two: 1200 → "1'200", 12.5 → "12.50". */
export function formatNumberAuto(value: number): string {
  return formatNumber(value, Number.isInteger(value) ? 0 : 2);
}
