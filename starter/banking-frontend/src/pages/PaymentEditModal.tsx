/** Edit a pending payment (PATCH /payments/{id}). */
import { useState } from "react";
import { fieldError } from "../api/client";
import { useUpdatePayment, type Payment } from "../api/payments";
import { Button } from "../components/Button";
import { TextField } from "../components/Field";
import { ErrorTile } from "../components/QueryState";
import { Modal } from "../components/Modal";
import styles from "./Payments.module.css";

export function PaymentEditModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const update = useUpdatePayment();
  const [form, setForm] = useState({
    payee_name: payment.payee_name ?? "",
    amount: String(payment.amount),
    execution_date: payment.execution_date,
    message: payment.message ?? "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });
  const err = (f: string) => fieldError(update.error, f);

  const save = () =>
    update.mutate(
      {
        id: payment.payment_id,
        body: {
          payee_name: form.payee_name,
          amount: Number(form.amount),
          execution_date: form.execution_date,
          message: form.message,
        },
      },
      { onSuccess: onClose },
    );

  return (
    <Modal
      title="Edit payment"
      open
      onClose={onClose}
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={update.isPending} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <div className={styles.full}>
          <TextField label="Recipient" value={form.payee_name} onChange={set("payee_name")} error={err("payee_name")} />
        </div>
        <TextField
          label={`Amount (${payment.currency})`}
          type="number"
          step="0.01"
          value={form.amount}
          onChange={set("amount")}
          error={err("amount")}
        />
        <TextField
          label="Execution date"
          type="date"
          value={form.execution_date}
          onChange={set("execution_date")}
          error={err("execution_date")}
        />
        <div className={styles.full}>
          <TextField label="Message" value={form.message} onChange={set("message")} error={err("message")} />
        </div>
      </div>
      {update.error && !err("amount") && <ErrorTile message={update.error.message} />}
    </Modal>
  );
}
