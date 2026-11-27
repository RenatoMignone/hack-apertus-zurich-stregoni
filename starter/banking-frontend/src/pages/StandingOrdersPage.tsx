/** Standing orders: list, create, edit, delete. */
import { useState } from "react";
import { useSystemInfo } from "../api/system";
import { useDeleteStandingOrder, useStandingOrders, type StandingOrder } from "../api/standingOrders";
import { Amount } from "../components/Amount";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { ErrorTile, QueryState } from "../components/QueryState";
import { formatDate } from "../format";
import { FREQUENCIES } from "./PaymentForm";
import styles from "./Payments.module.css";
import { StandingOrderModal } from "./StandingOrderModal";

export function StandingOrdersPage() {
  const orders = useStandingOrders();
  const remove = useDeleteStandingOrder();
  const system = useSystemInfo(); // the modal needs the demo today as its start-date default
  // undefined = closed, null = create, order = edit
  const [editing, setEditing] = useState<StandingOrder | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<StandingOrder | null>(null);

  return (
    <>
      <PageHeader
        title="Standing orders"
        actions={<Button onClick={() => setEditing(null)}>New standing order</Button>}
      />
      <QueryState query={orders}>
        {(data) => (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Frequency</th>
                <th>Next execution</th>
                <th>End date</th>
                <th className={styles.right}>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.muted}>
                    No standing orders.
                  </td>
                </tr>
              )}
              {data.items.map((o) => (
                <tr key={o.standing_order_id}>
                  <td>
                    {o.payee_name}
                    {o.message && <div className={styles.muted}>{o.message}</div>}
                  </td>
                  <td>{FREQUENCIES.find((f) => f.value === o.frequency)?.label}</td>
                  <td>{o.next_execution_date ? formatDate(o.next_execution_date) : "-"}</td>
                  <td>{o.end_date ? formatDate(o.end_date) : "-"}</td>
                  <td className={styles.right}>
                    <Amount value={o.amount} currency={o.currency} />
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Button variant="link" onClick={() => setEditing(o)}>
                        Edit
                      </Button>
                      <Button variant="link" onClick={() => setDeleting(o)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </QueryState>
      {editing !== undefined && system.data && (
        <StandingOrderModal order={editing} onClose={() => setEditing(undefined)} />
      )}
      <Modal
        title="Delete standing order"
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
              onClick={() =>
                deleting && remove.mutate(deleting.standing_order_id, { onSuccess: () => setDeleting(null) })
              }
            >
              Delete
            </Button>
          </>
        }
      >
        {deleting && <p>Delete the standing order to {deleting.payee_name}?</p>}
        {remove.error && <ErrorTile message={remove.error.message} />}
      </Modal>
    </>
  );
}
