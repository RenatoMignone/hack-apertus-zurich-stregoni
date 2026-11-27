import { useQuery } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";

export type PerformancePeriod = "ytd" | "1y" | "3y";

/** Customers without a securities depot get an empty portfolio from the API (no allocation, zero value). */
export function hasDepot(portfolio: Schemas["Portfolio"]): boolean {
  return portfolio.allocation.asset_class.length > 0;
}

export function usePortfolio() {
  return useQuery({ queryKey: ["portfolio"], queryFn: () => unwrap(api.GET("/portfolio")) });
}

export function usePositions() {
  return useQuery({ queryKey: ["portfolio", "positions"], queryFn: () => unwrap(api.GET("/portfolio/positions")) });
}

export function usePerformance(period: PerformancePeriod) {
  return useQuery({
    queryKey: ["portfolio", "performance", period],
    queryFn: () => unwrap(api.GET("/portfolio/performance", { params: { query: { period } } })),
  });
}
