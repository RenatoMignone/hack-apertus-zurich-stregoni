import { useState } from "react";
import { Outlet } from "react-router";
import { useResetDemoData } from "../api/system";
import { TrustRoomPanel } from "../trustroom/TrustRoomPanel";
import styles from "./AppShell.module.css";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const reset = useResetDemoData();

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ""}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={styles.main}>
        <Header />
        <main className={styles.content}>
          <Outlet />
        </main>
        <footer className={styles.footer}>
          <button type="button" className={styles.reset} onClick={() => reset.mutate()} disabled={reset.isPending}>
            {reset.isPending ? "Resetting…" : "Reset demo data"}
          </button>
          {reset.isError && <span className={styles.error}>Reset failed: {reset.error.message}</span>}
        </footer>
      </div>
      <TrustRoomPanel />
    </div>
  );
}
