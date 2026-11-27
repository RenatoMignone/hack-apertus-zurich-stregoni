/** Bar chart, grouped by default or stacked. One bar per series and label. */
import { formatNumber } from "../../format";
import { Axes, DEFAULT_FRAME, Legend, MaybeLink, visibleLabel } from "./ChartParts";
import { chartColor, niceTicks, type ChartSeries } from "./chartUtils";
import styles from "./charts.module.css";

interface Props {
  labels: string[];
  series: ChartSeries[];
  stacked?: boolean;
  /** Shown before values in tooltips. */
  currency?: string;
  xLabel?: string;
  yLabel?: string;
}

export function BarChart({ labels, series, stacked, currency, xLabel, yLabel }: Props) {
  const f = DEFAULT_FRAME;
  const val = (s: ChartSeries, i: number) => s.values[i] ?? 0;
  const extent = labels.map((_, i) =>
    stacked
      ? [series.reduce((a, s) => a + Math.min(0, val(s, i)), 0), series.reduce((a, s) => a + Math.max(0, val(s, i)), 0)]
      : [Math.min(0, ...series.map((s) => val(s, i))), Math.max(0, ...series.map((s) => val(s, i)))],
  );
  const ticks = niceTicks(Math.min(0, ...extent.map((e) => e[0])), Math.max(0, ...extent.map((e) => e[1])));
  const [lo, hi] = [ticks[0], ticks[ticks.length - 1]];
  const plotW = f.width - f.left - f.right;
  const plotH = f.height - f.top - f.bottom;
  const y = (v: number) => f.top + plotH - ((v - lo) / (hi - lo)) * plotH;
  const band = plotW / labels.length;
  const barW = (band * 0.7) / (stacked ? 1 : series.length);

  return (
    <div>
      <svg viewBox={`0 0 ${f.width} ${f.height}`} className={styles.svg} role="img">
        <Axes frame={f} ticks={ticks} y={y} xLabel={xLabel} yLabel={yLabel} />
        {labels.map((label, i) => {
          const bandX = f.left + i * band + band * 0.15;
          let pos = 0;
          let neg = 0;
          return (
            <g key={i}>
              {visibleLabel(i, labels.length) && (
                <text
                  x={f.left + i * band + band / 2}
                  y={f.height - f.bottom + 18}
                  textAnchor="middle"
                  className={styles.axisText}
                >
                  {label}
                </text>
              )}
              {series.map((s, si) => {
                const v = val(s, i);
                if (s.values[i] === null) return null;
                let from = 0;
                if (stacked) {
                  from = v >= 0 ? pos : neg;
                  if (v >= 0) pos += v;
                  else neg += v;
                }
                const [top, bottom] = [y(Math.max(from, from + v)), y(Math.min(from, from + v))];
                return (
                  <MaybeLink key={s.name} href={s.hrefs?.[i]}>
                    <rect
                      x={bandX + (stacked ? 0 : si * barW)}
                      y={top}
                      width={barW}
                      height={Math.max(bottom - top, 0)}
                      style={{ fill: chartColor(si) }}
                    >
                      <title>{`${label}${series.length > 1 ? ` · ${s.name}` : ""}: ${currency ? currency + " " : ""}${formatNumber(v)}`}</title>
                    </rect>
                  </MaybeLink>
                );
              })}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && <Legend items={series.map((s, i) => ({ name: s.name, color: chartColor(i) }))} />}
    </div>
  );
}
