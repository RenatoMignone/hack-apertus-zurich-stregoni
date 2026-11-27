import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";

export type Account = Schemas["Account"];

export function useAccounts() {
  return useQuery({ queryKey: ["accounts"], queryFn: () => unwrap(api.GET("/accounts")) });
}

export function useAccount(accountId: string | undefined) {
  return useQuery({
    queryKey: ["accounts", accountId],
    queryFn: () => unwrap(api.GET("/accounts/{accountId}", { params: { path: { accountId: accountId! } } })),
    enabled: !!accountId,
  });
}

export function useBalancePreview(accountId: string | undefined) {
  return useQuery({
    queryKey: ["accounts", accountId, "balance-preview"],
    queryFn: () =>
      unwrap(api.GET("/accounts/{accountId}/balance-preview", { params: { path: { accountId: accountId! } } })),
    enabled: !!accountId,
  });
}
