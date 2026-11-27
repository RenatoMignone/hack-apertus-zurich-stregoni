import { describe, expect, it } from "vitest";
import type { Booking } from "../api/bookings";
import { bookingsToCsv } from "./movementsCsv";

describe("bookingsToCsv", () => {
  it("quotes text with commas and quotes", () => {
    const b = {
      booking_id: "BK-1",
      account_id: "ACC-PRIV",
      booking_date: "2026-10-01",
      value_date: "2026-10-01",
      amount: -12.5,
      balance_after: 100,
      booking_text: 'Shop, "Bern"',
      counterparty_name: null,
    } as Booking;
    expect(bookingsToCsv([b]).split("\n")[1]).toBe('BK-1,2026-10-01,2026-10-01,ACC-PRIV,"Shop, ""Bern""",,,,-12.5,100');
  });
});
