/**
 * Side panel opened from the header icon. The iframe is created on first open and then kept
 * mounted, so the solution keeps its state while the panel is closed. On /trustroom the page
 * itself embeds the solution, so the panel is not rendered there (one live copy only).
 */
import { useState } from "react";
import { useLocation } from "react-router";
import { Icon } from "../components/Icon";
import { config } from "../config";
import { matchPage } from "../routes";
import styles from "./TrustRoom.module.css";
import { TrustRoomFrame } from "./TrustRoomFrame";
import { TrustRoomPlaceholder } from "./TrustRoomPlaceholder";
import { useTrustRoom } from "./TrustRoomProvider";

export function TrustRoomPanel() {
  const { panelOpen, setPanelOpen } = useTrustRoom();
  const { pathname } = useLocation();
  const [opened, setOpened] = useState(false);
  if (panelOpen && !opened) setOpened(true);

  if (!opened || matchPage(pathname)?.page.id === "trustroom") return null;
  const close = () => setPanelOpen(false);

  return (
    <aside className={styles.panel} hidden={!panelOpen} aria-label="TrustRoom">
      <header className={styles.panelHeader}>
        <h2>TrustRoom</h2>
        <button type="button" className={styles.iconButton} onClick={close} aria-label="Close TrustRoom">
          <Icon name="close" />
        </button>
      </header>
      <div className={styles.panelBody}>
        {config.trustroomUrl ? (
          <TrustRoomFrame mode="panel" visible={panelOpen} onClose={close} />
        ) : (
          <TrustRoomPlaceholder />
        )}
      </div>
    </aside>
  );
}
