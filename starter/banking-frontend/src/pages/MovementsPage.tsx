import { Link, useSearchParams } from "react-router";
import { useAccounts } from "../api/accounts";
import { useBookings } from "../api/bookings";
import { PageHeader } from "../components/PageHeader";
import { useTrustRoomSelection } from "../trustroom/TrustRoomProvider";
import type { MovementsFilter } from "../trustroom/protocol";
import { MovementsExport } from "./MovementsExport";
import { MovementsFilterBar } from "./MovementsFilterBar";
import { MovementsTable, PAGE_SIZE } from "./MovementsTable";
import styles from "./MovementsPage.module.css";

/** URL params of the movements page = filters of GET /bookings (docs §5). */
const FILTER_KEYS = ["account", "from", "to", "q", "amount_min", "amount_max", "direction", "ids", "card"] as const;

/** Account movements. All filters live in the URL, so every view is a deep link. */
export function MovementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter: MovementsFilter = {};
  for (const key of FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value) filter[key] = value;
  }
  const accounts = useAccounts().data?.items ?? [];
  const accountIds = filter.account?.split(",") ?? [];
  const account =
    accountIds.length === 1
      ? accounts.find((a) => a.account_id === accountIds[0] || a.iban === accountIds[0])
      : undefined;
  useTrustRoomSelection({
    movements_filter: filter,
    account: account ? { account_id: account.account_id, iban: account.iban, name: account.name } : null,
  });

  // Replace, not push: refining a filter shouldn't add a history entry per change.
  const setFilter = (key: keyof MovementsFilter, value: string) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  return (
    <>
      <PageHeader title="Account movements" />
      {filter.ids && <SelectionBanner filter={filter} />}
      <MovementsFilterBar filter={filter} accounts={accounts} onChange={setFilter} />
      <div className={styles.toolbar}>
        <MovementsExport filter={filter} />
      </div>
      <MovementsTable filter={filter} showAccount={!account} showBalance={!!account} />
    </>
  );
}

function SelectionBanner({ filter }: { filter: MovementsFilter }) {
  const total = useBookings(filter, PAGE_SIZE, 0).data?.total;
  return (
    <div className={styles.banner}>
      <span>Showing {total ?? "…"} selected bookings</span>
      <Link to="/movements">Clear selection</Link>
    </div>
  );
}
