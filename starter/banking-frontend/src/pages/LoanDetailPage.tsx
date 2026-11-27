/** Loan detail: terms of one tranche and all its interest and amortisation charges, linked to their bookings. */
import { Link, useParams } from "react-router";
import { useAccounts } from "../api/accounts";
import { rateLabel, useLoan, useLoanTransactions, type Loan } from "../api/loans";
import { Amount } from "../components/Amount";
import { Card } from "../components/Card";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { SummaryBox } from "../components/SummaryBox";
import { formatAmount, formatDate, formatNumber } from "../format";
import { pagePath } from "../routes";
import { useTrustRoomSelection } from "../trustroom/TrustRoomProvider";
import styles from "./Loans.module.css";

export function LoanDetailPage() {
  const { loanId } = useParams();
  const loan = useLoan(loanId);
  useTrustRoomSelection(loan.data ? { title: `${loan.data.product} ${loan.data.number}` } : {});

  return (
    <QueryState query={loan}>
      {(data) => (
        <>
          <PageHeader title={data.product} subtitle={`${data.number} · ${data.facility_name ?? ""}`} />
          <SummaryBox label="Balance" value={data.balance} currency={data.currency} asOf={data.balance_date} />
          <div className={styles.detail}>
            {data.remarks && <div className={styles.notice}>{data.remarks}</div>}
            <Card title="Terms">
              <Terms loan={data} />
            </Card>
            <Charges loanId={data.loan_id} />
            <Link className={styles.link} to={pagePath("loans")}>
              Back to all loans
            </Link>
          </div>
        </>
      )}
    </QueryState>
  );
}

function Terms({ loan }: { loan: Loan }) {
  const accounts = useAccounts();
  const debitAccount = accounts.data?.items.find((a) => a.account_id === loan.debit_account_id);
  const rows: [string, string][] = [
    ["Interest rate", rateLabel(loan)],
    ...(loan.rate_type === "saron"
      ? ([
          ["Reference rate", loan.reference_rate ?? ""],
          ["Margin", `${formatNumber(loan.margin ?? 0)}%`],
          ["Floor of reference rate", `${formatNumber(loan.rate_floor ?? 0)}%`],
        ] as [string, string][])
      : []),
    ["Interest per year at today's rate", formatAmount(loan.annual_interest_chf, loan.currency)],
    ["Interest charged", `${loan.interest_frequency}, next on ${formatDate(loan.next_interest_date)}`],
    ["Start", formatDate(loan.start_date)],
    ["Maturity", formatDate(loan.maturity_date)],
    ["Original amount", formatAmount(loan.original_amount, loan.currency)],
    [
      "Amortisation",
      loan.amortisation_type === "none"
        ? "None"
        : `${loan.amortisation_type}, ${formatAmount(loan.amortisation_amount ?? 0, loan.currency)} ${loan.amortisation_frequency ?? ""}`,
    ],
    ["Rank", loan.rank ?? ""],
    ["Debit account", debitAccount ? `${debitAccount.name} ${debitAccount.iban}` : loan.debit_account_id],
    ["Property", `${loan.property_name ?? ""}, ${loan.property_address ?? ""}`],
    ["Lending value", formatAmount(loan.lending_value_chf ?? 0, "CHF")],
    ["Collateral", loan.collateral ?? ""],
    ["Lender", loan.lender ?? ""],
  ];
  return (
    <dl className={styles.terms}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Charges({ loanId }: { loanId: string }) {
  const transactions = useLoanTransactions(loanId);
  return (
    <Card title="Interest and amortisation">
      <QueryState query={transactions}>
        {({ items, sum_chf }) =>
          items.length === 0 ? (
            <p className={styles.muted}>No charges yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Period</th>
                  <th className={styles.right}>Rate</th>
                  <th className={styles.right}>Based on</th>
                  <th className={styles.right}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.loan_tx_id}>
                    <td>
                      <Link className={styles.link} to={`${pagePath("movements")}?ids=${t.booking_id}`}>
                        {formatDate(t.value_date)}
                      </Link>
                    </td>
                    <td>{t.type === "interest" ? "Interest" : "Amortisation"}</td>
                    <td>
                      {t.period_from && t.period_to ? `${formatDate(t.period_from)} – ${formatDate(t.period_to)}` : ""}
                    </td>
                    <td className={styles.right}>
                      {t.interest_rate === null || t.interest_rate === undefined
                        ? ""
                        : `${formatNumber(t.interest_rate)}%`}
                    </td>
                    <td className={styles.right}>{formatAmount(t.base_balance, "CHF")}</td>
                    <td className={styles.right}>
                      <Amount value={t.amount} currency="CHF" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>
                    <Link
                      className={styles.link}
                      to={`${pagePath("movements")}?ids=${items.map((t) => t.booking_id).join(",")}`}
                    >
                      Total of {items.length} charges (show bookings)
                    </Link>
                  </td>
                  <td className={styles.right}>
                    <Amount value={sum_chf} currency="CHF" />
                  </td>
                </tr>
              </tfoot>
            </table>
          )
        }
      </QueryState>
    </Card>
  );
}
