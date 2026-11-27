/**
 * TrustRoom embedding protocol, version 1. Specified in docs/trustroom-panel-context.md;
 * change the doc first, then this file.
 */
import type { PageId } from "../routes";

export const PROTOCOL = "trustroom";
export const PROTOCOL_VERSION = 1;

export type Mode = "panel" | "fullpage";

/** Movement filters, same keys as GET /bookings. */
export type MovementsFilter = Partial<
  Record<"account" | "from" | "to" | "q" | "amount_min" | "amount_max" | "direction" | "ids" | "card", string>
>;

/** What a page contributes to the context (see useTrustRoomSelection). Never amounts. */
export interface Selection {
  title?: string;
  account?: { account_id: string; iban: string; name: string } | null;
  dashboard_id?: string | null;
  card_id?: string | null;
  movements_filter?: MovementsFilter | null;
}

/** Context payload, docs §4. */
export interface Context {
  mode: Mode;
  page: {
    id: PageId | null;
    path: string;
    title: string;
    params: Record<string, string>;
    query: Record<string, string>;
  };
  account: Selection["account"] | null;
  dashboard_id: string | null;
  card_id: string | null;
  movements_filter: MovementsFilter | null;
  customer: { customer_id: string; first_name: string; last_name: string } | null;
  today: string | null;
  api_base_url: string;
  /** Token of the logged-in customer: send it as `Authorization: Bearer …` with every API call. Never in the iframe URL. */
  access_token: string | null;
}

export type HostMessageType = "context" | "visibility" | "dashboard-changed";
export type SolutionMessageType = "ready" | "request-context" | "navigate" | "widgets-changed" | "close";

export interface Envelope<T extends string = string> {
  protocol: typeof PROTOCOL;
  version: number;
  type: T;
  payload: Record<string, unknown>;
}

export function envelope(type: HostMessageType, payload: object): Envelope<HostMessageType> {
  return { protocol: PROTOCOL, version: PROTOCOL_VERSION, type, payload: payload as Record<string, unknown> };
}

export function isEnvelope(data: unknown): data is Envelope {
  const d = data as Envelope | null;
  return typeof d === "object" && d !== null && d.protocol === PROTOCOL && typeof d.type === "string";
}

/** Initial iframe URL with the context as query parameters (docs §1). */
export function frameUrl(base: string, context: Context): string {
  const url = new URL(base, window.location.href);
  url.searchParams.set("mode", context.mode);
  if (context.page.id) url.searchParams.set("page", context.page.id);
  if (context.account) url.searchParams.set("account", context.account.account_id);
  url.searchParams.set("api", context.api_base_url);
  if (context.today) url.searchParams.set("today", context.today);
  url.searchParams.set("v", String(PROTOCOL_VERSION));
  return url.toString();
}
