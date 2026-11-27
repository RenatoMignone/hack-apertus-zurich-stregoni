/**
 * Runtime validation of declarative widget specs. They come from the teams' AI, so they can be
 * malformed: `parseSpec` never throws and returns a message that says what to fix.
 */
import type { Schemas } from "../../api/client";

export type Spec = Schemas["DeclarativeSpec"];
export type ParseResult = { ok: true; spec: Spec } | { ok: false; error: string };

const FORMATS = ["text", "number", "currency", "date", "percent"];
const ALIGNS = ["left", "right", "center"];
const TYPES = ["kpi", "table", "bar", "line", "donut"];

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isStringArray = (v: unknown) => Array.isArray(v) && v.every((x) => typeof x === "string");

/** Returns an error message, or undefined when the spec is valid. */
function check(spec: Record<string, unknown>): string | undefined {
  for (const key of ["title", "subtitle", "currency", "footnote"]) {
    if (spec[key] !== undefined && typeof spec[key] !== "string") return `"${key}" must be a string`;
  }
  switch (spec.type) {
    case "kpi":
      if (!isNumber(spec.value)) return `kpi: "value" must be a number`;
      if (spec.delta !== undefined && !isNumber(spec.delta)) return `kpi: "delta" must be a number`;
      if (spec.unit !== undefined && typeof spec.unit !== "string") return `kpi: "unit" must be a string`;
      return undefined;
    case "table":
      return checkTable(spec);
    default:
      return checkChart(spec);
  }
}

function checkTable(spec: Record<string, unknown>): string | undefined {
  if (!Array.isArray(spec.columns) || spec.columns.length === 0) return `table: "columns" must be a non-empty array`;
  for (const [i, c] of spec.columns.entries()) {
    if (!isObject(c) || typeof c.key !== "string" || typeof c.label !== "string")
      return `table: columns[${i}] needs string "key" and "label"`;
    if (c.format !== undefined && !FORMATS.includes(c.format as string))
      return `table: columns[${i}].format must be one of ${FORMATS.join(", ")}`;
    if (c.align !== undefined && !ALIGNS.includes(c.align as string))
      return `table: columns[${i}].align must be one of ${ALIGNS.join(", ")}`;
  }
  if (!Array.isArray(spec.rows)) return `table: "rows" must be an array`;
  for (const [i, r] of spec.rows.entries()) {
    if (!isObject(r)) return `table: rows[${i}] must be an object keyed by column key`;
    if (r._booking_ids !== undefined && !isStringArray(r._booking_ids))
      return `table: rows[${i}]._booking_ids must be an array of strings`;
  }
  if (spec.footer !== undefined && !isObject(spec.footer))
    return `table: "footer" must be an object keyed by column key`;
  return undefined;
}

function checkChart(spec: Record<string, unknown>): string | undefined {
  const type = spec.type as string;
  if (!Array.isArray(spec.data) || spec.data.length === 0) return `${type}: "data" must be a non-empty array`;
  for (const [i, p] of spec.data.entries()) {
    if (!isObject(p) || typeof p.label !== "string") return `${type}: data[${i}] needs a string "label"`;
    if (!isNumber(p.value)) return `${type}: data[${i}].value must be a number`;
    if (p.series !== undefined && typeof p.series !== "string") return `${type}: data[${i}].series must be a string`;
    if (p.booking_ids !== undefined && !isStringArray(p.booking_ids))
      return `${type}: data[${i}].booking_ids must be an array of strings`;
  }
  return undefined;
}

export function parseSpec(raw: unknown): ParseResult {
  if (!isObject(raw)) return { ok: false, error: "Widget spec must be an object" };
  if (!TYPES.includes(raw.type as string)) {
    return { ok: false, error: `Unknown widget spec type "${String(raw.type)}" (expected ${TYPES.join(", ")})` };
  }
  const error = check(raw);
  return error ? { ok: false, error } : { ok: true, spec: raw as unknown as Spec };
}
