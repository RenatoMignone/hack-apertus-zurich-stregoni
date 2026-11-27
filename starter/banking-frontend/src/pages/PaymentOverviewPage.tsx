/** Payment overview: pending and completed payment orders (`?tab=pending|completed`). */
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useAccounts } from "../api/accounts";
import { useDeletePayment, usePayments, type Payment } from "../api/payments";
import { Amount } from "../components/Amount";
import { Button } from "../components/Button";
import { ErrorTile, QueryState } from "../components/QueryState";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { SummaryBox } from "../components/SummaryBox";
import { Tabs } from "../components/Tabs";
import { formatDate } from "../format";
import { pagePath } from "../routes";
import { PaymentEditModal } from "./PaymentEditModal";
import styles from "./Payments.module.css";

type Tab = "pending" | "completed";

export function PaymentOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab: Tab = searchParams.get("tab") === "completed" ? "completed" : "pending";

  return (
    <>
      <PageHeader
        title="Payment overview"
        actions={
          <div className={styles.actions}>
            <Button onClick={() => navigate(pagePath("new-payment"))}>Enter payment</Button>
            <Button variant="secondary" onClick={() => navigate(pagePath("account-transfer"))}>
              Account transfer
            </Button>
          </div>
        }
      />
      <Tabs
        tabs={[
          { value: "pending", label: "Pending payments" },
          { value: "completed", label: "Completed payments" },
        ]}
        value={tab}
        onChange={(t) => setSearchParams({ tab: t })}
      />
      <PaymentList status={tab} />
    </>
  );
}

function PaymentList({ status }: { status: Tab }) {
  const payments = usePayments(status);
  const accounts = useAccounts();
  const remove = useDeletePayment();
  const [editing, setEditing] = useState<Payment | null>(null);
  const [deleting, setDeleting] = useState<Payment | null>(null);
  const accountOf = (id: string) => accounts.data?.items.find((a) => a.account_id === id);

  return (
    <>
      <QueryState query={payments}>
        {(data) => (
          <>
            <SummaryBox
              label={status === "pending" ? "Total pending payments" : "Total completed payments"}
              value={data.sum_chf}
              currency="CHF"
            />
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Execution date</th>
                  <th>Beneficiary</th>
                  <th>Debit account</th>
                  <th>Status</th>
                  <th className={styles.right}>Amount</th>
                  {status === "pending" && <th />}
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.payment_id}>
                    <td>{formatDate(p.execution_date)}</td>
                    <td>
                      {p.payee_name}
                      {p.message && <div className={styles.muted}>{p.message}</div>}
                    </td>
                    <td>
                      {accountOf(p.debit_account_id)?.name ?? p.debit_account_id}
                      <div className={styles.muted}>{accountOf(p.debit_account_id)?.iban}</div>
                    </td>
                    <td>{p.status === "pending" ? "Pending" : "Completed"}</td>
                    <td className={styles.right}>
                      <Amount value={p.amount} currency={p.currency} />
                    </td>
                    {status === "pending" && (
                      <td>
                        <div className={styles.rowActions}>
                          <Button variant="link" onClick={() => setEditing(p)}>
                            Edit
                          </Button>
                          <Button variant="link" onClick={() => setDeleting(p)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.items.length === 0 && <p className={styles.muted}>No payments.</p>}
          </>
        )}
      </QueryState>
      {editing && <PaymentEditModal payment={editing} onClose={() => setEditing(null)} />}
      <Modal
        title="Delete payment"
        open={!!deleting}
        onClose={() => setDeleting(null)}
        width={520}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.payment_id, { onSuccess: () => setDeleting(null) })}
            >
              Delete
            </Button>
          </>
        }
      >
        {deleting && (
          <p>
            Delete the pending payment of <Amount value={deleting.amount} currency={deleting.currency} /> to{" "}
            {deleting.payee_name}?
          </p>
        )}
        {remove.error && <ErrorTile message={remove.error.message} />}
      </Modal>
    </>
  );
}
