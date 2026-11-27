import { describe, expect, it } from "vitest";
import { isAppPath, matchPage } from "./routes";

describe("routes", () => {
  it("matches static routes before params", () => {
    expect(matchPage("/payments/new")?.page.id).toBe("new-payment");
    expect(matchPage("/accounts/ACC-PRIV")).toEqual({
      page: expect.objectContaining({ id: "account-detail" }),
      params: { accountId: "ACC-PRIV" },
    });
    expect(matchPage("/loans/LOAN-02")).toEqual({
      page: expect.objectContaining({ id: "loan-detail" }),
      params: { loanId: "LOAN-02" },
    });
    expect(matchPage("/nope")).toBeNull();
  });

  it("accepts only relative e-banking paths for navigate", () => {
    expect(isAppPath("/movements?ids=BK-00601,BK-00667")).toBe(true);
    expect(isAppPath("/payments/new?iban=CH86&amount=500")).toBe(true);
    expect(isAppPath("https://evil.example/movements")).toBe(false);
    expect(isAppPath("//evil.example/movements")).toBe(false);
    expect(isAppPath("/\\evil.example")).toBe(false);
    expect(isAppPath("javascript:alert(1)")).toBe(false);
    expect(isAppPath("/unknown")).toBe(false);
    expect(isAppPath(42)).toBe(false);
  });
});
