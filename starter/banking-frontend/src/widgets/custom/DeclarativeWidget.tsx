/**
 * Declarative widget (`kpi | table | bar | line | donut`), rendered with our own components.
 * One renderer per spec type, same pattern as the widget registry. Specs are validated first.
 */
import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router";
import type { Schemas } from "../../api/client";
import { BarChart } from "../../components/charts/BarChart";
import { groupSeries } from "../../components/charts/chartUtils";
import { DonutChart } from "../../components/charts/DonutChart";
import { LineChart } from "../../components/charts/LineChart";
import { ErrorTile } from "../../components/QueryState";
import { formatAmount, formatDate, formatNumberAuto } from "../../format";
import { pagePath } from "../../routes";
import { parseSpec, type Spec } from "./declarativeSpec";
import styles from "./DeclarativeWidget.module.css";

type Of<T extends Spec["type"]> = Extract<Spec, { type: T }>;
type Chart = Schemas["ChartSpec"];
type Column = Of<"table">["columns"][number];

const movementsHref = (ids?: string[]) => (ids?.length ? `${pagePath("movements")}?ids=${ids.join(",")}` : undefined);

/** Number as amount (when the spec has a currency) or plain Swiss number. */
function formatValue(value: number, currency?: string, unit?: string): string {
  if (currency) return formatAmount(value, currency);
  return unit ? `${formatNumberAuto(value)} ${unit}` : formatNumberAuto(value);
}

function Kpi({ spec }: { spec: Of<"kpi"> }) {
  const delta = spec.delta;
  return (
    <div>
      <div className={styles.kpiValue}>{formatValue(spec.value, spec.currency, spec.unit)}</div>
      {delta !== undefined && (
        <div className={`${styles.kpiDelta} ${delta > 0 ? styles.up : delta < 0 ? styles.down : ""}`}>
          {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : "– "}
          {formatValue(delta, spec.currency, spec.unit)}
          {spec.delta_label && ` ${spec.delta_label}`}
        </div>
      )}
    </div>
  );
}

function formatCell(value: unknown, col: Column, currency?: string): string {
  if (value === null || value === undefined) return "";
  if (typeof value !== "number" && col.format !== "date") return String(value);
  switch (col.format) {
    case "number":
      return formatNumberAuto(value as number);
    case "currency":
      return formatValue(value as number, currency);
    case "percent":
      return `${formatNumberAuto(value as number)}%`;
    case "date":
      return formatDate(String(value));
    default:
      return String(value);
  }
}

function Table({ spec }: { spec: Of<"table"> }) {
  const hasLinks = spec.rows.some((r) => r._booking_ids?.length);
  const alignClass = (c: Column) =>
    styles[c.align ?? (c.format && c.format !== "text" && c.format !== "date" ? "right" : "left")];
  const cells = (row: Record<string, unknown>): ReactNode =>
    spec.columns.map((c) => (
      <td key={c.key} className={alignClass(c)}>
        {formatCell(row[c.key], c, spec.currency)}
      </td>
    ));
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {spec.columns.map((c) => (
            <th key={c.key} className={alignClass(c)}>
              {c.label}
            </th>
          ))}
          {hasLinks && <th />}
        </tr>
      </thead>
      <tbody>
        {spec.rows.map((row, i) => (
          <tr key={i}>
            {cells(row)}
            {hasLinks && (
              <td>{movementsHref(row._booking_ids) && <Link to={movementsHref(row._booking_ids)!}>Show</Link>}</td>
            )}
          </tr>
        ))}
      </tbody>
      {spec.footer && (
        <tfoot>
          <tr>
            {cells(spec.footer)}
            {hasLinks && <td />}
          </tr>
        </tfoot>
      )}
    </table>
  );
}

function chartData(spec: Chart) {
  return groupSeries(
    spec.data.map((p) => ({ ...p, href: movementsHref(p.booking_ids) })),
    spec.title ?? "Value",
  );
}

function Bar({ spec }: { spec: Chart }) {
  return (
    <BarChart
      {...chartData(spec)}
      stacked={spec.stacked}
      currency={spec.currency}
      xLabel={spec.x_label}
      yLabel={spec.y_label}
    />
  );
}

function Line({ spec }: { spec: Chart }) {
  return <LineChart {...chartData(spec)} currency={spec.currency} xLabel={spec.x_label} yLabel={spec.y_label} />;
}

function Donut({ spec }: { spec: Chart }) {
  const slices = spec.data.map((p) => ({ label: p.label, value: p.value, href: movementsHref(p.booking_ids) }));
  return <DonutChart slices={slices} currency={spec.currency} />;
}

const RENDERERS = {
  kpi: Kpi,
  table: Table,
  bar: Bar,
  line: Line,
  donut: Donut,
} as unknown as Record<Spec["type"], ComponentType<{ spec: Spec }>>;

export function DeclarativeWidget({ spec: raw }: { spec: Schemas["DeclarativeSpec"] }) {
  const parsed = parseSpec(raw);
  if (!parsed.ok) return <ErrorTile message={`Invalid widget spec: ${parsed.error}`} />;
  const { spec } = parsed;
  const Renderer = RENDERERS[spec.type];
  return (
    <div>
      {spec.subtitle && <p className={styles.subtitle}>{spec.subtitle}</p>}
      <Renderer spec={spec} />
      {spec.footnote && <p className={styles.footnote}>{spec.footnote}</p>}
    </div>
  );
}
