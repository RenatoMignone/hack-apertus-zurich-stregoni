import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";

export type Dashboard = Schemas["Dashboard"];
export type DashboardUpdate = Schemas["DashboardUpdate"];
export type CatalogEntry = Schemas["CatalogEntry"];

export function useDashboards() {
  return useQuery({ queryKey: ["dashboards"], queryFn: () => unwrap(api.GET("/dashboards")) });
}

export function useWidgetCatalog() {
  return useQuery({ queryKey: ["widget-catalog"], queryFn: () => unwrap(api.GET("/widget-catalog")) });
}

/** Mutations refresh the dashboards (and the catalog, which lists custom widgets). */
function useDashboardMutation<V, R>(mutationFn: (variables: V) => Promise<R>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboards"] }),
        queryClient.invalidateQueries({ queryKey: ["widget-catalog"] }),
      ]),
  });
}

export function useCreateDashboard() {
  return useDashboardMutation((name: string) => unwrap(api.POST("/dashboards", { body: { name } })));
}

export function useUpdateDashboard() {
  return useDashboardMutation(({ id, ...body }: DashboardUpdate & { id: string }) =>
    unwrap(api.PATCH("/dashboards/{dashboardId}", { params: { path: { dashboardId: id } }, body })),
  );
}

export function useDeleteDashboard() {
  return useDashboardMutation((id: string) =>
    unwrap(api.DELETE("/dashboards/{dashboardId}", { params: { path: { dashboardId: id } } })),
  );
}
