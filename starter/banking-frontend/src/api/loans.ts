import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "../format";
import { api, unwrap, type Schemas } from "./client";

export type Loan = Schemas["Loan"];

/** All loan tranches with the API's totals (balance, annual interest, loan-to-value). */
export function useLoans() {
  return useQuery({ queryKey: ["loans"], queryFn: () => unwrap(api.GET("/loans")) });
}

export function useLoan(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loans", loanId],
    queryFn: () => unwrap(api.GET("/loans/{loanId}", { params: { path: { loanId: loanId! } } })),
    enabled: !!loanId,
  });
}

/** Interest and amortisation charges of one loan, newest first. */
export function useLoanTransactions(loanId: string | undefined) {
  return useQuery({
    queryKey: ["loan-transactions", loanId],
    queryFn: () => unwrap(api.GET("/loan-transactions", { params: { query: { loan: loanId } } })),
    enabled: !!loanId,
  });
}

/** "Fixed 0.95%" or "SARON 0.80%" */
export function rateLabel(loan: Loan): string {
  return `${loan.rate_type === "saron" ? "SARON" : "Fixed"} ${formatNumber(loan.interest_rate)}%`;
}
