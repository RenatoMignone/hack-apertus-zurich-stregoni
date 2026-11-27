/** Line chart with area fill. One line per series; points are evenly spaced categories. */
import { formatNumber } from "../../format";
import { Axes, DEFAULT_FRAME, Legend, MaybeLink, visibleLabel } from "./ChartParts";
import { chartColor, niceTicks, type ChartSeries } from "./chartUtils";
import styles from "./charts.module.css";

interface Props {
  labels: string[];
  series: ChartSeries[];
  /** Shown before values in tooltips. */
  currency?: string;
  xLabel?: string;
  yLabel?: string;
  /** Drawing size; use a wider one on full-page charts so text stays small. */
  size?: { width: number; height: number };
}

export function LineChart({ labels, series, currency, xLabel, yLabel, size }: Props) {
  const f = { ...DEFAULT_FRAME, ...size };
  const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  if (!all.length) return <p>No data</p>;
  const ticks = niceTicks(Math.min(...all), Math.max(...all));
  const [lo, hi] = [ticks[0], ticks[ticks.length - 1]];
  const plotW = f.width - f.left - f.right;
  const plotH = f.height - f.top - f.bottom;
  const x = (i: number) => f.left + (labels.length > 1 ? (i / (labels.length - 1)) * plotW : plotW / 2);
  const y = (v: number) => f.top + plotH - ((v - lo) / (hi - lo)) * plotH;

  return (
    <div>
      <svg viewBox={`0 0 ${f.width} ${f.height}`} className={styles.svg} role="img">
        <Axes frame={f} ticks={ticks} y={y} xLabel={xLabel} yLabel={yLabel} />
        {labels.map(
          (label, i) =>
            visibleLabel(i, labels.length) && (
              <text key={i} x={x(i)} y={f.height - f.bottom + 18} textAnchor="middle" className={styles.axisText}>
                {label}
              </text>
            ),
        )}
        {series.map((s, si) => {
          const color = chartColor(si);
          const pts = s.values.flatMap((v, i) => (v === null ? [] : [{ i, v }]));
          if (!pts.length) return null;
          const line = pts.map((p, k) => `${k ? "L" : "M"}${x(p.i)},${y(p.v)}`).join(" ");
          const area = `${line} L${x(pts[pts.length - 1].i)},${y(lo)} L${x(pts[0].i)},${y(lo)} Z`;
          return (
            <g key={s.name}>
              <path d={area} style={{ fill: color }} opacity={0.12} />
              <path d={line} style={{ stroke: color }} fill="none" strokeWidth={2} />
              {pts.map((p) => (
                <MaybeLink key={p.i} href={s.hrefs?.[p.i]}>
                  <circle cx={x(p.i)} cy={y(p.v)} r={4} style={{ fill: color }}>
                    <title>{`${labels[p.i]}: ${currency ? currency + " " : ""}${formatNumber(p.v)}`}</title>
                  </circle>
                </MaybeLink>
              ))}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ name: s.name, color: chartColor(i) }))} />}
    </div>
  );
}
