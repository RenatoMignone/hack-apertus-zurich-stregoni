/** Pure grid helpers for dashboard edit mode (3 columns, widgets span width x height cells). */
import type { Widget } from "../widgets/registry";

export const COLUMNS = 3;

type Position = Widget["position"];

interface Box {
  position: Position;
}

const span = (p: Position) => ({ col: p.col, row: p.row, width: p.width ?? 1, height: p.height ?? 1 });

function overlaps(a: Position, b: Position) {
  const x = span(a);
  const y = span(b);
  return x.col < y.col + y.width && y.col < x.col + x.width && x.row < y.row + y.height && y.row < x.row + x.height;
}

function hasOverlap(widgets: Box[]) {
  return widgets.some((a, i) => widgets.slice(i + 1).some((b) => overlaps(a.position, b.position)));
}

const placeAt = (p: Position, col: number, row: number): Position => ({
  ...p,
  col: Math.min(col, COLUMNS - (p.width ?? 1)),
  row,
});

/** Number of grid rows needed for the widgets. */
export function rowCount(widgets: Box[]) {
  return widgets.reduce((max, w) => Math.max(max, w.position.row + (w.position.height ?? 1)), 0);
}

/** First free spot (reading order) for a new widget. */
export function firstFreePosition(widgets: Box[], width = 1, height = 1): Position {
  for (let row = 0; ; row++) {
    for (let col = 0; col + width <= COLUMNS; col++) {
      const candidate = { col, row, width, height };
      if (!widgets.some((w) => overlaps(candidate, w.position))) return candidate;
    }
  }
}

/**
 * Moves a widget to a grid cell. If the cell holds another widget, the two swap places.
 * Returns the unchanged list if the result would overlap.
 */
export function moveWidget<T extends Box & { id: string }>(widgets: T[], id: string, col: number, row: number): T[] {
  const moving = widgets.find((w) => w.id === id);
  if (!moving) return widgets;
  const target = widgets.find((w) => w.id !== id && overlaps({ col, row, width: 1, height: 1 }, w.position));
  const next = widgets.map((w) => {
    if (w.id === id)
      return {
        ...w,
        position: target
          ? placeAt(w.position, target.position.col, target.position.row)
          : placeAt(w.position, col, row),
      };
    if (w.id === target?.id) return { ...w, position: placeAt(w.position, moving.position.col, moving.position.row) };
    return w;
  });
  return hasOverlap(next) ? widgets : next;
}
