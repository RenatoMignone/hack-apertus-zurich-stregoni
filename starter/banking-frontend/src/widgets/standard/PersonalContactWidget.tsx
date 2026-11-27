import { useCustomer } from "../../api/customer";
import { Button } from "../../components/Button";
import { QueryState } from "../../components/QueryState";
import styles from "../widgets.module.css";

/** Advisor name and phone; "Send message" is a dummy. */
export function PersonalContactWidget() {
  const customer = useCustomer();
  return (
    <QueryState query={customer}>
      {({ advisor }) => (
        <>
          <div className={styles.contactName}>{advisor.name}</div>
          <div className={styles.contactPhone}>{advisor.phone}</div>
          <Button variant="secondary">Send message</Button>
        </>
      )}
    </QueryState>
  );
}
