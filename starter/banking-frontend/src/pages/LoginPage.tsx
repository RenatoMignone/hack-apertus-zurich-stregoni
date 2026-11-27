/** Login (`/login?next=…`), outside the app shell. After login, continues to `next` or the dashboard. */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLogin } from "../api/auth";
import { ApiError } from "../api/client";
import { safeNext } from "../auth";
import { Button } from "../components/Button";
import { TextField } from "../components/Field";
import { ErrorTile } from "../components/QueryState";
import styles from "./LoginPage.module.css";

/** The demo logins of the mock API (contract: POST /auth/login). */
const DEMO_USERS = [
  { username: "lukas", password: "lukas2026", name: "Lukas Meier" },
  { username: "jana", password: "jana2026", name: "Jana Widmer" },
  { username: "daniela", password: "daniela2026", name: "Daniela Rüegg" },
  { username: "marco", password: "marco2026", name: "Marco Baumann" },
];

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();
  const next = safeNext(useSearchParams()[0].get("next"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ username: username.trim(), password }, { onSuccess: () => navigate(next, { replace: true }) });
  };

  return (
    <div className={styles.page}>
      <aside className={styles.brand}>
        <span className={styles.logo}>ti&amp;m</span>
        <span>E-Banking</span>
      </aside>
      <main className={styles.main}>
        <form className={styles.card} onSubmit={submit}>
          <h1 className={styles.title}>Log in</h1>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {login.error && <ErrorTile message={loginError(login.error)} />}
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Logging in…" : "Log in"}
          </Button>
          <DemoUsers
            onPick={(u) => {
              setUsername(u.username);
              setPassword(u.password);
            }}
          />
        </form>
      </main>
    </div>
  );
}

function loginError(error: Error): string {
  return error instanceof ApiError && error.status === 401
    ? "Wrong username or password."
    : `Login failed: ${error.message}`;
}

function DemoUsers({ onPick }: { onPick: (user: (typeof DEMO_USERS)[number]) => void }) {
  return (
    <div className={styles.demo}>
      <div className={styles.demoTitle}>Demo users</div>
      <ul>
        {DEMO_USERS.map((u) => (
          <li key={u.username}>
            <button type="button" className={styles.demoUser} onClick={() => onPick(u)}>
              {u.name}
            </button>
            <span className={styles.demoLogin}>
              {u.username} / {u.password}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
