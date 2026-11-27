/** Transfer between own accounts. Used by /payments/transfer and the Account transfer widget. */
import { useState } from "react";
import { useAccounts } from "../api/accounts";
import { fieldError } from "../api/client";
import { useCreatePayment } from "../api/payments";
import { useSystemInfo } from "../api/system";
import type { Schemas } from "../api/client";
import { Amount } from "../components/Amount";
import { Button } from "../components/Button";
import { SelectField, TextField } from "../components/Field";
import { ErrorTile, QueryState } from "../components/QueryState";
import { formatDate } from "../format";
import { CURRENCIES } from "./PaymentForm";
import styles from "./Payments.module.css";

export interface TransferPrefill {
  from?: string | null;
  to?: string | null;
  amount?: string | null;
  date?: string | null;
}

export function AccountTransferForm({ prefill = {} }: { prefill?: TransferPrefill }) {
  const accounts = useAccounts();
  const system = useSystemInfo();
  return (
    <QueryState query={accounts}>
      {(acc) => (
        <QueryState query={system}>
          {(sys) => <Form accounts={acc.items} today={sys.today} prefill={prefill} />}
        </QueryState>
      )}
    </QueryState>
  );
}

function Form({
  accounts,
  today,
  prefill,
}: {
  accounts: Schemas["Account"][];
  today: string;
  prefill: TransferPrefill;
}) {
  const create = useCreatePayment();
  const [from, setFrom] = useState(prefill.from ?? accounts[0]?.account_id ?? "");
  const [to, setTo] = useState(
    prefill.to ?? accounts.find((a) => a.account_id !== (prefill.from ?? accounts[0]?.account_id))?.account_id ?? "",
  );
  const [amount, setAmount] = useState(prefill.amount ?? "");
  const [currency, setCurrency] = useState<Schemas["Currency"]>(
    accounts.find((a) => a.account_id === from)?.currency ?? "CHF",
  );
  const [date, setDate] = useState(prefill.date ?? today);
  const err = (...f: string[]) => fieldError(create.error, ...f);

  const submit = () =>
    create.mutate({
      payment_type: "account_transfer",
      debit_account_id: from,
      credit_account_id: to,
      amount: Number(amount),
      currency,
      execution_date: date,
    });
  const options = accounts.map((a) => (
    <option key={a.account_id} value={a.account_id}>
      {a.name} · {a.iban}
    </option>
  ));
  const p = create.data;

  return (
    <div>
      {p && (
        <div className={styles.ok} role="status">
          Status: <strong>{p.status === "completed" ? "Completed" : "Pending"}</strong> ·{" "}
          <Amount value={p.amount} currency={p.currency} /> to {p.payee_name} on {formatDate(p.execution_date)}
        </div>
      )}
      <div className={styles.form}>
        <div className={styles.full}>
          <SelectField
            label="Debit account"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            error={err("debit_account_id")}
          >
            {options}
          </SelectField>
        </div>
        <div className={styles.full}>
          <SelectField
            label="Credit account"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            error={err("credit_account_id")}
          >
            {options}
          </SelectField>
        </div>
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={err("amount")}
        />
        <SelectField
          label="Currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Schemas["Currency"])}
          error={err("currency")}
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <div className={styles.full}>
          <TextField
            label="Execution date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={err("execution_date")}
          />
        </div>
      </div>
      {create.error && !err("debit_account_id", "credit_account_id", "amount", "currency", "execution_date") && (
        <ErrorTile message={create.error.message} />
      )}
      <div className={styles.buttons}>
        <Button disabled={create.isPending} onClick={submit}>
          Execute
        </Button>
      </div>
    </div>
  );
}
