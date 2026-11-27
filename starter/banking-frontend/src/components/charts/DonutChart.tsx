/** Donut with a legend of share and amount. Slices with `href` are clickable. */
import { formatNumber } from "../../format";
import { MaybeLink } from "./ChartParts";
import { chartColor } from "./chartUtils";
import styles from "./charts.module.css";

export interface DonutSlice {
  label: string;
  value: number;
  /** Share in percent. Pass the API's weight when it has one; otherwise derived from the values. */
  share?: number;
  href?: string;
}

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function DonutChart({ slices, currency, total }: { slices: DonutSlice[]; currency?: string; total?: number }) {
  const sum = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  let offset = 0;
  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 200 200" className={styles.donut} role="img">
        <g transform="rotate(-90 100 100)">
          {sum > 0 &&
            slices.map((s, i) => {
              const len = (Math.max(0, s.value) / sum) * CIRCUMFERENCE;
              const start = offset;
              offset += len;
              return (
                <MaybeLink key={s.label} href={s.href}>
                  <circle
                    cx={100}
                    cy={100}
                    r={R}
                    fill="none"
                    strokeWidth={14}
                    strokeDasharray={`${len} ${CIRCUMFERENCE - len}`}
                    strokeDashoffset={-start}
                    style={{ stroke: chartColor(i) }}
                  >
                    <title>{`${s.label}: ${legendValue(s, sum, currency)}`}</title>
                  </circle>
                </MaybeLink>
              );
            })}
        </g>
        {total !== undefined && (
          <>
            {currency && (
              <text x={100} y={94} textAnchor="middle" className={styles.donutCurrency}>
                {currency}
              </text>
            )}
            <text x={100} y={currency ? 114 : 105} textAnchor="middle" className={styles.donutTotal}>
              {formatNumber(total)}
            </text>
          </>
        )}
      </svg>
      <ul className={styles.donutLegend}>
        {slices.map((s, i) => (
          <li key={s.label}>
            <span className={styles.swatch} style={{ background: chartColor(i) }} />
            <span className={styles.donutLabel}>{s.label}</span>
            <span className={styles.donutValue}>{legendValue(s, sum, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "34.93% (CHF 19'609.95)" */
function legendValue(s: DonutSlice, sum: number, currency?: string): string {
  const share = s.share ?? (sum > 0 ? (s.value / sum) * 100 : 0);
  return `${formatNumber(share)}% (${currency ? currency + " " : ""}${formatNumber(s.value)})`;
}
