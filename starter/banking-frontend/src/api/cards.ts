import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";

export function useCards() {
  return useQuery({ queryKey: ["cards"], queryFn: () => unwrap(api.GET("/cards")) });
}

export function useCardStatements(cardId: string | undefined) {
  return useQuery({
    queryKey: ["cards", cardId, "statements"],
    queryFn: () => unwrap(api.GET("/cards/{cardId}/statements", { params: { path: { cardId: cardId! } } })),
    enabled: !!cardId,
  });
}

/** Purchases of one statement. `sum_chf` is the API's total over all of them. */
export function useCardTransactions(cardId: string | undefined, statementId: string | undefined) {
  return useQuery({
    queryKey: ["cards", cardId, "transactions", statementId],
    queryFn: () =>
      unwrap(
        api.GET("/cards/{cardId}/transactions", {
          params: { path: { cardId: cardId! }, query: { statement: statementId, limit: 1000 } },
        }),
      ),
    enabled: !!cardId && !!statementId,
  });
}
