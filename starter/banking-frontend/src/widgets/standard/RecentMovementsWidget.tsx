import { Link } from "react-router";
import { useBookings } from "../../api/bookings";
import { QueryState } from "../../components/QueryState";
import { formatDate, formatNumber } from "../../format";
import { pagePath } from "../../routes";
import type { Widget } from "../registry";
import styles from "../widgets.module.css";

const NO_FILTER = {};

export function RecentMovementsWidget({ widget }: { widget: Widget }) {
  const configured = Number(widget.config?.limit);
  const limit = Number.isInteger(configured) && configured > 0 ? configured : 5;
  const bookings = useBookings(NO_FILTER, limit, 0);
  return (
    <QueryState query={bookings}>
      {(page) => (
        <>
          {page.items.length === 0 && <p className={styles.muted}>No movements yet.</p>}
          <ul className={styles.rowList}>
            {page.items.map((b) => (
              <li key={b.booking_id} className={styles.rowItem}>
                <div className={styles.rowText}>
                  <div>{b.counterparty_name ?? b.booking_text}</div>
                  <div className={styles.muted}>{formatDate(b.booking_date)}</div>
                </div>
                <span className={b.amount > 0 ? styles.credit : styles.debit}>
                  {b.amount > 0 ? `CHF +${formatNumber(b.amount)}` : `-CHF ${formatNumber(-b.amount)}`}
                </span>
              </li>
            ))}
          </ul>
          <Link className={styles.sourceLink} to={pagePath("movements")}>
            All movements
          </Link>
        </>
      )}
    </QueryState>
  );
}
