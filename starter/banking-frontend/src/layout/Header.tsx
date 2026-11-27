import { Link, useLocation } from "react-router";
import { useLogout } from "../api/auth";
import { Icon, type IconName } from "../components/Icon";
import { matchPage, pagePath } from "../routes";
import { useTrustRoom } from "../trustroom/TrustRoomProvider";
import styles from "./Header.module.css";

export function Header() {
  const { panelOpen, setPanelOpen } = useTrustRoom();
  const logout = useLogout();
  // On /trustroom the page already shows the TrustRoom, so the panel toggle is disabled there.
  const onTrustRoomPage = matchPage(useLocation().pathname)?.page.id === "trustroom";
  return (
    <header className={styles.header}>
      {/* Search is a dummy: it looks like the real e-banking but does nothing. */}
      <label className={styles.search}>
        <input placeholder="Search" aria-label="Search" />
        <Icon name="search" />
      </label>
      <div className={styles.actions}>
        <HeaderAction
          icon="trustroom"
          label="TrustRoom"
          active={panelOpen && !onTrustRoomPage}
          disabled={onTrustRoomPage}
          onClick={() => setPanelOpen(!panelOpen)}
        />
        <HeaderAction icon="mail" label="Messages" />
        <HeaderAction icon="bell" label="Notifications" badge={3} />
        <Link to={pagePath("settings")} className={styles.action}>
          <Icon name="settings" size={24} />
          <span>Settings</span>
        </Link>
        <HeaderAction
          icon="logout"
          label="Log out"
          danger
          onClick={() => {
            // Close the TrustRoom too, so the next customer doesn't land in an open panel.
            setPanelOpen(false);
            void logout();
          }}
        />
      </div>
    </header>
  );
}

interface ActionProps {
  icon: IconName;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
  danger?: boolean;
}

/** Header button. Without onClick it is a dummy (messages, notifications). */
function HeaderAction({ icon, label, onClick, active, disabled, badge, danger }: ActionProps) {
  return (
    <button
      type="button"
      className={`${styles.action} ${active ? styles.active : ""} ${danger ? styles.danger : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={onClick ? active : undefined}
    >
      <Icon name={icon} size={24} />
      <span>{label}</span>
      {badge !== undefined && <span className={styles.badge}>{badge}</span>}
    </button>
  );
}
