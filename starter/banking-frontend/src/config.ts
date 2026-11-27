/** Runtime configuration, loaded from public/config.js before the app starts. */

declare global {
  interface Window {
    TRUSTROOM_CONFIG?: { apiUrl?: string; trustroomUrl?: string };
  }
}

const raw = window.TRUSTROOM_CONFIG ?? {};

export const config = {
  /** Absolute base URL of the banking API, e.g. http://localhost:8000/api */
  apiUrl: (raw.apiUrl || "http://localhost:8000/api").replace(/\/$/, ""),
  /** URL of the team's TrustRoom solution; empty string shows the built-in placeholder. */
  trustroomUrl: raw.trustroomUrl || "",
};
