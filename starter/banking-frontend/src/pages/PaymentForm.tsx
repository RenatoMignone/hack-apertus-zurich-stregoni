/** Payment entry form and review for /payments/new. State lives in the page; this renders and validates nothing itself (the API does). */
import type { ChangeEvent } from "react";
import { fieldError } from "../api/client";
import type { Schemas } from "../api/client";

type Account = Schemas["Account"];
import { Button } from "../components/Button";
import { SelectField, TextField } from "../components/Field";
import { ErrorTile } from "../components/QueryState";
import { formatAmount, formatDate } from "../format";
import styles from "./Payments.module.css";

export type Frequency = Schemas["StandingOrderFrequency"];
export type PaymentType = "domestic" | "international";

export interface PaymentFormValues {
  payment_type: PaymentType;
  debit_account_id: string;
  payee_name: string;
  payee_iban: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  amount: string;
  currency: Schemas["Currency"];
  execution_date: string;
  message: string;
  standing: boolean;
  frequency: Frequency;
  end_date: string;
}

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semiannually", label: "Semi-annually" },
  { value: "annually", label: "Annually" },
];
export const CURRENCIES: Schemas["Currency"][] = ["CHF", "EUR", "USD", "GBP"];

type Props = {
  values: PaymentFormValues;
  onChange: (values: PaymentFormValues) => void;
  accounts: Account[];
  error: Error | null;
  onSubmit: () => void;
  onBack: () => void;
};

export function PaymentForm({ values, onChange, accounts, error, onSubmit, onBack }: Props) {
  const set = (k: keyof PaymentFormValues) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({
      ...values,
      [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
    });
  const err = (...f: string[]) => fieldError(error, ...f);
  const unmatched =
    error &&
    !err(
      "debit_account_id",
      "payee_name",
      "payee_iban",
      "amount",
      "currency",
      "execution_date",
      "start_date",
      "message",
      "end_date",
    );

  return (
    <div className={styles.panel}>
      <h2>{values.payment_type === "domestic" ? "Domestic payment / QR-bill" : "International payment"}</h2>
      <div className={styles.form}>
        <div className={styles.full}>
          <SelectField
            label="Debit account"
            value={values.debit_account_id}
            onChange={set("debit_account_id")}
            error={err("debit_account_id")}
          >
            {accounts.map((a) => (
              <option key={a.account_id} value={a.account_id}>
                {a.name} · {a.iban} · {formatAmount(a.current_balance, a.currency)}
              </option>
            ))}
          </SelectField>
        </div>
        <TextField
          label="Recipient name"
          value={values.payee_name}
          onChange={set("payee_name")}
          error={err("payee_name")}
        />
        <TextField label="IBAN" value={values.payee_iban} onChange={set("payee_iban")} error={err("payee_iban")} />
        <TextField label="Street" value={values.street} onChange={set("street")} />
        <TextField label="ZIP" value={values.zip} onChange={set("zip")} />
        <TextField label="City" value={values.city} onChange={set("city")} />
        <TextField label="Country" value={values.country} onChange={set("country")} />
        <TextField
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={values.amount}
          onChange={set("amount")}
          error={err("amount")}
        />
        <SelectField label="Currency" value={values.currency} onChange={set("currency")} error={err("currency")}>
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </SelectField>
        <TextField
          label="Execution date"
          type="date"
          value={values.execution_date}
          onChange={set("execution_date")}
          error={err("execution_date", "start_date")}
        />
        <TextField
          label="Message"
          maxLength={140}
          value={values.message}
          onChange={set("message")}
          error={err("message")}
        />
        <label className={`${styles.full} ${styles.check}`}>
          <input type="checkbox" checked={values.standing} onChange={set("standing")} /> Save as standing order
        </label>
        {values.standing && (
          <>
            <SelectField label="Frequency" value={values.frequency} onChange={set("frequency")}>
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </SelectField>
            <TextField
              label="End date (optional)"
              type="date"
              value={values.end_date}
              onChange={set("end_date")}
              error={err("end_date")}
            />
          </>
        )}
      </div>
      {unmatched && <ErrorTile message={error.message} />}
      <div className={styles.buttons}>
        <Button onClick={onSubmit}>Continue</Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}

export function PaymentReview({
  values,
  account,
  error,
  pending,
  onConfirm,
  onBack,
}: {
  values: PaymentFormValues;
  account?: Account;
  error: Error | null;
  pending: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const freq = FREQUENCIES.find((f) => f.value === values.frequency)?.label;
  const rows: [string, string][] = [
    ["Debit account", account ? `${account.name} · ${account.iban}` : values.debit_account_id],
    ["Recipient", values.payee_name],
    ["IBAN", values.payee_iban],
    ["Amount", formatAmount(Number(values.amount), values.currency)],
    ["Execution date", formatDate(values.execution_date)],
    ["Message", values.message || "-"],
  ];
  if (values.standing)
    rows.push(["Standing order", `${freq}${values.end_date ? ` until ${formatDate(values.end_date)}` : ""}`]);
  return (
    <div className={styles.panel}>
      <h2>Review payment</h2>
      <dl className={styles.review}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "contents" }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {error && <ErrorTile message={error.message} />}
      <div className={styles.buttons}>
        <Button disabled={pending} onClick={onConfirm}>
          Confirm
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
