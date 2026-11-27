/** Dropdown next to the title: pick a dashboard, rename/delete/set default via "…", or generate a new one. */
import { useState } from "react";
import type { Dashboard } from "../api/dashboards";
import { Button } from "../components/Button";
import { TextField } from "../components/Field";
import { Icon } from "../components/Icon";
import { Modal } from "../components/Modal";
import styles from "./Dashboard.module.css";

interface Props {
  dashboards: Dashboard[];
  currentId: string;
  onSelect: (dashboard: Dashboard) => void;
  onCreate: (name: string) => void;
  onRename: (dashboard: Dashboard, name: string) => void;
  onDelete: (dashboard: Dashboard) => void;
  onSetDefault: (dashboard: Dashboard) => void;
}

/** What the name dialog is for: a new dashboard (no target) or renaming an existing one. */
interface NameDialog {
  target?: Dashboard;
}

export function DashboardSwitcher({
  dashboards,
  currentId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onSetDefault,
}: Props) {
  const [open, setOpen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [dialog, setDialog] = useState<NameDialog | null>(null);
  const [name, setName] = useState("");

  const close = () => {
    setOpen(false);
    setMenuFor(null);
  };
  const openDialog = (next: NameDialog) => {
    close();
    setName(next.target?.name ?? "");
    setDialog(next);
  };
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || !dialog) return;
    if (dialog.target) onRename(dialog.target, trimmed);
    else onCreate(trimmed);
    setDialog(null);
  };

  return (
    <div className={styles.switcher}>
      <button
        type="button"
        className={styles.switcherButton}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Switch dashboard"
      >
        <Icon name="chevronDown" size={20} />
      </button>
      {open && (
        <div className={styles.menu}>
          {dashboards.map((d) => (
            <div key={d.id} className={`${styles.entry} ${d.id === currentId ? styles.entryActive : ""}`}>
              <button
                type="button"
                className={styles.entryName}
                onClick={() => {
                  close();
                  onSelect(d);
                }}
              >
                {d.name}
                {d.is_default && <span className={styles.badge}>Default</span>}
              </button>
              <button
                type="button"
                className={styles.iconButton}
                aria-label={`Options for ${d.name}`}
                onClick={() => setMenuFor(menuFor === d.id ? null : d.id)}
              >
                <Icon name="more" />
              </button>
              {menuFor === d.id && (
                <div className={styles.submenu}>
                  <button type="button" onClick={() => openDialog({ target: d })}>
                    Rename
                  </button>
                  {!d.is_default && (
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        onSetDefault(d);
                      }}
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onDelete(d);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          <button type="button" className={styles.generate} onClick={() => openDialog({})}>
            <Icon name="plus" size={18} /> Generate overview
          </button>
        </div>
      )}
      <Modal
        title={dialog?.target ? "Rename dashboard" : "Generate overview"}
        open={dialog !== null}
        onClose={() => setDialog(null)}
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!name.trim()}>
              {dialog?.target ? "Rename" : "Create"}
            </Button>
          </>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <TextField label="Name" value={name} maxLength={60} autoFocus onChange={(e) => setName(e.target.value)} />
        </form>
      </Modal>
    </div>
  );
}
