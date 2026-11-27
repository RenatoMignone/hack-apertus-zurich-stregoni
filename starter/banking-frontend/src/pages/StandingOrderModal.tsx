/** Create (POST) or edit (PATCH) a standing order. */
import { useState, type ChangeEvent } from "react";
import { useAccounts } from "../api/accounts";
import { fieldError } from "../api/client";
import { useCreateStandingOrder, useUpdateStandingOrder, type StandingOrder } from "../api/standingOrders";
import { useSystemInfo } from "../api/system";
import type { Schemas } from "../api/client";
import { Button } from "../components/Button";
import { SelectField, TextField } from "../components/Field";
import { Modal } from "../components/Modal";
import { ErrorTile } from "../components/QueryState";
import { CURRENCIES, FREQUENCIES } from "./PaymentForm";
import styles from "./Payments.module.css";

export function StandingOrderModal({ order, onClose }: { order: StandingOrder | null; onClose: () => void }) {
  const accounts = useAccounts().data?.items ?? [];
  const today = useSystemInfo().data?.today ?? "";
  const create = useCreateStandingOrder();
  const update = useUpdateStandingOrder();
  const mutation = order ? update : create;
  const [f, setF] = useState({
    debit_account_id: order?.debit_account_id ?? "",
    payee_name: order?.payee_name ?? "",
    payee_iban: order?.payee_iban ?? "",
    amount: order ? String(order.amount) : "",
    currency: (order?.currency ?? "CHF") as Schemas["Currency"],
    frequency: order?.frequency ?? "monthly",
    start_date: order?.start_date ?? today,
    end_date: order?.end_date ?? "",
    message: order?.message ?? "",
  });
  const set = (k: keyof typeof f) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value });
  const err = (...n: string[]) => fieldError(mutation.error, ...n);
  const debit = f.debit_account_id || accounts[0]?.account_id || "";

  const save = () => {
    const common = {
      payee_name: f.payee_name,
      payee_iban: f.payee_iban,
      amount: Number(f.amount),
      frequency: f.frequency,
      message: f.message || undefined,
    };
    if (order)
      update.mutate(
        { id: order.standing_order_id, body: { ...common, end_date: f.end_date || null } },
        { onSuccess: onClose },
      );
    else
      create.mutate(
        {
          ...common,
          debit_account_id: debit,
          currency: f.currency,
          start_date: f.start_date,
          end_date: f.end_date || undefined,
        },
        { onSuccess: onClose },
      );
  };

  return (
    <Modal
      title={order ? "Edit standing order" : "New standing order"}
      open
      onClose={onClose}
      width={680}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={mutation.isPending} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        {!order && (
          <div className={styles.full}>
            <SelectField
              label="Debit account"
              value={debit}
              onChange={set("debit_account_id")}
              error={err("debit_account_id")}
            >
              {accounts.map((a) => (
                <option key={a.account_id} value={a.account_id}>
                  {a.name} · {a.iban}
                </option>
              ))}
            </SelectField>
          </div>
        )}
        <TextField label="Recipient name" value={f.payee_name} onChange={set("payee_name")} error={err("payee_name")} />
        <TextField label="IBAN" value={f.payee_iban} onChange={set("payee_iban")} error={err("payee_iban")} />
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={f.amount}
          onChange={set("amount")}
          error={err("amount")}
        />
        <SelectField
          label="Currency"
          value={f.currency}
          onChange={set("currency")}
          disabled={!!order}
          error={err("currency")}
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <SelectField label="Frequency" value={f.frequency} onChange={set("frequency")} error={err("frequency")}>
          {FREQUENCIES.map((x) => (
            <option key={x.value} value={x.value}>
              {x.label}
            </option>
          ))}
        </SelectField>
        {!order && (
          <TextField
            label="Start date"
            type="date"
            value={f.start_date}
            onChange={set("start_date")}
            error={err("start_date")}
          />
        )}
        <TextField
          label="End date (optional)"
          type="date"
          value={f.end_date}
          onChange={set("end_date")}
          error={err("end_date")}
        />
        <div className={styles.full}>
          <TextField
            label="Message"
            maxLength={140}
            value={f.message}
            onChange={set("message")}
            error={err("message")}
          />
        </div>
      </div>
      {mutation.error &&
        !err(
          "debit_account_id",
          "payee_name",
          "payee_iban",
          "amount",
          "currency",
          "frequency",
          "start_date",
          "end_date",
          "message",
        ) && <ErrorTile message={mutation.error.message} />}
    </Modal>
  );
}
