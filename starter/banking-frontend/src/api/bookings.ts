import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";
import type { MovementsFilter } from "../trustroom/protocol";

export type Booking = Schemas["Booking"];

const list = (s: string | undefined) =>
  s
    ? s
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    : undefined;
const num = (s: string | undefined) =>
  s !== undefined && s !== "" && !Number.isNaN(Number(s)) ? Number(s) : undefined;

/** Maps the URL filter (docs §5) onto the query of GET /bookings. */
function toQuery(filter: MovementsFilter, limit: number, offset: number) {
  return {
    account: list(filter.account),
    from: filter.from || undefined,
    to: filter.to || undefined,
    q: filter.q || undefined,
    amount_min: num(filter.amount_min),
    amount_max: num(filter.amount_max),
    direction: filter.direction === "credit" || filter.direction === "debit" ? filter.direction : undefined,
    ids: list(filter.ids),
    card: filter.card || undefined,
    limit,
    offset,
  } as const;
}

export function fetchBookings(filter: MovementsFilter, limit: number, offset: number) {
  return unwrap(api.GET("/bookings", { params: { query: toQuery(filter, limit, offset) } }));
}

export function useBookings(filter: MovementsFilter, limit: number, offset: number) {
  return useQuery({
    queryKey: ["bookings", filter, limit, offset],
    queryFn: () => fetchBookings(filter, limit, offset),
    placeholderData: keepPreviousData,
  });
}

/** All bookings matching the filter, fetched page by page (for the CSV export). */
export async function fetchAllBookings(filter: MovementsFilter): Promise<Booking[]> {
  const all: Booking[] = [];
  for (;;) {
    const page = await fetchBookings(filter, 1000, all.length);
    all.push(...page.items);
    if (page.items.length === 0 || all.length >= page.total) return all;
  }
}
