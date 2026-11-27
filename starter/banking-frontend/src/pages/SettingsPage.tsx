/** Settings. Only the "My profile" tab is built. */
import { useCustomer } from "../api/customer";
import { useResetDemoData } from "../api/system";
import { PageHeader } from "../components/PageHeader";
import { QueryState } from "../components/QueryState";
import { Tabs } from "../components/Tabs";
import { SettingsPageBody } from "./SettingsPageBody";

export function SettingsPage() {
  const customer = useCustomer();
  const reset = useResetDemoData();
  return (
    <>
      <PageHeader title="Settings" />
      <Tabs tabs={[{ value: "profile", label: "My profile" }]} value="profile" onChange={() => undefined} />
      <QueryState query={customer}>
        {(c) => <SettingsPageBody customer={c} onReset={() => reset.mutate()} resetting={reset.isPending} />}
      </QueryState>
    </>
  );
}
