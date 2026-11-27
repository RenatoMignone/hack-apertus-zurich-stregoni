import { useAssetOverview } from "../../api/assetOverview";
import { QueryState } from "../../components/QueryState";
import { formatAmount, formatDateLong } from "../../format";
import styles from "../widgets.module.css";

export function TotalAssetsWidget() {
  const overview = useAssetOverview();
  return (
    <QueryState query={overview}>
      {(o) => (
        <>
          <div className={styles.bigValue}>{formatAmount(o.total_assets_chf, "CHF")}</div>
          <div className={styles.muted}>per {formatDateLong(o.as_of)}</div>
        </>
      )}
    </QueryState>
  );
}
