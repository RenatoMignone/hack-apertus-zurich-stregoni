/** Portfolio widget: depot allocation by asset class as a donut. */
import { Link } from "react-router";
import { hasDepot, usePortfolio } from "../../api/portfolio";
import { DonutChart } from "../../components/charts/DonutChart";
import { QueryState } from "../../components/QueryState";
import { pagePath } from "../../routes";
import styles from "../widgets.module.css";

export function PortfolioWidget() {
  const portfolio = usePortfolio();
  return (
    <QueryState query={portfolio}>
      {(p) =>
        !hasDepot(p) ? (
          <div className={styles.muted}>No securities depot.</div>
        ) : (
          <>
            <div>{p.depot_name}</div>
            <DonutChart
              currency="CHF"
              total={p.total_value_chf}
              slices={p.allocation.asset_class.map((s) => ({
                label: s.label,
                value: s.value_chf,
                share: s.weight_pct,
              }))}
            />
            <Link className={styles.sourceLink} to={`${pagePath("portfolio")}?tab=allocation`}>
              Show portfolio
            </Link>
          </>
        )
      }
    </QueryState>
  );
}
