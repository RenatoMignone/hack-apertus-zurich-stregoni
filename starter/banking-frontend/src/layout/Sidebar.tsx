import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { useCustomer } from "../api/customer";
import { Icon } from "../components/Icon";
import { matchPage, pagePath } from "../routes";
import { NAVIGATION, type NavItem } from "./navigation";
import styles from "./Sidebar.module.css";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { data: customer } = useCustomer();
  return (
    <nav className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.brand}>
        <button type="button" className={styles.menuButton} onClick={onToggle} aria-label="Toggle navigation">
          <Icon name="menu" size={26} />
        </button>
        {!collapsed && <span className={styles.logo}>ti&amp;m</span>}
      </div>
      {!collapsed && <div className={styles.user}>{customer?.customer_id ?? " "}</div>}
      <ul className={styles.list}>
        {NAVIGATION.map((item) => (
          <SidebarItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </ul>
    </nav>
  );
}

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useLocation();
  const activePage = matchPage(pathname)?.page.id;
  const childActive = item.children?.some((c) => c.page === activePage) ?? false;
  const [open, setOpen] = useState(childActive);
  const rowClass = `${styles.row} ${item.highlight ? styles.highlight : ""}`;

  if (item.page) {
    return (
      <li>
        <NavLink to={pagePath(item.page)} className={({ isActive }) => `${rowClass} ${isActive ? styles.active : ""}`}>
          <Icon name={item.icon} size={24} className={styles.icon} />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        className={`${rowClass} ${childActive ? styles.active : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Icon name={item.icon} size={24} className={styles.icon} />
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && <Icon name="chevronDown" className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />}
      </button>
      {open && !collapsed && (
        <ul className={styles.sublist}>
          {item.children!.map((child) => (
            <li key={child.page}>
              <NavLink
                to={pagePath(child.page)}
                end
                className={({ isActive }) => `${styles.subrow} ${isActive ? styles.subActive : ""}`}
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
