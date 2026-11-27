import { useState } from "react";
import { useParams } from "react-router";
import { useAccount, useBalancePreview } from "../api/accounts";
import { Amount } from "../components/Amount";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { SummaryBox } from "../components/SummaryBox";
import { Tabs } from "../components/Tabs";
import { formatDate } from "../format";
import { useTrustRoomSelection } from "../trustroom/TrustRoomProvider";
import { MovementsExport } from "./MovementsExport";
import { MovementsTable } from "./MovementsTable";
import styles from "./MovementsPage.module.css";

type Tab = "movements" | "preview";

/** Account detail: title, IBAN, balance box, movements and balance preview. */
export function AccountDetailPage() {
  const { accountId } = useParams();
  const account = useAccount(accountId);
  const [tab, setTab] = useState<Tab>("movements");
  const a = account.data;
  useTrustRoomSelection(a ? { title: a.name, account: { account_id: a.account_id, iban: a.iban, name: a.name } } : {});

  return (
    <QueryState query={account}>
      {(data) => (
        <>
          <PageHeader title={data.name} subtitle={data.iban} />
          <SummaryBox
            label="Current balance"
            value={data.current_balance}
            currency={data.currency}
            asOf={data.balance_date}
          />
          <Tabs
            tabs={[
              { value: "movements", label: "Account movements" },
              { value: "preview", label: "Balance preview" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "movements" ? (
            <>
              <div className={styles.toolbar}>
                <MovementsExport filter={{ account: data.account_id }} />
              </div>
              <MovementsTable filter={{ account: data.account_id }} showAccount={false} showBalance />
            </>
          ) : (
            <BalancePreview accountId={data.account_id} currency={data.currency} />
          )}
        </>
      )}
    </QueryState>
  );
}

function BalancePreview({ accountId, currency }: { accountId: string; currency: string }) {
  const preview = useBalancePreview(accountId);
  return (
    <QueryState query={preview}>
      {(p) => (
        <table className={styles.previewTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className={styles.right}>Amount</th>
              <th className={styles.right}>Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Today</td>
              <td>Current balance</td>
              <td />
              <td className={styles.right}>
                <Amount value={p.current_balance} currency={currency} />
              </td>
            </tr>
            {p.points.map((pt, i) => (
              <tr key={`${pt.source_id ?? i}-${pt.date}`}>
                <td>{formatDate(pt.date)}</td>
                <td>{pt.description}</td>
                <td className={styles.right}>
                  <Amount value={pt.amount} currency={currency} />
                </td>
                <td className={styles.right}>
                  <Amount value={pt.balance} currency={currency} />
                </td>
              </tr>
            ))}
            {p.points.length === 0 && (
              <tr>
                <td colSpan={4}>No upcoming payments.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </QueryState>
  );
}
