import { useState } from "react";
import { fetchAllBookings } from "../api/bookings";
import { Icon } from "../components/Icon";
import type { MovementsFilter } from "../trustroom/protocol";
import { bookingsToCsv } from "./movementsCsv";
import styles from "./MovementsPage.module.css";

/** Downloads all bookings of the current filter (every API page) as CSV. */
export function MovementsExport({ filter }: { filter: MovementsFilter }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function download() {
    setBusy(true);
    setFailed(false);
    try {
      const csv = bookingsToCsv(await fetchAllBookings(filter));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "movements.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={styles.linkButton} disabled={busy} onClick={download}>
      <Icon name="download" size={20} />
      {busy ? "Exporting…" : failed ? "Export failed, retry" : "Export as CSV file"}
    </button>
  );
}
