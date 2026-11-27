/** New payment: choose recipient or type, fill the form, review, confirm. Prefilled via URL params (docs §5). */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAccounts } from "../api/accounts";
import { usePayees } from "../api/payees";
import { useCreatePayment, type Payment } from "../api/payments";
import { useCreateStandingOrder, type StandingOrder } from "../api/standingOrders";
import { useSystemInfo } from "../api/system";
import type { Schemas } from "../api/client";
import { Amount } from "../components/Amount";
import { Button } from "../components/Button";
import { TextField } from "../components/Field";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { Tabs } from "../components/Tabs";
import { formatDate } from "../format";
import { pagePath } from "../routes";
import { PaymentForm, PaymentReview, type PaymentFormValues, type PaymentType } from "./PaymentForm";
import styles from "./Payments.module.css";

type Account = Schemas["Account"];
type Step = "select" | "form" | "review" | "done";
type Result = { payment: Payment } | { standingOrder: StandingOrder };

export function NewPaymentPage() {
  const accounts = useAccounts();
  const system = useSystemInfo();
  return (
    <>
      <PageHeader title="New payment" />
      <QueryState query={accounts}>
        {(acc) => <QueryState query={system}>{(sys) => <Flow accounts={acc.items} today={sys.today} />}</QueryState>}
      </QueryState>
    </>
  );
}

function initialValues(params: URLSearchParams, accounts: Account[], today: string): PaymentFormValues {
  const account = accounts.find((a) => a.account_id === params.get("account")) ?? accounts[0];
  const currency = params.get("currency")?.toUpperCase();
  return {
    payment_type: "domestic",
    debit_account_id: account?.account_id ?? "",
    payee_name: params.get("name") ?? "",
    payee_iban: params.get("iban") ?? "",
    street: "",
    zip: "",
    city: "",
    country: "CH",
    amount: params.get("amount") ?? "",
    currency: (["CHF", "EUR", "USD", "GBP"].includes(currency ?? "")
      ? currency
      : "CHF") as PaymentFormValues["currency"],
    execution_date: params.get("date") ?? today,
    message: params.get("message") ?? "",
    standing: false,
    frequency: "monthly",
    end_date: "",
  };
}

const PREFILL_KEYS = ["iban", "name", "amount", "currency", "date", "message"];

function Flow({ accounts, today }: { accounts: Account[]; today: string }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(() => initialValues(params, accounts, today));
  const [step, setStep] = useState<Step>(PREFILL_KEYS.some((k) => params.has(k)) ? "form" : "select");
  const [result, setResult] = useState<Result | null>(null);
  const createPayment = useCreatePayment();
  const createOrder = useCreateStandingOrder();
  const error = createPayment.error ?? createOrder.error;

  const pick = (patch: Partial<PaymentFormValues>) => {
    setValues({ ...values, ...patch });
    setStep("form");
  };

  const confirm = () => {
    const common = {
      debit_account_id: values.debit_account_id,
      payee_name: values.payee_name,
      payee_iban: values.payee_iban,
      amount: Number(values.amount),
      currency: values.currency,
      message: values.message || undefined,
    };
    const onError = () => setStep("form");
    if (values.standing) {
      createOrder.mutate(
        {
          ...common,
          frequency: values.frequency,
          start_date: values.execution_date,
          end_date: values.end_date || undefined,
        },
        { onSuccess: (standingOrder) => (setResult({ standingOrder }), setStep("done")), onError },
      );
      return;
    }
    const payee_address =
      values.street || values.city
        ? { street: values.street, zip: values.zip, city: values.city, country: values.country }
        : undefined;
    createPayment.mutate(
      { ...common, payment_type: values.payment_type, execution_date: values.execution_date, payee_address },
      { onSuccess: (payment) => (setResult({ payment }), setStep("done")), onError },
    );
  };

  if (step === "select") return <SelectStep onPick={pick} onTransfer={() => navigate(pagePath("account-transfer"))} />;
  if (step === "done" && result)
    return (
      <Done
        result={result}
        onContinue={() =>
          navigate("payment" in result ? `${pagePath("payment-overview")}?tab=pending` : pagePath("standing-orders"))
        }
      />
    );
  if (step === "review")
    return (
      <PaymentReview
        values={values}
        account={accounts.find((a) => a.account_id === values.debit_account_id)}
        error={error}
        pending={createPayment.isPending || createOrder.isPending}
        onConfirm={confirm}
        onBack={() => setStep("form")}
      />
    );
  return (
    <PaymentForm
      values={values}
      onChange={setValues}
      accounts={accounts}
      error={error}
      onSubmit={() => (createPayment.reset(), createOrder.reset(), setStep("review"))}
      onBack={() => setStep("select")}
    />
  );
}

