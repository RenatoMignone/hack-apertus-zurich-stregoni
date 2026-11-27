import type { ReactNode } from "react";
import styles from "./ui.module.css";

/** Flat white card, the base of widgets and tiles. */
export function Card({ title, actions, children }: { title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      {(title || actions) && (
        <header className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
