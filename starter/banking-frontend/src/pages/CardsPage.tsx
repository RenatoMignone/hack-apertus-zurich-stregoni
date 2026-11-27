/** Cards: all cards as tiles, plus statements and purchases of the selected card (`?card=…&statement=…`). */
import { useSearchParams } from "react-router";
import { useCards } from "../api/cards";
import type { Schemas } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { useTrustRoomSelection } from "../trustroom/TrustRoomProvider";
import { CreditCardDetail, DebitCardDetail } from "./CardStatements";
import { CardTile } from "./CardTiles";
import styles from "./CardsPage.module.css";

type Card = Schemas["Card"];

export function CardsPage() {
  const cards = useCards();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardId = searchParams.get("card");
  const statementId = searchParams.get("statement");
  const selected = cards.data?.items.find((c) => c.card_id === cardId);
  useTrustRoomSelection(selected ? { title: selected.product, card_id: selected.card_id } : {});

  return (
    <>
      <PageHeader title="Cards" />
      <QueryState query={cards}>
        {({ items }) =>
          items.length === 0 ? (
            <p className={styles.hint}>You don't have any cards.</p>
          ) : (
            <>
              <div className={styles.tiles}>
                {sortCards(items).map((c) => (
                  <CardTile
                    key={c.card_id}
                    card={c}
                    selected={c.card_id === cardId}
                    onSelect={() => setSearchParams({ card: c.card_id })}
                  />
                ))}
              </div>
              {!selected && <p className={styles.hint}>Select a card to see its statements and transactions.</p>}
              {selected && (
                <div className={styles.detail}>
                  {selected.type === "credit" ? (
                    <CreditCardDetail
                      cardId={selected.card_id}
                      statementId={statementId}
                      onSelectStatement={(id) => setSearchParams({ card: selected.card_id, statement: id })}
                    />
                  ) : (
                    <DebitCardDetail cardId={selected.card_id} />
                  )}
                </div>
              )}
            </>
          )
        }
      </QueryState>
    </>
  );
}

/** Credit cards first (as in the real e-banking), all in one row so the details below stay in view. */
function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => (a.type === b.type ? 0 : a.type === "credit" ? -1 : 1));
}
