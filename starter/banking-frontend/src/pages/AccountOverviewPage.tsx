/** Account overview: total liquidity plus all accounts as tiles or list (`?view=tiles|list`). */
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Schemas } from "../api/client";
import { useAccounts } from "../api/accounts";
import { Amount } from "../components/Amount";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { SummaryBox } from "../components/SummaryBox";
import { formatDate } from "../format";
import { pagePath } from "../routes";
import styles from "./AccountOverviewPage.module.css";

type Account = Schemas["Account"];

export function AccountOverviewPage() {
  const accounts = useAccounts();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "list" ? "list" : "tiles";

  return (
    <>
      <PageHeader title="Account overview" />
      <QueryState query={accounts}>
        {(data) => (
          <>
            <SummaryBox label="Total liquidity" value={data.total_liquidity_chf} currency="CHF" asOf={data.as_of} />
            <div className={styles.sectionHeader}>
              <h2>Accounts</h2>
              <div className={styles.toggle}>
                <ViewButton
                  icon="grid"
                  label="Tile view"
                  active={view === "tiles"}
                  onClick={() => setSearchParams({ view: "tiles" })}
                />
                <ViewButton
                  icon="list"
                  label="List view"
                  active={view === "list"}
                  onClick={() => setSearchParams({ view: "list" })}
                />
              </div>
            </div>
            {view === "tiles" ? <AccountTiles accounts={data.items} /> : <AccountList accounts={data.items} />}
          </>
        )}
      </QueryState>
    </>
  );
}

function ViewButton(props: { icon: "grid" | "list"; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.viewButton} ${props.active ? styles.viewActive : ""}`}
      onClick={props.onClick}
      aria-label={props.label}
      aria-pressed={props.active}
    >
      <Icon name={props.icon} size={24} />
    </button>
  );
}

const accountPath = (a: Account) => `${pagePath("account-overview")}/${a.account_id}`;

function AccountTiles({ accounts }: { accounts: Account[] }) {
  return (
    <div className={styles.tiles}>
      {accounts.map((a) => (
        <Link key={a.account_id} to={accountPath(a)} className={styles.tile}>
          <div className={styles.tileName}>{a.name}</div>
          <div className={styles.tileMeta}>{a.iban}</div>
          <div className={styles.tileBalance}>
            <Amount value={a.current_balance} currency={a.currency} />
            <div className={styles.tileMeta}>{formatDate(a.balance_date)}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

type SortKey = "name" | "iban" | "currency" | "current_balance";
const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "name", label: "Account name" },
  { key: "iban", label: "IBAN" },
  { key: "currency", label: "Currency" },
  { key: "current_balance", label: "Balance", numeric: true },
];

function AccountList({ accounts }: { accounts: Account[] }) {
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean } | null>(null);
  const rows = sort
    ? [...accounts].sort((a, b) => {
        const [x, y] = [a[sort.key], b[sort.key]];
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.asc ? cmp : -cmp;
      })
    : accounts;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((c) => (
            <th key={c.key} className={c.numeric ? styles.right : undefined}>
              <button
                type="button"
                onClick={() => setSort({ key: c.key, asc: sort?.key === c.key ? !sort.asc : true })}
              >
                {c.label}
                {sort?.key === c.key && (sort.asc ? " ▲" : " ▼")}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((a) => (
          <tr key={a.account_id}>
            <td>
              <Link to={accountPath(a)}>{a.name}</Link>
            </td>
            <td>{a.iban}</td>
            <td>{a.currency}</td>
            <td className={styles.right}>
              <Amount value={a.current_balance} currency={a.currency} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
