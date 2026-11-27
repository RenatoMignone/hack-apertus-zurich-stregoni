/** Loans: the customer's mortgage tranches with the API's totals. Each row opens the tranche (`/loans/{loanId}`). */
import { Link } from "react-router";
import { rateLabel, useLoans } from "../api/loans";
import { Amount } from "../components/Amount";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { SummaryBox } from "../components/SummaryBox";
import { formatAmount, formatDate, formatNumber } from "../format";
import { pagePath } from "../routes";
import styles from "./Loans.module.css";

export function LoansPage() {
  const loans = useLoans();
  return (
    <>
      <PageHeader title="Loans" />
      <QueryState query={loans}>
        {(data) =>
          data.items.length === 0 ? (
            <p className={styles.hint}>You don't have any loans with us.</p>
          ) : (
            <>
              <SummaryBox
                label="Total loans"
                value={data.total_balance_chf}
                currency="CHF"
                asOf={data.items[0].balance_date}
              />
              <div className={styles.facts}>
                <Fact
                  label="Interest per year at today's rates"
                  value={formatAmount(data.annual_interest_chf, "CHF")}
                />
                {data.loan_to_value_pct !== null && (
                  <Fact label="Loan-to-value" value={`${formatNumber(data.loan_to_value_pct)}%`} />
                )}
                <Fact label="Property" value={data.items[0].property_name ?? ""} />
              </div>
              <Card title="Tranches">
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tranche</th>
                      <th>Interest rate</th>
                      <th>Maturity</th>
                      <th>Next interest</th>
                      <th className={styles.right}>Interest per year</th>
                      <th className={styles.right}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((loan) => (
                      <tr key={loan.loan_id}>
                        <td>
                          <Link className={styles.link} to={`${pagePath("loans")}/${loan.loan_id}`}>
                            {loan.product}
                          </Link>
                          <span className={styles.sub}>{loan.number}</span>
                        </td>
                        <td>{rateLabel(loan)}</td>
                        <td>{formatDate(loan.maturity_date)}</td>
                        <td>{formatDate(loan.next_interest_date)}</td>
                        <td className={styles.right}>
                          <Amount value={loan.annual_interest_chf} currency={loan.currency} />
                        </td>
                        <td className={styles.right}>
                          <Amount value={loan.balance} currency={loan.currency} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4}>Total</td>
                      <td className={styles.right}>
                        <Amount value={data.annual_interest_chf} currency="CHF" />
                      </td>
                      <td className={styles.right}>
                        <Amount value={data.total_balance_chf} currency="CHF" />
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </Card>
            </>
          )
        }
      </QueryState>
    </>
  );
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className={styles.factLabel}>{label}</div>
      <div className={styles.factValue}>{value}</div>
    </div>
  );
}
