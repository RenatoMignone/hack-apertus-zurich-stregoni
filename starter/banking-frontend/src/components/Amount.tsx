import { formatAmount } from "../format";
import styles from "./ui.module.css";

/** Bold, right-aligned amount with currency code. */
export function Amount({ value, currency }: { value: number; currency: string }) {
  return <span className={styles.amount}>{formatAmount(value, currency)}</span>;
}
