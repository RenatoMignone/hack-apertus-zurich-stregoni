/**
 * The one extension point for widgets: a renderer per widget `type`. The Record type makes
 * TypeScript fail when a type from the contract has no renderer.
 */
import type { ComponentType } from "react";
import type { Schemas } from "../api/client";
import { CustomWidget } from "./custom/CustomWidget";
import { AccountBalancesWidget } from "./standard/AccountBalancesWidget";
import { AccountTransferWidget } from "./standard/AccountTransferWidget";
import { LoansWidget } from "./standard/LoansWidget";
import { NewPaymentWidget } from "./standard/NewPaymentWidget";
import { PendingPaymentsWidget } from "./standard/PendingPaymentsWidget";
import { PersonalContactWidget } from "./standard/PersonalContactWidget";
import { PortfolioWidget } from "./standard/PortfolioWidget";
import { RecentMovementsWidget } from "./standard/RecentMovementsWidget";
import { TotalAssetsWidget } from "./standard/TotalAssetsWidget";

export type Widget = Schemas["Widget"];
export type WidgetType = Schemas["WidgetType"];

export interface WidgetDef {
  /** Default title if the widget has none. */
  title: string;
  component: ComponentType<{ widget: Widget }>;
}

export const WIDGETS: Record<WidgetType, WidgetDef> = {
  total_assets: { title: "Total assets", component: TotalAssetsWidget },
  account_balances: { title: "Account balances", component: AccountBalancesWidget },
  recent_movements: { title: "Recent account movements", component: RecentMovementsWidget },
  new_payment: { title: "New payment", component: NewPaymentWidget },
  account_transfer: { title: "Account transfer", component: AccountTransferWidget },
  pending_payments: { title: "Pending payments", component: PendingPaymentsWidget },
  portfolio: { title: "Portfolio", component: PortfolioWidget },
  personal_contact: { title: "Your personal contact", component: PersonalContactWidget },
  loans: { title: "Loans", component: LoansWidget },
  custom: { title: "TrustRoom widget", component: CustomWidget },
};