function SelectStep({
  onPick,
  onTransfer,
}: {
  onPick: (patch: Partial<PaymentFormValues>) => void;
  onTransfer: () => void;
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"manual" | "last">("manual");
  const typed = q.trim();
  const payees = usePayees(useDebounced(typed));
  const looksLikeIban = /^[A-Za-z]{2}\d{2}[\s\dA-Za-z]{8,}$/.test(typed);
  const pickType = (payment_type: PaymentType) => () => onPick({ payment_type });

  return (
    <div className={styles.panel}>
      <p>Enter the IBAN, recipient name or keyword.</p>
      <div className={styles.search}>
        <TextField label="Search payment or enter IBAN" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {typed ? (
        <div className={styles.results}>
          {looksLikeIban && (
            <button type="button" className={styles.result} onClick={() => onPick({ payee_iban: typed })}>
              Pay to IBAN {typed}
            </button>
          )}
          {payees.data?.items.map((p) => (
            <button
              key={p.payee_id}
              type="button"
              className={styles.result}
              onClick={() => onPick({ payee_name: p.name, payee_iban: p.iban ?? "", city: p.city ?? "" })}
            >
              {p.name}
              <div className={styles.muted}>{p.iban}</div>
            </button>
          ))}
          {!looksLikeIban && payees.data?.items.length === 0 && (
            <div className={styles.result}>No recipients found.</div>
          )}
        </div>
      ) : (
        <>
          <Tabs
            tabs={[
              { value: "manual", label: "Manual selection" },
              { value: "last", label: "Last payments" },
            ]}
            value={tab}
            onChange={setTab}
          />
          {tab === "manual" ? (
            <div className={styles.methods}>
              <strong>Payment method</strong>
              <button type="button" className={styles.method} onClick={pickType("domestic")}>
                Domestic payment / QR-bill
              </button>
              <button type="button" className={styles.method} onClick={pickType("international")}>
                International payment
              </button>
              <button type="button" className={styles.method} onClick={onTransfer}>
                Account transfer
              </button>
            </div>
          ) : (
            <QueryState query={payees}>
              {(data) => (
                <div className={styles.results}>
                  {data.items.map((p) => (
                    <button
                      key={p.payee_id}
                      type="button"
                      className={styles.result}
                      onClick={() => onPick({ payee_name: p.name, payee_iban: p.iban ?? "", city: p.city ?? "" })}
                    >
                      {p.name}
                      <div className={styles.muted}>
                        {p.iban}
                        {p.last_payment_date && ` · last payment ${formatDate(p.last_payment_date)}`}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </QueryState>
          )}
        </>
      )}
    </div>
  );
}

/** The value once it has stopped changing for a moment: one recipient search per typing pause. */
function useDebounced(value: string, delayMs = 300): string {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}

function Done({ result, onContinue }: { result: Result; onContinue: () => void }) {
  return (
    <div className={styles.panel}>
      <h2>{"payment" in result ? "Payment captured" : "Standing order created"}</h2>
      <div className={styles.ok} role="status">
        {"payment" in result ? (
          <>
            Status: <strong>{result.payment.status === "completed" ? "Completed" : "Pending"}</strong> ·{" "}
            {result.payment.payment_id} · <Amount value={result.payment.amount} currency={result.payment.currency} /> to{" "}
            {result.payment.payee_name} on {formatDate(result.payment.execution_date)}
          </>
        ) : (
          <>
            {result.standingOrder.standing_order_id} ·{" "}
            <Amount value={result.standingOrder.amount} currency={result.standingOrder.currency} /> to{" "}
            {result.standingOrder.payee_name}, next execution{" "}
            {result.standingOrder.next_execution_date ? formatDate(result.standingOrder.next_execution_date) : "-"}
          </>
        )}
      </div>
      <div className={styles.buttons}>
        <Button onClick={onContinue}>{"payment" in result ? "Go to payment overview" : "Go to standing orders"}</Button>
      </div>
    </div>
  );
}
