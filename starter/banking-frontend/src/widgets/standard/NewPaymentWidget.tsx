import { useState } from "react";
import { useNavigate } from "react-router";
import { TextField } from "../../components/Field";
import { pagePath } from "../../routes";

/** "Search payment or enter IBAN": an IBAN opens the payment form prefilled, anything else is searched there. */
export function NewPaymentWidget() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const go = () => {
    const text = q.trim();
    if (!text) return navigate(pagePath("new-payment"));
    const isIban = /^[A-Za-z]{2}\d{2}[\s\dA-Za-z]{8,}$/.test(text);
    navigate(
      `${pagePath("new-payment")}?${new URLSearchParams(isIban ? { iban: text.replace(/\s/g, "") } : { name: text })}`,
    );
  };
  return (
    <form onSubmit={(e) => (e.preventDefault(), go())}>
      <TextField label="Search payment or enter IBAN" value={q} onChange={(e) => setQ(e.target.value)} />
    </form>
  );
}
