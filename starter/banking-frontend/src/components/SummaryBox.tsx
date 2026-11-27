import { formatAmount, formatDateLong } from "../format";
import styles from "./ui.module.css";

/** "Total liquidity · CHF 12'345.00 · per 27 Nov 2026" box under the page title. Value comes from the API. */
export function SummaryBox({
  label,
  value,
  currency,
  asOf,
}: {
  label: string;
  value: number;
  currency: string;
  asOf?: string;
}) {
  return (
    <div className={styles.summary}>
      <div className={styles.summaryLabel}>{label}</div>
      <div>
        <span className={styles.summaryValue}>{formatAmount(value, currency)}</span>
        {asOf && <span className={styles.summaryDate}>per {formatDateLong(asOf)}</span>}
      </div>
    </div>
  );
}
