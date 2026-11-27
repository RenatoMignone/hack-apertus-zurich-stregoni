import type { Schemas } from "../api/client";
import { ContactCard } from "./SettingsProfile";
import styles from "./SettingsPage.module.css";

export function SettingsPageBody({
  customer,
  onReset,
  resetting,
}: {
  customer: Schemas["Customer"];
  onReset: () => void;
  resetting: boolean;
}) {
  return (
    <>
      <p className={styles.name}>
        {customer.first_name} {customer.last_name}
        <br />
        {customer.customer_id}
        {customer.children && (
          <>
            <br />
            Children: {customer.children}
          </>
        )}
      </p>
      <div style={{ maxWidth: 640 }}>
        <ContactCard customer={customer} />
      </div>
      <p className={styles.reset}>
        <button type="button" className={styles.resetLink} onClick={onReset} disabled={resetting}>
          Reset demo data
        </button>
      </p>
    </>
  );
}
