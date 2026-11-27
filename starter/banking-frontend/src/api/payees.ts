import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";

/** Known payees for the recipient search (`q`) and the "Last payments" tab. */
export function usePayees(q: string) {
  return useQuery({
    queryKey: ["payees", q],
    queryFn: () => unwrap(api.GET("/payees", { params: { query: q ? { q } : {} } })),
    // Keep the last results on screen while the next search is loading.
    placeholderData: keepPreviousData,
  });
}
