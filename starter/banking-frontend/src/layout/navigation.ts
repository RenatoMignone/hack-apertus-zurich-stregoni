/** Sidebar entries, in the order of the ti&m Banking Suite, plus Loans. Paths come from routes.ts. */
import type { IconName } from "../components/Icon";
import type { PageId } from "../routes";

export interface NavItem {
  label: string;
  icon: IconName;
  page?: PageId;
  children?: { label: string; page: PageId }[];
  highlight?: boolean;
}

export const NAVIGATION: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", page: "dashboard" },
  {
    label: "Accounts",
    icon: "accounts",
    children: [
      { label: "Account overview", page: "account-overview" },
      { label: "Account movements", page: "movements" },
    ],
  },
  {
    label: "Payments",
    icon: "payments",
    children: [
      { label: "Payment overview", page: "payment-overview" },
      { label: "New payment", page: "new-payment" },
      { label: "Account transfer", page: "account-transfer" },
      { label: "Standing orders", page: "standing-orders" },
    ],
  },
  { label: "Investments", icon: "investments", children: [{ label: "Portfolio", page: "portfolio" }] },
  { label: "Cards", icon: "cards", page: "cards" },
  { label: "Loans", icon: "loans", page: "loans" },
  { label: "TrustRoom", icon: "trustroom", page: "trustroom", highlight: true },
  { label: "Settings", icon: "settings", page: "settings" },
];
