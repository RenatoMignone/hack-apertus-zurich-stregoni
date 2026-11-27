import type { Booking } from "../api/bookings";

const HEADER = [
  "booking_id",
  "booking_date",
  "value_date",
  "account_id",
  "booking_text",
  "counterparty_name",
  "counterparty_iban",
  "reference",
  "amount_chf",
  "balance_after",
];

const cell = (v: string | number | null | undefined) => {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Plain formatting of API values, no computation. */
export function bookingsToCsv(bookings: Booking[]): string {
  const rows = bookings.map((b) =>
    [
      b.booking_id,
      b.booking_date,
      b.value_date,
      b.account_id,
      b.booking_text,
      b.counterparty_name,
      b.counterparty_iban,
      b.reference,
      b.amount,
      b.balance_after,
    ]
      .map(cell)
      .join(","),
  );
  return [HEADER.join(","), ...rows].join("\n");
}
