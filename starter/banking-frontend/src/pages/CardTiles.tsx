import { useAccount } from "../api/accounts";
import type { Schemas } from "../api/client";
import { formatAmount, formatMonth } from "../format";
import styles from "./CardsPage.module.css";

type Card = Schemas["Card"];

/** Generic card artwork (CSS only). */
function CardImage({ card }: { card: Card }) {
  return (
    <div className={`${styles.cardImage} ${card.status === "active" ? "" : styles.cardImageBlocked}`}>
      <span className={styles.cardKind}>{card.type === "credit" ? "Credit card" : "Debit card"}</span>
      <div>
        <div className={styles.cardNumber}>{card.masked_number}</div>
        <div>{card.product}</div>
      </div>
    </div>
  );
}

export function CardTile({ card, selected, onSelect }: { card: Card; selected: boolean; onSelect: () => void }) {
  const { data: account } = useAccount(card.linked_account);
  return (
    <button
      type="button"
      className={`${styles.tile} ${selected ? styles.tileSelected : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <CardImage card={card} />
      <div className={styles.tileBody}>
        <div className={styles.tileName}>{card.product}</div>
        <div className={styles.tileMeta}>{account?.name ?? card.linked_account}</div>
        {account && <div className={styles.tileMeta}>{account.iban}</div>}
        {card.monthly_limit_chf !== undefined && (
          <div className={styles.tileMeta}>Limit {formatAmount(card.monthly_limit_chf, "CHF")} per month</div>
        )}
        {card.valid_until && <div className={styles.tileMeta}>Valid until {formatMonth(card.valid_until)}</div>}
        <span className={`${styles.status} ${card.status === "active" ? styles.statusActive : ""}`}>{card.status}</span>
      </div>
    </button>
  );
}
