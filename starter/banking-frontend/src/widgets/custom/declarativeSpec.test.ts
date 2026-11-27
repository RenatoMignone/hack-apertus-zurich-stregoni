import { describe, expect, it } from "vitest";
import { parseSpec } from "./declarativeSpec";

const error = (raw: unknown) => {
  const r = parseSpec(raw);
  return r.ok ? null : r.error;
};

describe("parseSpec", () => {
  it("accepts valid specs", () => {
    expect(parseSpec({ type: "kpi", value: 12.5, unit: "%" }).ok).toBe(true);
    expect(
      parseSpec({ type: "table", columns: [{ key: "a", label: "A", format: "currency" }], rows: [{ a: 1 }] }).ok,
    ).toBe(true);
    expect(parseSpec({ type: "donut", data: [{ label: "x", value: 1 }] }).ok).toBe(true);
  });

  it("rejects non-objects and unknown types", () => {
    expect(error(null)).toMatch(/must be an object/);
    expect(error("kpi")).toMatch(/must be an object/);
    expect(error({ type: "pie" })).toMatch(/Unknown widget spec type "pie"/);
  });

  it("rejects malformed kpi", () => {
    expect(error({ type: "kpi", value: "12" })).toMatch(/"value" must be a number/);
    expect(error({ type: "kpi", value: 1, delta: "x" })).toMatch(/"delta"/);
  });

  it("rejects malformed tables", () => {
    expect(error({ type: "table", rows: [] })).toMatch(/"columns"/);
    expect(error({ type: "table", columns: [{ key: "a", label: "A", format: "money" }], rows: [] })).toMatch(/format/);
    expect(error({ type: "table", columns: [{ key: "a", label: "A" }], rows: [1] })).toMatch(/rows\[0\]/);
  });

  it("rejects malformed charts", () => {
    expect(error({ type: "bar" })).toMatch(/"data"/);
    expect(error({ type: "line", data: [{ label: "a", value: NaN }] })).toMatch(/data\[0\].value/);
    expect(error({ type: "bar", data: [{ label: "a", value: 1, booking_ids: [1] }] })).toMatch(/booking_ids/);
  });
});
