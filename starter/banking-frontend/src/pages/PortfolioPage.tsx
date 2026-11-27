/** Portfolio: read-only depot with tabs `?tab=positions|allocation|performance`. */
import { useSearchParams } from "react-router";
import { hasDepot, usePerformance, usePortfolio, usePositions, type PerformancePeriod } from "../api/portfolio";
import type { Schemas } from "../api/client";
import { Card } from "../components/Card";
import { LineChart } from "../components/charts/LineChart";
import { DonutChart } from "../components/charts/DonutChart";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { Tabs } from "../components/Tabs";
import { formatAmount, formatDate, formatDateLong, formatNumber } from "../format";
import styles from "./PortfolioPage.module.css";

const TABS = [
  { value: "positions", label: "Positions" },
  { value: "allocation", label: "Asset allocation" },
  { value: "performance", label: "Performance" },
] as const;
type Tab = (typeof TABS)[number]["value"];

export function PortfolioPage() {
  const portfolio = usePortfolio();
  return (
    <>
      <PageHeader title="Portfolio" />
      <QueryState query={portfolio}>
        {(p) =>
          hasDepot(p) ? (
            <Depot portfolio={p} />
          ) : (
            <Card>
              <p className={styles.muted}>You don't have a securities depot with us.</p>
            </Card>
          )
        }
      </QueryState>
    </>
  );
}

function Depot({ portfolio: p }: { portfolio: Schemas["Portfolio"] }) {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab");
  const tab: Tab = TABS.find((t) => t.value === requested)?.value ?? "positions";
  return (
    <>
      <div className={styles.header}>
        <div className={styles.depotName}>{p.depot_name}</div>
        <div className={styles.depotMeta}>{p.depot_id}</div>
        <div className={styles.total}>{formatAmount(p.total_value_chf, "CHF")}</div>
        <div className={styles.depotMeta}>as of {formatDateLong(p.as_of)}</div>
      </div>
      <Tabs tabs={[...TABS]} value={tab} onChange={(t) => setParams({ tab: t })} />
      <div className={styles.body}>
        {tab === "positions" && <Positions />}
        {tab === "allocation" && <Allocation allocation={p.allocation} />}
        {tab === "performance" && <Performance />}
      </div>
    </>
  );
}

const signClass = (v: number) => (v > 0 ? styles.positive : v < 0 ? styles.negative : "");

function Positions() {
  const positions = usePositions();
  return (
    <QueryState query={positions}>
      {(data) => (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Security</th>
              <th className={styles.right}>Quantity</th>
              <th className={styles.right}>Price</th>
              <th className={styles.right}>Value CHF</th>
              <th className={styles.right}>Share</th>
              <th className={styles.right}>Performance</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((pos) => (
              <tr key={pos.isin}>
                <td>
                  {pos.name}
                  <span className={styles.sub}>{pos.isin}</span>
                </td>
                <td className={styles.right}>{formatNumber(pos.quantity, Number.isInteger(pos.quantity) ? 0 : 4)}</td>
                <td className={styles.right}>
                  {pos.currency} {formatNumber(pos.price)}
                  {pos.price_date && <span className={styles.sub}>{formatDate(pos.price_date)}</span>}
                </td>
                <td className={styles.right}>{formatNumber(pos.market_value_chf)}</td>
                <td className={styles.right}>{formatNumber(pos.weight_pct)}%</td>
                <td className={`${styles.right} ${signClass(pos.performance_pct ?? 0)}`}>
                  {pos.performance_pct === undefined
                    ? ""
                    : `${pos.performance_pct > 0 ? "+" : ""}${formatNumber(pos.performance_pct)}%`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total</td>
              <td className={styles.right}>{formatNumber(data.total_value_chf)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      )}
    </QueryState>
  );
}

function Allocation({ allocation }: { allocation: Schemas["Portfolio"]["allocation"] }) {
  const groups = [
    { title: "By asset class", slices: allocation.asset_class },
    { title: "By currency", slices: allocation.currency },
    { title: "By region", slices: allocation.region },
  ];
  return (
    <div className={styles.donuts}>
      {groups.map((g) => (
        <Card key={g.title} title={g.title}>
          <DonutChart
            currency="CHF"
            slices={g.slices.map((s) => ({ label: s.label, value: s.value_chf, share: s.weight_pct }))}
          />
        </Card>
      ))}
    </div>
  );
}

const PERIODS: { value: PerformancePeriod; label: string }[] = [
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1 year" },
  { value: "3y", label: "3 years" },
];

function Performance() {
  const [params, setParams] = useSearchParams();
  const period = PERIODS.find((p) => p.value === params.get("period"))?.value ?? "ytd";
  const performance = usePerformance(period);
  return (
    <Card title="Performance">
      <div className={styles.periods}>
        <Tabs tabs={PERIODS} value={period} onChange={(v) => setParams({ tab: "performance", period: v })} />
      </div>
      <QueryState query={performance}>
        {(d) => (
          <>
            <div className={styles.kpis}>
              <Kpi label="Start value" value={d.start_value_chf} />
              <Kpi label="End value" value={d.end_value_chf} />
              <Kpi label="Net contributions" value={d.net_contributions_chf} />
              {d.performance_pct !== undefined && (
                <div>
                  <div className={styles.kpiLabel}>Performance</div>
                  <div className={`${styles.kpiValue} ${signClass(d.performance_pct)}`}>
                    {d.performance_pct > 0 ? "+" : ""}
                    {formatNumber(d.performance_pct)}%
                  </div>
                </div>
              )}
            </div>
            <LineChart
              size={{ width: 1200, height: 380 }}
              currency="CHF"
              labels={d.points.map((p) => formatDate(p.date))}
              series={[{ name: "Depot value", values: d.points.map((p) => p.value_chf) }]}
            />
          </>
        )}
      </QueryState>
    </Card>
  );
}

function Kpi({ label, value }: { label: string; value?: number }) {
  if (value === undefined) return null;
  return (
    <div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{formatAmount(value, "CHF")}</div>
    </div>
  );
}
