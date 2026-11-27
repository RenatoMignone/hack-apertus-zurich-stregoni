import { describe, expect, it } from "vitest";
import { formatAmount, formatDate, formatDateLong, formatDateTime, formatMonth, formatNumber } from "./format";

describe("format", () => {
  it("groups thousands Swiss style", () => {
    expect(formatNumber(8034.42)).toBe("8'034.42");
    expect(formatNumber(1234567.5)).toBe("1'234'567.50");
    expect(formatNumber(-746.41)).toBe("-746.41");
    expect(formatNumber(0)).toBe("0.00");
    expect(formatNumber(-0.001)).toBe("0.00");
  });

  it("prefixes the currency", () => {
    expect(formatAmount(7862.04, "CHF")).toBe("CHF 7'862.04");
  });

  it("formats ISO dates without time zone shifts", () => {
    expect(formatDate("2026-11-27")).toBe("27/11/2026");
    expect(formatDateLong("2026-11-07")).toBe("7 Nov 2026");
    expect(formatDateTime("2026-11-26T08:31:00+01:00")).toBe("26 Nov 2026 at 08:31");
  });
  it("formats card expiry months", () => {
    expect(formatMonth("2027-11")).toBe("11/2027");
  });
});

describe("formatNumberAuto", () => {
  it("drops decimals for whole numbers only", async () => {
    const { formatNumberAuto } = await import("./format");
    expect(formatNumberAuto(1200)).toBe("1'200");
    expect(formatNumberAuto(12.5)).toBe("12.50");
  });
});
