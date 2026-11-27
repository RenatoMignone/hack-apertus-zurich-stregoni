/** Maps every page of routes.ts to its component. Add a page in routes.ts first, then here. */
import type { ReactElement } from "react";
import { createBrowserRouter, Navigate, useLocation } from "react-router";
import { getAuth, loginUrl } from "../auth";
import { AppShell } from "../layout/AppShell";
import { AccountDetailPage } from "../pages/AccountDetailPage";
import { AccountOverviewPage } from "../pages/AccountOverviewPage";
import { DashboardPage } from "../pages/DashboardPage";
import { MovementsPage } from "../pages/MovementsPage";
import { LoanDetailPage } from "../pages/LoanDetailPage";
import { LoansPage } from "../pages/LoansPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AccountTransferPage } from "../pages/AccountTransferPage";
import { CardsPage } from "../pages/CardsPage";
import { NewPaymentPage } from "../pages/NewPaymentPage";
import { PaymentOverviewPage } from "../pages/PaymentOverviewPage";
import { PortfolioPage } from "../pages/PortfolioPage";
import { SettingsPage } from "../pages/SettingsPage";
import { StandingOrdersPage } from "../pages/StandingOrdersPage";
import { TrustRoomPage } from "../pages/TrustRoomPage";
import { LOGIN_PATH, PAGES, pagePath, type PageId } from "../routes";

const COMPONENTS: Record<PageId, ReactElement> = {
  dashboard: <DashboardPage />,
  "account-overview": <AccountOverviewPage />,
  "account-detail": <AccountDetailPage />,
  movements: <MovementsPage />,
  "payment-overview": <PaymentOverviewPage />,
  "new-payment": <NewPaymentPage />,
  "account-transfer": <AccountTransferPage />,
  "standing-orders": <StandingOrdersPage />,
  portfolio: <PortfolioPage />,
  cards: <CardsPage />,
  loans: <LoansPage />,
  "loan-detail": <LoanDetailPage />,
  settings: <SettingsPage />,
  trustroom: <TrustRoomPage />,
};

/** Every app page needs a login; deep links survive the round trip via `?next=`. */
function RequireAuth() {
  const { pathname, search } = useLocation();
  if (!getAuth()) return <Navigate to={loginUrl(pathname + search)} replace />;
  return <AppShell />;
}

export const router = createBrowserRouter([
  { path: LOGIN_PATH, element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <Navigate to={pagePath("dashboard")} replace /> },
      ...Object.values(PAGES).flatMap((page) => page.paths.map((path) => ({ path, element: COMPONENTS[page.id] }))),
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
