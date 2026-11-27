import type { ReactNode } from "react";
import styles from "./ui.module.css";

interface Props {
  title: string;
  /** Next to the title, e.g. a dashboard switcher or "Select filter" dropdown. */
  addon?: ReactNode;
  /** Line under the title, e.g. the greeting. */
  subtitle?: ReactNode;
  /** Right-aligned, e.g. an "Edit" button. */
  actions?: ReactNode;
}

export function PageHeader({ title, addon, subtitle, actions }: Props) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {addon}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
