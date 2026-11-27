/** Shown when TRUSTROOM_URL is not configured. Purely visual: nothing here does anything. */
import { Icon } from "../components/Icon";
import styles from "./TrustRoom.module.css";

export function TrustRoomPlaceholder() {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderBody}>
        <h2>Your TrustRoom will live here</h2>
        <p>
          Set <code>trustroomUrl</code> in <code>config.js</code> (or <code>TRUSTROOM_URL</code> in Docker) to embed
          your solution. See <code>docs/trustroom-panel-context.md</code>.
        </p>
      </div>
      <div className={styles.inputRow}>
        <button type="button" className={styles.inputIcon} aria-label="Upload document" disabled>
          <Icon name="paperclip" />
        </button>
        <input className={styles.input} placeholder="Enter message" disabled />
        <button type="button" className={styles.inputIcon} aria-label="Voice input" disabled>
          <Icon name="mic" />
        </button>
        <button type="button" className={styles.inputIcon} aria-label="Send" disabled>
          <Icon name="send" />
        </button>
      </div>
    </div>
  );
}
