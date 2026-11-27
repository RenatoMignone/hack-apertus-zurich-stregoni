/**
 * Dashboard: widgets of one dashboard on a 3-column grid, a dashboard switcher and edit mode
 * (drag & drop, remove, add from the catalog, save/cancel). All changes go through the API; the
 * TrustRoom is told about every change via `dashboard-changed`.
 */
import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useCustomer } from "../api/customer";
import {
  useCreateDashboard,
  useDashboards,
  useDeleteDashboard,
  useUpdateDashboard,
  type CatalogEntry,
  type Dashboard,
} from "../api/dashboards";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { ErrorTile, QueryState } from "../components/QueryState";
import { formatDateTime } from "../format";
import { pagePath } from "../routes";
import { useTrustRoomActions, useTrustRoomSelection } from "../trustroom/TrustRoomProvider";
import type { Widget } from "../widgets/registry";
import { DRAG_TYPE, WidgetTile } from "../widgets/WidgetTile";
import styles from "../widgets/widgets.module.css";
import pageStyles from "./Dashboard.module.css";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { COLUMNS, firstFreePosition, moveWidget, rowCount } from "./dashboardLayout";
import { WidgetCatalog } from "./WidgetCatalog";

const dashboardPath = (id: string) => `${pagePath("dashboard")}/${id}`;

export function DashboardPage() {
  const { dashboardId } = useParams();
  const navigate = useNavigate();
  const { broadcast } = useTrustRoomActions();
  const dashboards = useDashboards();
  const items = dashboards.data?.items ?? [];
  const dashboard = dashboardId
    ? items.find((d) => d.id === dashboardId)
    : (items.find((d) => d.is_default) ?? items[0]);
  useTrustRoomSelection(dashboard ? { title: dashboard.name, dashboard_id: dashboard.id } : {});

  const create = useCreateDashboard();
  const update = useUpdateDashboard();
  const remove = useDeleteDashboard();
  const failure = create.error ?? update.error ?? remove.error;

  const [catalogOpen, setCatalogOpen] = useState(false);
  const currentId = dashboard?.id;
  /** The widget list being edited; null when not in edit mode. Switching dashboards leaves edit mode. */
  const [editing, setEditing] = useState<{ dashboardId: string | undefined; widgets: Widget[] } | null>(null);
  const draft = editing && editing.dashboardId === currentId ? editing.widgets : null;
  const setDraft = (widgets: Widget[] | null) => setEditing(widgets && { dashboardId: currentId, widgets });

  if (dashboards.data && dashboardId && !dashboard) return <Navigate to={pagePath("dashboard")} replace />;

  const changed = (id: string) => broadcast("dashboard-changed", { dashboard_id: id });

  const deleteDashboard = async (target: Dashboard) => {
    if (!window.confirm(`Delete the dashboard "${target.name}"?`)) return;
    await remove.mutateAsync(target.id);
    changed(target.id);
    setDraft(null);
    if (target.id === currentId) navigate(pagePath("dashboard"));
  };
  const patch = async (target: Dashboard, body: { name?: string; is_default?: boolean }) => {
    await update.mutateAsync({ id: target.id, ...body });
    changed(target.id);
  };
  const save = async () => {
    if (!dashboard || !draft) return;
    const widgets = draft.map(({ id, type, title, position, config, custom }) => ({
      ...(id.startsWith("new-") ? {} : { id }),
      type,
      title,
      position,
      config,
      custom,
    }));
    await update.mutateAsync({ id: dashboard.id, widgets });
    changed(dashboard.id);
    setDraft(null);
  };
  const addEntry = ({ template }: CatalogEntry) => {
    if (!draft || !template) return;
    const position = template.position ?? firstFreePosition(draft);
    setDraft([...draft, { ...template, id: `new-${crypto.randomUUID()}`, position }]);
  };

  return (
    <>
      <PageHeader
        title={dashboard?.name ?? "Dashboard"}
        subtitle={<Greeting />}
        addon={
          dashboard && (
            <DashboardSwitcher
              dashboards={items}
              currentId={dashboard.id}
              onSelect={(d) => navigate(dashboardPath(d.id))}
              onCreate={async (name) => {
                const created = await create.mutateAsync(name);
                changed(created.id);
                navigate(dashboardPath(created.id));
              }}
              onRename={(d, name) => patch(d, { name })}
              onDelete={deleteDashboard}
              onSetDefault={(d) => patch(d, { is_default: true })}
            />
          )
        }
        actions={
          dashboard &&
          (draft ? (
            <div className={pageStyles.toolbar}>
              <Button variant="secondary" onClick={() => setCatalogOpen(true)}>
                Add widget
              </Button>
              <Button variant="secondary" onClick={() => deleteDashboard(dashboard)}>
                Delete
              </Button>
              <Button variant="secondary" onClick={() => setDraft(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={update.isPending}>
                Save
              </Button>
            </div>
          ) : (
            <Button variant="link" onClick={() => setDraft(dashboard.widgets)}>
              Edit
            </Button>
          ))
        }
      />
      {failure && (
        <div className={pageStyles.mutationError}>
          <ErrorTile message={failure.message} />
        </div>
      )}
      <QueryState query={dashboards}>
        {() =>
          dashboard && (
            <div className={styles.grid}>
              {draft ? (
                <EditGrid widgets={draft} onChange={setDraft} />
              ) : (
                dashboard.widgets.map((w) => <WidgetTile key={w.id} widget={w} />)
              )}
            </div>
          )
        }
      </QueryState>
      <WidgetCatalog open={catalogOpen} onClose={() => setCatalogOpen(false)} onAdd={addEntry} />
    </>
  );
}

/** Edit mode: empty drop cells below the tiles, tiles can be dragged onto cells or each other. */
function EditGrid({ widgets, onChange }: { widgets: Widget[]; onChange: (widgets: Widget[]) => void }) {
  const move = (id: string, col: number, row: number) => id && onChange(moveWidget(widgets, id, col, row));
  const cells = Array.from({ length: (rowCount(widgets) + 1) * COLUMNS }, (_, i) => ({
    col: i % COLUMNS,
    row: Math.floor(i / COLUMNS),
  }));
  return (
    <>
      {cells.map(({ col, row }) => (
        <div
          key={`${col}-${row}`}
          className={styles.emptyCell}
          style={{ gridColumn: col + 1, gridRow: row + 1 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => move(e.dataTransfer.getData(DRAG_TYPE), col, row)}
        />
      ))}
      {widgets.map((w) => (
        <WidgetTile
          key={w.id}
          widget={w}
          edit={{
            onRemove: () => onChange(widgets.filter((x) => x.id !== w.id)),
            onDropWidget: (draggedId) => move(draggedId, w.position.col, w.position.row),
          }}
        />
      ))}
    </>
  );
}

function Greeting() {
  const { data: customer } = useCustomer();
  if (!customer) return null;
  const name = `${customer.first_name} ${customer.last_name}`;
  return customer.last_login_at ? (
    <>
      Good morning {name}, your last login was on {formatDateTime(customer.last_login_at)}
    </>
  ) : (
    <>Good morning {name}</>
  );
}
