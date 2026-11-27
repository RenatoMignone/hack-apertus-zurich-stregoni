/** Pending payments: next pending payments and standing orders, linking to the payment pages. */
import { useState } from "react";
import { Link } from "react-router";
import { usePayments } from "../../api/payments";
import { useStandingOrders } from "../../api/standingOrders";
import { Amount } from "../../components/Amount";
import { QueryState } from "../../components/QueryState";
import { Tabs } from "../../components/Tabs";
import { formatDate } from "../../format";
import { pagePath } from "../../routes";
import styles from "../widgets.module.css";

interface Row {
  id: string;
  name: string | null | undefined;
  status: string;
  amount: number;
  currency: string;
  date: string | null;
}

export function PendingPaymentsWidget() {
  const [tab, setTab] = useState<"payments" | "orders">("payments");
  return (
    <div>
      <Tabs
        tabs={[
          { value: "payments", label: "Payments" },
          { value: "orders", label: "Standing orders" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "payments" ? <PaymentRows /> : <OrderRows />}
    </div>
  );
}

function PaymentRows() {
  const payments = usePayments("pending");
  return (
    <QueryState query={payments}>
      {(data) => (
        <Rows
          rows={data.items.map((p) => ({
            id: p.payment_id,
            name: p.payee_name,
            status: "Pending",
            amount: p.amount,
            currency: p.currency,
            date: p.execution_date,
          }))}
          link={`${pagePath("payment-overview")}?tab=pending`}
          empty="No pending payments."
        />
      )}
    </QueryState>
  );
}

function OrderRows() {
  const orders = useStandingOrders();
  return (
    <QueryState query={orders}>
      {(data) => (
        <Rows
          rows={data.items.map((o) => ({
            id: o.standing_order_id,
            name: o.payee_name,
            status: "Standing order",
            amount: o.amount,
            currency: o.currency,
            date: o.next_execution_date,
          }))}
          link={pagePath("standing-orders")}
          empty="No standing orders."
        />
      )}
    </QueryState>
  );
}

function Rows({ rows, link, empty }: { rows: Row[]; link: string; empty: string }) {
  return (
    <>
      {rows.length === 0 && <p className={styles.muted}>{empty}</p>}
      <ul className={styles.rowList}>
        {rows.slice(0, 5).map((r) => (
          <li key={r.id} className={styles.rowItem}>
            <div className={styles.rowText}>
              <div>{r.name}</div>
              <div className={styles.muted}>{r.status}</div>
            </div>
            <div className={styles.rowAmount}>
              <Amount value={r.amount} currency={r.currency} />
              <div className={styles.muted}>{r.date ? formatDate(r.date) : "-"}</div>
            </div>
          </li>
        ))}
      </ul>
      <Link className={styles.sourceLink} to={link}>
        Show all
      </Link>
    </>
  );
}
