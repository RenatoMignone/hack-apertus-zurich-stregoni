import { Link } from "react-router";
import { useCardStatements, useCardTransactions } from "../api/cards";
import { Amount } from "../components/Amount";
import { Card } from "../components/Card";
import { QueryState } from "../components/QueryState";
import { formatDate } from "../format";
import { pagePath } from "../routes";
import styles from "./CardsPage.module.css";

/** Credit card: monthly statements and, for the selected one, its individual purchases. */
export function CreditCardDetail({
  cardId,
  statementId,
  onSelectStatement,
}: {
  cardId: string;
  statementId: string | null;
  onSelectStatement: (id: string) => void;
}) {
  const statements = useCardStatements(cardId);
  return (
    <>
      <Card title="Monthly statements">
        <QueryState query={statements}>
          {({ items }) =>
            items.length === 0 ? (
              <p className={styles.muted}>No statements yet.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Debit date</th>
                    <th>Status</th>
                    <th className={styles.right}>Purchases</th>
                    <th className={styles.right}>Statement total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...items].reverse().map((s) => (
                    <tr
                      key={s.statement_id}
                      className={`${styles.selectable} ${s.statement_id === statementId ? styles.rowSelected : ""}`}
                      onClick={() => onSelectStatement(s.statement_id)}
                    >
                      <td>
                        <span className={styles.link}>
                          {formatDate(s.period_from)} – {formatDate(s.period_to)}
                        </span>
                      </td>
                      <td>{formatDate(s.debit_date)}</td>
                      <td>
                        {s.status === "open" ? "Open (provisional)" : s.status === "closed" ? "Closed" : "Settled"}
                      </td>
                      <td className={styles.right}>{s.transactions_count}</td>
                      <td className={styles.right}>
                        <Amount value={s.total_chf} currency="CHF" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </QueryState>
      </Card>
      {statementId && <StatementPurchases cardId={cardId} statementId={statementId} />}
    </>
  );
}

function StatementPurchases({ cardId, statementId }: { cardId: string; statementId: string }) {
  const statements = useCardStatements(cardId);
  const transactions = useCardTransactions(cardId, statementId);
  const statement = statements.data?.items.find((s) => s.statement_id === statementId);
  return (
    <Card title={`Purchases ${statementId}`}>
      <QueryState query={transactions}>
        {({ items, sum_chf }) =>
          items.length === 0 ? (
            <p className={styles.muted}>No individual purchases are available for this statement.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Channel</th>
                  <th className={styles.right}>Amount CHF</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.card_transaction_id}>
                    <td>{formatDate(t.transaction_date)}</td>
                    <td>
                      {t.merchant_text}
                      {t.original_currency && t.original_currency !== "CHF" && t.original_amount !== undefined && (
                        <span className={styles.fxNote}>
                          {t.original_currency} {t.original_amount}
                        </span>
                      )}
                    </td>
                    <td>{t.channel}</td>
                    <td className={styles.right}>
                      <Amount value={t.amount_chf} currency="CHF" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3}>Total of {items.length} purchases</td>
                  <td className={styles.right}>
                    <Amount value={sum_chf} currency="CHF" />
                  </td>
                </tr>
                {statement && (
                  <tr>
                    <td colSpan={3}>Statement total</td>
                    <td className={styles.right}>
                      <Amount value={statement.total_chf} currency="CHF" />
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          )
        }
      </QueryState>
    </Card>
  );
}

/** Debit card payments are regular account bookings. */
export function DebitCardDetail({ cardId }: { cardId: string }) {
  return (
    <Card title="Card payments">
      <p>
        Debit card payments are booked directly on the linked account.{" "}
        <Link className={styles.link} to={`${pagePath("movements")}?card=${cardId}`}>
          Show movements of this card
        </Link>
      </p>
    </Card>
  );
}
