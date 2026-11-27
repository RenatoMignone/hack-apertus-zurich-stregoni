/** Small SVG/HTML pieces shared by the charts: optional link wrapper, legend, axes. */
import type { ReactNode } from "react";
import { Link } from "react-router";
import { formatTick } from "./chartUtils";
import styles from "./charts.module.css";

/** Wraps SVG content in a router link when `href` is set (e.g. booking_ids → /movements). */
export function MaybeLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <g>{children}</g>;
  return (
    <Link to={href} className={styles.clickable}>
      {children}
    </Link>
  );
}

export function Legend({ items }: { items: { name: string; color: string }[] }) {
  return (
    <div className={styles.legend}>
      {items.map((item) => (
        <span key={item.name}>
          <span className={styles.swatch} style={{ background: item.color }} />
          {item.name}
        </span>
      ))}
    </div>
  );
}

export interface Frame {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export const DEFAULT_FRAME: Frame = { width: 600, height: 280, left: 72, right: 16, top: 12, bottom: 44 };

/** Horizontal grid lines with Swiss-formatted y labels, an x axis and optional axis titles. */
export function Axes(props: {
  frame: Frame;
  ticks: number[];
  y: (v: number) => number;
  xLabel?: string;
  yLabel?: string;
}) {
  const { frame: f, ticks, y } = props;
  return (
    <g>
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={f.left}
            x2={f.width - f.right}
            y1={y(t)}
            y2={y(t)}
            className={t === 0 ? styles.axisLine : styles.grid}
          />
          <text x={f.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className={styles.axisText}>
            {formatTick(t, ticks)}
          </text>
        </g>
      ))}
      {props.xLabel && (
        <text x={(f.left + f.width - f.right) / 2} y={f.height - 4} textAnchor="middle" className={styles.axisText}>
          {props.xLabel}
        </text>
      )}
      {props.yLabel && (
        <text
          transform={`rotate(-90 12 ${(f.top + f.height - f.bottom) / 2})`}
          x={12}
          y={(f.top + f.height - f.bottom) / 2}
          textAnchor="middle"
          className={styles.axisText}
        >
          {props.yLabel}
        </text>
      )}
    </g>
  );
}

/** At most ~8 x labels, evenly thinned. */
export function visibleLabel(index: number, count: number): boolean {
  return index % Math.ceil(count / 8) === 0;
}
