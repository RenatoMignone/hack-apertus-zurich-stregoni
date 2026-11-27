import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import type { Schemas } from "../api/client";
import { SelectField, TextField } from "../components/Field";
import type { MovementsFilter } from "../trustroom/protocol";
import styles from "./MovementsPage.module.css";

type Account = Schemas["Account"];

/** Typing pause after which a text or amount filter is written to the URL. */
const COMMIT_DELAY_MS = 300;

/** Filter bar: every field edits one URL param (docs §5). Empty value removes the param. */
export function MovementsFilterBar(props: {
  filter: MovementsFilter;
  accounts: Account[];
  lockAccount?: boolean;
  onChange: (key: keyof MovementsFilter, value: string) => void;
}) {
  const { filter, accounts, onChange } = props;
  const bind = (key: keyof MovementsFilter) => ({
    value: filter[key] ?? "",
    onChange: (e: { target: { value: string } }) => onChange(key, e.target.value),
  });
  const single = filter.account && !filter.account.includes(",") ? filter.account : "";
  const selected =
    accounts.find((a) => a.account_id === single || a.iban === single)?.account_id ??
    (filter.account ? "__custom" : "");

  return (
    <div className={styles.filterBar}>
      <TextField label="From" type="date" {...bind("from")} />
      <TextField label="To" type="date" {...bind("to")} />
      {!props.lockAccount && (
        <SelectField
          label="Account"
          value={selected}
          onChange={(e) => onChange("account", e.target.value === "__custom" ? (filter.account ?? "") : e.target.value)}
        >
          <option value="">All accounts</option>
          {filter.account && selected === "__custom" && <option value="__custom">{filter.account}</option>}
          {accounts.map((a) => (
            <option key={a.account_id} value={a.account_id}>
              {a.name}
            </option>
          ))}
        </SelectField>
      )}
      <DraftField
        label="Amount from (CHF)"
        type="number"
        min="0"
        step="0.01"
        value={filter.amount_min ?? ""}
        onCommit={(v) => onChange("amount_min", v)}
      />
      <DraftField
        label="Amount to (CHF)"
        type="number"
        min="0"
        step="0.01"
        value={filter.amount_max ?? ""}
        onCommit={(v) => onChange("amount_max", v)}
      />
      <SelectField label="Type" {...bind("direction")}>
        <option value="">Credit and debit</option>
        <option value="credit">Credit</option>
        <option value="debit">Debit</option>
      </SelectField>
      <DraftField
        label="Search"
        type="search"
        placeholder="Text, merchant, IBAN"
        value={filter.q ?? ""}
        onCommit={(v) => onChange("q", v)}
      />
    </div>
  );
}

type DraftFieldProps = { label: string; value: string; onCommit: (value: string) => void } & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>;

/**
 * Text field that writes to the URL only after a typing pause, so typing doesn't fire one request
 * (and one table refresh) per keystroke. It follows the URL when the filter changes from outside
 * (deep link, TrustRoom navigation, "Clear selection").
 */
function DraftField({ value, onCommit, ...input }: DraftFieldProps) {
  const [draft, setDraft] = useState(value);
  const [seen, setSeen] = useState(value);
  const [committed, setCommitted] = useState(value);
  if (value !== seen) {
    setSeen(value);
    // Our own commit coming back from the URL must not overwrite what was typed since.
    if (value !== committed) {
      setDraft(value);
      setCommitted(value);
    }
  }

  const commit = useRef(onCommit);
  useEffect(() => {
    commit.current = onCommit;
  });
  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => {
      setCommitted(draft);
      commit.current(draft);
    }, COMMIT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, value]);

  return <TextField {...input} value={draft} onChange={(e) => setDraft(e.target.value)} />;
}
