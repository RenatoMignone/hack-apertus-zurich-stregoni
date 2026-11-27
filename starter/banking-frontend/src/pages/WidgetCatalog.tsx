/** "Add widget" dialog: catalog entries by tab; custom widgets sit in the TrustRoom tab. */
import { useState } from "react";
import { useWidgetCatalog, type CatalogEntry } from "../api/dashboards";
import { Button } from "../components/Button";
import { QueryState } from "../components/QueryState";
import { Modal } from "../components/Modal";
import { Tabs } from "../components/Tabs";
import styles from "./Dashboard.module.css";

type Tab = "all" | CatalogEntry["tab"];

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "payments", label: "Payments" },
  { value: "accounts", label: "Accounts" },
  { value: "investments", label: "Investments" },
  { value: "trustroom", label: "TrustRoom" },
];

export function WidgetCatalog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: CatalogEntry) => void;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const catalog = useWidgetCatalog();
  return (
    <Modal title="Add widget" open={open} onClose={onClose}>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      <QueryState query={catalog}>
        {({ items }) => {
          const entries = items.filter((e) => tab === "all" || e.tab === tab);
          return (
            <div className={styles.catalogList}>
              {entries.length === 0 && <div>No widgets in this tab yet.</div>}
              {entries.map((entry, i) => (
                <div key={`${entry.type}-${entry.title}-${i}`} className={styles.catalogEntry}>
                  <div>
                    <div className={styles.catalogTitle}>{entry.title}</div>
                    {entry.description && <div className={styles.catalogDescription}>{entry.description}</div>}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      onAdd(entry);
                      onClose();
                    }}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          );
        }}
      </QueryState>
    </Modal>
  );
}
