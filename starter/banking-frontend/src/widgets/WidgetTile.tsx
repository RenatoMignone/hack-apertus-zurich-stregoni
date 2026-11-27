import { Component, type ReactNode } from "react";
import { Card } from "../components/Card";
import { Icon } from "../components/Icon";
import { ErrorTile } from "../components/QueryState";
import { WIDGETS, type Widget } from "./registry";
import styles from "./widgets.module.css";

export const DRAG_TYPE = "text/widget-id";

/** Edit mode: the tile can be dragged, accepts drops of other tiles and can be removed. */
export interface TileEdit {
  onRemove: () => void;
  onDropWidget: (draggedId: string) => void;
}

/** Places a widget on the 3-column grid and renders it via the registry. Errors stay inside the tile. */
export function WidgetTile({ widget, edit }: { widget: Widget; edit?: TileEdit }) {
  const def = WIDGETS[widget.type];
  const { col, row, width = 1, height = 1 } = widget.position;
  const title = widget.title ?? def?.title ?? widget.type;
  return (
    <div
      className={styles.tile}
      style={{ gridColumn: `${col + 1} / span ${width}`, gridRow: `${row + 1} / span ${height}` }}
      onDragOver={edit && ((e) => e.preventDefault())}
      onDrop={edit && ((e) => edit.onDropWidget(e.dataTransfer.getData(DRAG_TYPE)))}
    >
      <Card title={title}>
        <WidgetErrorBoundary>
          {def ? <def.component widget={widget} /> : <ErrorTile message={`Unknown widget type "${widget.type}"`} />}
        </WidgetErrorBoundary>
      </Card>
      {edit && (
        <div
          className={styles.editOverlay}
          draggable
          onDragStart={(e) => e.dataTransfer.setData(DRAG_TYPE, widget.id)}
          title="Drag to move"
        >
          <button type="button" className={styles.removeButton} onClick={edit.onRemove} aria-label={`Remove ${title}`}>
            <Icon name="close" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

class WidgetErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error)
      return <ErrorTile message={`This widget could not be displayed: ${this.state.error.message}`} />;
    return this.props.children;
  }
}
