import { afterEach, describe, expect, it, vi } from "vitest";

const LUKAS = { token: "test-token", customer_id: "CUST-001", first_name: "Lukas", last_name: "Meier" };

/** Fresh module per test, so the in-memory state starts unread. */
async function loadAuth() {
  vi.resetModules();
  return import("./auth");
}

function stubStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  });
  return data;
}

afterEach(() => vi.unstubAllGlobals());

describe("auth storage", () => {
  it("persists the login across a reload and forgets it on logout", async () => {
    const data = stubStorage();
    const first = await loadAuth();
    expect(first.getAuth()).toBeNull();
    first.setAuth(LUKAS);

    const reloaded = await loadAuth();
    expect(reloaded.getAuth()).toEqual(LUKAS);
    reloaded.clearAuth();
    expect(reloaded.getAuth()).toBeNull();
    expect(data.size).toBe(0);
  });

  it("works without storage (blocked or missing), for the current page load", async () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    });
    const auth = await loadAuth();
    expect(auth.getAuth()).toBeNull();
    auth.setAuth(LUKAS);
    expect(auth.getAuth()).toEqual(LUKAS);
    auth.clearAuth();
    expect(auth.getAuth()).toBeNull();
  });

  it("ignores garbage in storage", async () => {
    stubStorage({ "trustroom-banking-auth": "{not json" });
    expect((await loadAuth()).getAuth()).toBeNull();
    stubStorage({ "trustroom-banking-auth": JSON.stringify({ customer_id: "CUST-001" }) });
    expect((await loadAuth()).getAuth()).toBeNull();
  });
});

describe("login redirect", () => {
  it("keeps deep links through the login round trip", async () => {
    const { loginUrl, safeNext } = await loadAuth();
    for (const path of [
      "/movements?ids=BK-00601,BK-00667&from=2026-10-01",
      "/payments/new?iban=CH86 0900&name=Müller AG&amount=500",
    ]) {
      const url = new URL(loginUrl(path), "http://app.invalid");
      expect(url.pathname).toBe("/login");
      expect(safeNext(url.searchParams.get("next"))).toBe(path);
    }
  });

  it("accepts only relative app paths as next", async () => {
    const { safeNext } = await loadAuth();
    expect(safeNext(null)).toBe("/dashboard");
    expect(safeNext("")).toBe("/dashboard");
    expect(safeNext("https://evil.example/dashboard")).toBe("/dashboard");
    expect(safeNext("//evil.example/dashboard")).toBe("/dashboard");
    expect(safeNext("/\\evil.example")).toBe("/dashboard");
    expect(safeNext("javascript:alert(1)")).toBe("/dashboard");
    expect(safeNext("/login?next=/login")).toBe("/dashboard");
    expect(safeNext("/cards?card=CARD-02")).toBe("/cards?card=CARD-02");
  });

  it("on 401 clears the login and sends the customer to /login, coming back to the same page", async () => {
    stubStorage();
    const auth = await loadAuth();
    auth.setAuth(LUKAS);
    const assign = vi.fn();
    auth.redirectToLogin({ pathname: "/movements", search: "?q=Migros", assign });
    expect(auth.getAuth()).toBeNull();
    expect(assign).toHaveBeenCalledWith("/login?next=%2Fmovements%3Fq%3DMigros");
  });

  it("does not redirect again when already on the login page", async () => {
    const auth = await loadAuth();
    const assign = vi.fn();
    auth.redirectToLogin({ pathname: "/login", search: "?next=%2Fcards", assign });
    expect(assign).not.toHaveBeenCalled();
  });
});
