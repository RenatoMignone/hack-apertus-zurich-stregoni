/** Movements table, shared by the Movements page and the account detail tab. */
import { Fragment, useState } from "react";
import { useBookings, type Booking } from "../api/bookings";
import { Icon } from "../components/Icon";
import { ErrorTile } from "../components/QueryState";
import { formatDate, formatNumber } from "../format";
import type { MovementsFilter } from "../trustroom/protocol";
import styles from "./MovementsTable.module.css";

export const PAGE_SIZE = 25;

interface Props {
  filter: MovementsFilter;
  showAccount: boolean;
  showBalance: boolean;
}

export function MovementsTable({ filter, showAccount, showBalance }: Props) {
  // The page offset belongs to one filter: a new filter starts at the first page. Kept without
  // remounting, so the previous rows stay visible until the new ones arrive.
  const filterKey = JSON.stringify(filter);
  const [paging, setPaging] = useState({ filterKey, offset: 0 });
  const offset = paging.filterKey === filterKey ? paging.offset : 0;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const bookings = useBookings(filter, PAGE_SIZE, offset);
  const page = bookings.data;

  if (bookings.error) return <ErrorTile message={bookings.error.message} />;
  if (!page) return <div className={styles.empty}>Loading…</div>;

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  const columns = 5 + (showAccount ? 1 : 0) + (showBalance ? 1 : 0);

  return (
    <div className={styles.frame}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.chevronCell} />
            <th>Booking date</th>
            <th>Description</th>
            {showAccount && <th>Account</th>}
            <th className={styles.right}>Credit</th>
            <th className={styles.right}>Debit</th>
            {showBalance && <th className={styles.right}>Balance</th>}
          </tr>
        </thead>
        <tbody>
          {page.items.map((b) => (
            <Fragment key={b.booking_id}>
              <tr className={styles.row} onClick={() => toggle(b.booking_id)}>
                <td className={styles.chevronCell}>
                  <button
                    type="button"
                    aria-expanded={open.has(b.booking_id)}
                    aria-label="Show details"
                    className={styles.chevron}
                  >
                    <Icon name={open.has(b.booking_id) ? "chevronDown" : "chevronRight"} size={18} />
                  </button>
                </td>
                <td className={styles.nowrap}>{formatDate(b.booking_date)}</td>
                <td>
                  {b.counterparty_name && <div className={styles.strong}>{b.counterparty_name}</div>}
                  <div className={b.counterparty_name ? styles.sub : undefined}>{b.booking_text}</div>
                </td>
                {showAccount && (
                  <td>
                    <div>{b.account_name ?? b.account_id}</div>
                    <div className={styles.sub}>{b.account_id}</div>
                  </td>
                )}
                <td className={`${styles.right} ${styles.credit}`}>
                  {b.amount > 0 && `CHF +${formatNumber(b.amount)}`}
                </td>
                <td className={`${styles.right} ${styles.debit}`}>
                  {b.amount < 0 && `-CHF ${formatNumber(-b.amount)}`}
                </td>
                {showBalance && (
                  <td className={`${styles.right} ${styles.nowrap}`}>CHF {formatNumber(b.balance_after)}</td>
                )}
              </tr>
              {open.has(b.booking_id) && (
                <tr className={styles.details}>
                  <td colSpan={columns}>
                    <Details booking={b} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
          {page.items.length === 0 && (
            <tr>
              <td colSpan={columns} className={styles.empty}>
                No movements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <Pager
        total={page.total}
        offset={page.offset}
        count={page.items.length}
        onOffset={(o) => setPaging({ filterKey, offset: o })}
      />
    </div>
  );
}

function Details({ booking: b }: { booking: Booking }) {
  const rows: [string, string | null | undefined][] = [
    ["Booking ID", b.booking_id],
    ["Value date", formatDate(b.value_date)],
    ["Counterparty", b.counterparty_name],
    ["Counterparty IBAN", b.counterparty_iban],
    ["Reference / message", b.reference],
    ["Card", b.card_id],
    [
      "Original amount",
      b.original_amount != null && b.original_currency
        ? `${b.original_currency} ${formatNumber(b.original_amount)}`
        : null,
    ],
  ];
  return (
    <dl className={styles.detailList}>
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <Fragment key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </Fragment>
        ))}
    </dl>
  );
}

function Pager(props: { total: number; offset: number; count: number; onOffset: (o: number) => void }) {
  const { total, offset, count, onOffset } = props;
  if (total === 0) return null;
  return (
    <div className={styles.pager}>
      <span>
        {offset + 1}–{offset + count} of {total}
      </span>
      <button type="button" disabled={offset === 0} onClick={() => onOffset(Math.max(0, offset - PAGE_SIZE))}>
        Previous
      </button>
      <button type="button" disabled={offset + count >= total} onClick={() => onOffset(offset + PAGE_SIZE)}>
        Next
      </button>
    </div>
  );
}
