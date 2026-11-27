/** Loans widget: each tranche with rate, maturity and balance, plus the API's total. */
import { Link } from "react-router";
import { rateLabel, useLoans } from "../../api/loans";
import { Amount } from "../../components/Amount";
import { QueryState } from "../../components/QueryState";
import { formatDate } from "../../format";
import { pagePath } from "../../routes";
import styles from "../widgets.module.css";

export function LoansWidget() {
  const loans = useLoans();
  return (
    <QueryState query={loans}>
      {(data) =>
        data.items.length === 0 ? (
          <div className={styles.muted}>No loans.</div>
        ) : (
          <>
            <ul className={styles.rowList}>
              {data.items.map((loan) => (
                <li key={loan.loan_id} className={styles.rowItem}>
                  <div className={styles.rowText}>
                    <Link to={`${pagePath("loans")}/${loan.loan_id}`}>{loan.product}</Link>
                    <div className={styles.muted}>
                      {rateLabel(loan)} · until {formatDate(loan.maturity_date)}
                    </div>
                  </div>
                  <Amount value={loan.balance} currency={loan.currency} />
                </li>
              ))}
              <li className={styles.rowItem}>
                <strong>Total</strong>
                <Amount value={data.total_balance_chf} currency="CHF" />
              </li>
            </ul>
            <Link className={styles.sourceLink} to={pagePath("loans")}>
              Show loans
            </Link>
          </>
        )
      }
    </QueryState>
  );
}
