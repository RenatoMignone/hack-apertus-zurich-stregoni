/**
 * Login state of the demo customer: the token from POST /auth/login plus a minimal identity.
 * Kept in memory and, best effort, in localStorage so a reload stays logged in. Every storage access
 * is wrapped in try/catch: the app also works with storage blocked (private mode, sandboxed previews).
 * Imports only routes.ts, so it stays testable without a browser.
 */
import { isAppPath, LOGIN_PATH, pagePath } from "./routes";

export interface Auth {
  token: string;
  customer_id: string;
  first_name: string;
  last_name: string;
}

const STORAGE_KEY = "trustroom-banking-auth";

let current: Auth | null | undefined; // undefined = not yet read from storage

function load(): Auth | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return typeof parsed?.token === "string" && parsed.token ? (parsed as Auth) : null;
  } catch {
    return null;
  }
}

export function getAuth(): Auth | null {
  if (current === undefined) current = load();
  return current;
}

export function setAuth(auth: Auth): void {
  current = auth;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  } catch {
    // No storage: stay logged in for this page load only.
  }
}

export function clearAuth(): void {
  current = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
}

/** "/login?next=%2Fmovements%3Fids%3DBK-00601" for the page the customer wanted to see. */
export function loginUrl(next: string): string {
  return `${LOGIN_PATH}?${new URLSearchParams({ next })}`;
}

/** Where to go after login: `next` if it is a relative e-banking path, otherwise the dashboard. */
export function safeNext(next: string | null): string {
  return isAppPath(next) ? next : pagePath("dashboard");
}

/** API answered 401 (token missing or no longer valid): forget it and log in again, then come back here. */
export function redirectToLogin(location: { pathname: string; search: string; assign: (url: string) => void }): void {
  clearAuth();
  if (location.pathname === LOGIN_PATH) return;
  location.assign(loginUrl(location.pathname + location.search));
}
