/** Widget type `custom`: AI-generated content in one of two formats (contract: CustomWidget). */
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import type { Schemas } from "../../api/client";
import { ErrorTile } from "../../components/QueryState";
import { pagePath } from "../../routes";
import type { Widget } from "../registry";
import styles from "../widgets.module.css";
import { DeclarativeWidget } from "./DeclarativeWidget";
import { HtmlWidget } from "./HtmlWidget";

type Custom = Schemas["CustomWidget"];

/** `refresh.mode = endpoint`: GET fresh CustomWidget JSON on load and every `interval_seconds`. */
function useRefreshedContent(stored: Custom | undefined) {
  const refresh = stored?.refresh;
  const url = refresh?.mode === "endpoint" ? refresh.url : undefined;
  return useQuery({
    queryKey: ["widget-refresh", url],
    enabled: !!url,
    retry: false,
    refetchInterval: refresh?.interval_seconds ? refresh.interval_seconds * 1000 : false,
    queryFn: async (): Promise<Custom> => {
      const response = await fetch(url!);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const fresh = await response.json();
      if (fresh?.format !== "html" && fresh?.format !== "declarative") throw new Error("Unexpected content");
      return fresh;
    },
  });
}

export function CustomWidget({ widget }: { widget: Widget }) {
  const refreshed = useRefreshedContent(widget.custom);
  if (!widget.custom) return <ErrorTile message="Custom widget without content" />;

  // Fresh content wins, but keeps the stored refresh settings and source if the endpoint omits them.
  const custom: Custom = refreshed.data ? { ...widget.custom, ...refreshed.data } : widget.custom;

  return (
    <>
      {custom.format === "html" ? (
        <HtmlWidget html={custom.html} height={custom.height} />
      ) : (
        <DeclarativeWidget spec={custom.spec} />
      )}
      {refreshed.isError && (
        <div className={styles.refreshNote}>Live data unavailable, showing the last saved version.</div>
      )}
      <SourceLink source={custom.source} />
    </>
  );
}

/** "Show underlying transactions": deep link to the movements the widget is based on. */
function SourceLink({ source }: { source?: Schemas["WidgetSource"] }) {
  const query = source?.booking_ids?.length ? `ids=${source.booking_ids.join(",")}` : source?.movements_query;
  if (!query) return null;
  return (
    <Link className={styles.sourceLink} to={`${pagePath("movements")}?${query}`}>
      Show underlying transactions
    </Link>
  );
}
