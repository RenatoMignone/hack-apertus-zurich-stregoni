import { Link } from "react-router";
import { useAccounts } from "../../api/accounts";
import { Amount } from "../../components/Amount";
import { QueryState } from "../../components/QueryState";
import { pagePath } from "../../routes";
import styles from "../widgets.module.css";

export function AccountBalancesWidget() {
  const accounts = useAccounts();
  return (
    <QueryState query={accounts}>
      {(data) => (
        <ul className={styles.rowList}>
          {data.items.map((a) => (
            <li key={a.account_id} className={styles.rowItem}>
              <div className={styles.rowText}>
                <Link to={`${pagePath("account-overview")}/${a.account_id}`}>{a.name}</Link>
                <div className={styles.muted}>{a.iban}</div>
              </div>
              <Amount value={a.current_balance} currency={a.currency} />
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
}
