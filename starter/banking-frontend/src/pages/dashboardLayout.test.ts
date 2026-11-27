import { describe, expect, it } from "vitest";
import { firstFreePosition, moveWidget, rowCount } from "./dashboardLayout";

const w = (id: string, col: number, row: number, width = 1) => ({ id, position: { col, row, width, height: 1 } });

describe("dashboardLayout", () => {
  it("moves a widget to an empty cell", () => {
    const next = moveWidget([w("a", 0, 0), w("b", 1, 0)], "a", 2, 1);
    expect(next[0].position).toMatchObject({ col: 2, row: 1 });
  });

  it("swaps with the widget in the target cell", () => {
    const next = moveWidget([w("a", 0, 0), w("b", 1, 0)], "a", 1, 0);
    expect(next[0].position).toMatchObject({ col: 1, row: 0 });
    expect(next[1].position).toMatchObject({ col: 0, row: 0 });
  });

  it("keeps wide widgets inside the grid and refuses overlaps", () => {
    expect(moveWidget([w("a", 0, 0, 2)], "a", 2, 0)[0].position.col).toBe(1);
    const list = [w("a", 0, 0, 2), w("b", 2, 0), w("c", 1, 1)];
    expect(moveWidget(list, "a", 0, 1)).toBe(list);
  });

  it("finds free positions and row counts", () => {
    expect(firstFreePosition([w("a", 0, 0), w("b", 1, 0), w("c", 2, 0)])).toMatchObject({ col: 0, row: 1 });
    expect(firstFreePosition([w("a", 0, 0, 2)], 2)).toMatchObject({ col: 0, row: 1 });
    expect(rowCount([w("a", 0, 2)])).toBe(3);
  });
});
