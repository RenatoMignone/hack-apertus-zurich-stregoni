/** Helpers shared by the SVG charts: colors, axis ticks and flat-data grouping. */
import { formatNumber } from "../../format";

const EXTRA_COLORS = ["#7a5bb5", "#3aa7b8", "#8c8c8c", "#b5527a"];

/** Series/slice color: the five tokens of the chart palette, then a few fixed extras. */
export function chartColor(index: number): string {
  const i = index % (5 + EXTRA_COLORS.length);
  return i < 5 ? `var(--chart-${i + 1})` : EXTRA_COLORS[i - 5];
}

/** Axis ticks on "nice" values covering [min, max], e.g. 0, 20'000, 40'000. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) max = min + 1;
  const raw = (max - min) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / magnitude;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * magnitude;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** Swiss-formatted axis label; decimals only when the tick step needs them. */
export function formatTick(value: number, ticks: number[]): string {
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  return formatNumber(value, step >= 1 ? 0 : 2);
}

export interface ChartSeries {
  name: string;
  /** One value per label; null when the series has no point there. */
  values: (number | null)[];
  /** Optional link per value (e.g. `/movements?ids=…`). */
  hrefs?: (string | undefined)[];
}

export interface FlatPoint {
  label: string;
  value: number;
  series?: string;
  href?: string;
}

/** Turns flat `{label, value, series?}` points into labels + one series per `series` name. */
export function groupSeries(points: FlatPoint[], defaultName = "Value"): { labels: string[]; series: ChartSeries[] } {
  const labels: string[] = [];
  const byName = new Map<string, ChartSeries>();
  for (const p of points) if (!labels.includes(p.label)) labels.push(p.label);
  for (const p of points) {
    const name = p.series ?? defaultName;
    let s = byName.get(name);
    if (!s) {
      s = { name, values: labels.map(() => null), hrefs: labels.map(() => undefined) };
      byName.set(name, s);
    }
    const i = labels.indexOf(p.label);
    s.values[i] = p.value;
    s.hrefs![i] = p.href;
  }
  return { labels, series: [...byName.values()] };
}
