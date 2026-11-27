import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Schemas, unwrap } from "./client";
import { invalidateBanking } from "./payments";

export type StandingOrder = Schemas["StandingOrder"];
export type StandingOrderCreate = Schemas["StandingOrderCreate"];
export type StandingOrderUpdate = Schemas["StandingOrderUpdate"];

export function useStandingOrders() {
  return useQuery({
    queryKey: ["standing-orders"],
    queryFn: () => unwrap(api.GET("/standing-orders", { params: { query: { status: "active" } } })),
  });
}

export function useCreateStandingOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: StandingOrderCreate) => unwrap(api.POST("/standing-orders", { body })),
    onSuccess: () => invalidateBanking(queryClient),
  });
}

export function useUpdateStandingOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: StandingOrderUpdate }) =>
      unwrap(
        api.PATCH("/standing-orders/{standingOrderId}", { params: { path: { standingOrderId: v.id } }, body: v.body }),
      ),
    onSuccess: () => invalidateBanking(queryClient),
  });
}

export function useDeleteStandingOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      unwrap(api.DELETE("/standing-orders/{standingOrderId}", { params: { path: { standingOrderId: id } } })),
    onSuccess: () => invalidateBanking(queryClient),
  });
}
