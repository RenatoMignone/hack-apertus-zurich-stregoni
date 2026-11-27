/** Account transfer between own accounts. Deep link: /payments/transfer?from=&to=&amount=&date= */
import { useSearchParams } from "react-router";
import { PageHeader } from "../components/PageHeader";
import { AccountTransferForm } from "./AccountTransferForm";
import styles from "./Payments.module.css";

export function AccountTransferPage() {
  const [params] = useSearchParams();
  return (
    <>
      <PageHeader title="Account transfer" />
      <div className={styles.panel}>
        <AccountTransferForm
          prefill={{
            from: params.get("from"),
            to: params.get("to"),
            amount: params.get("amount"),
            date: params.get("date"),
          }}
        />
      </div>
    </>
  );
}
