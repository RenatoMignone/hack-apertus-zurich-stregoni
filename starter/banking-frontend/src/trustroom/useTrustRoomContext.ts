import { useMemo } from "react";
import { useLocation } from "react-router";
import { useCustomer } from "../api/customer";
import { getAuth } from "../auth";
import { useSystemInfo } from "../api/system";
import { config } from "../config";
import { matchPage } from "../routes";
import type { Context, Mode } from "./protocol";
import { useTrustRoom } from "./TrustRoomProvider";

/** Builds the context payload (docs §4) from the current route and page selection. */
export function useTrustRoomContext(mode: Mode): Context {
  const location = useLocation();
  const { selection } = useTrustRoom();
  const { data: customer } = useCustomer();
  const { data: system } = useSystemInfo();

  return useMemo(() => {
    const match = matchPage(location.pathname);
    return {
      mode,
      page: {
        id: match?.page.id ?? null,
        path: location.pathname + location.search,
        title: selection.title ?? match?.page.title ?? "",
        params: match?.params ?? {},
        query: Object.fromEntries(new URLSearchParams(location.search)),
      },
      account: selection.account ?? null,
      dashboard_id: selection.dashboard_id ?? null,
      card_id: selection.card_id ?? null,
      movements_filter: selection.movements_filter ?? null,
      customer: customer
        ? { customer_id: customer.customer_id, first_name: customer.first_name, last_name: customer.last_name }
        : null,
      today: system?.today ?? null,
      api_base_url: config.apiUrl,
      // Fixed for the lifetime of the iframe: logout unmounts the app shell and with it the TrustRoom.
      access_token: getAuth()?.token ?? null,
    };
  }, [mode, location.pathname, location.search, selection, customer, system]);
}
