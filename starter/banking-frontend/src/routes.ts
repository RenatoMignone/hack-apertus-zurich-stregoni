/**
 * Page IDs and routes. Single source for the router, the sidebar and the TrustRoom context.
 * Must match docs/trustroom-panel-context.md §5: the teams rely on these IDs, paths and query
 * parameters (deep links), so treat a rename as a breaking change.
 */
import { matchPath } from "react-router";

export type PageId =
  | "dashboard"
  | "account-overview"
  | "account-detail"
  | "movements"
  | "payment-overview"
  | "new-payment"
  | "account-transfer"
  | "standing-orders"
  | "portfolio"
  | "cards"
  | "loans"
  | "loan-detail"
  | "settings"
  | "trustroom";

export interface PageDef {
  id: PageId;
  /** Route patterns; the first one is the canonical path used for links. */
  paths: string[];
  title: string;
}

export const PAGES: Record<PageId, PageDef> = {
  dashboard: { id: "dashboard", paths: ["/dashboard", "/dashboard/:dashboardId"], title: "Dashboard" },
  "account-overview": { id: "account-overview", paths: ["/accounts"], title: "Account overview" },
  "account-detail": { id: "account-detail", paths: ["/accounts/:accountId"], title: "Account" },
  movements: { id: "movements", paths: ["/movements"], title: "Account movements" },
  "payment-overview": { id: "payment-overview", paths: ["/payments"], title: "Payment overview" },
  "new-payment": { id: "new-payment", paths: ["/payments/new"], title: "New payment" },
  "account-transfer": { id: "account-transfer", paths: ["/payments/transfer"], title: "Account transfer" },
  "standing-orders": { id: "standing-orders", paths: ["/standing-orders"], title: "Standing orders" },
  portfolio: { id: "portfolio", paths: ["/portfolio"], title: "Portfolio" },
  cards: { id: "cards", paths: ["/cards"], title: "Cards" },
  loans: { id: "loans", paths: ["/loans"], title: "Loans" },
  "loan-detail": { id: "loan-detail", paths: ["/loans/:loanId"], title: "Loan" },
  settings: { id: "settings", paths: ["/settings"], title: "Settings" },
  trustroom: { id: "trustroom", paths: ["/trustroom"], title: "TrustRoom" },
};

/**
 * Login page. Outside the app shell and deliberately not a PageId: it is no TrustRoom page, and
 * `isAppPath` rejects it, so it is never a `navigate` target or a post-login `next`.
 */
export const LOGIN_PATH = "/login";

/** Canonical path of a page, e.g. pagePath("account-overview") → "/accounts". */
export function pagePath(id: PageId): string {
  return PAGES[id].paths[0];
}

/** Finds the page for a pathname, with its route params. */
export function matchPage(pathname: string): { page: PageDef; params: Record<string, string> } | null {
  for (const page of Object.values(PAGES)) {
    for (const pattern of page.paths) {
      const match = matchPath(pattern, pathname);
      if (match) return { page, params: match.params as Record<string, string> };
    }
  }
  return null;
}

/**
 * True for a relative path of an e-banking route ("/movements?ids=…"). Used to validate `navigate`
 * messages from the TrustRoom: absolute URLs, "//host" and "javascript:" are rejected.
 */
export function isAppPath(path: unknown): path is string {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return false;
  }
  const url = new URL(path, "http://app.invalid");
  return url.origin === "http://app.invalid" && matchPage(url.pathname) !== null;
}
