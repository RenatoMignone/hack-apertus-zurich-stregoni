import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** Renders loading and error states of a query, and the children once data is there. */
export function QueryState<T>({
  query,
  children,
}: {
  query: { data: T | undefined; isPending: boolean; error: Error | null };
  children: (data: T) => ReactNode;
}) {
  if (query.error) return <ErrorTile message={query.error.message} />;
  if (query.isPending || query.data === undefined) return <div className={styles.muted}>Loading…</div>;
  return <>{children(query.data)}</>;
}

export function ErrorTile({ message }: { message: string }) {
  return (
    <div className={styles.error} role="alert">
      {message}
    </div>
  );
}
