import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";

export type Payment = Schemas["Payment"];
export type PaymentCreate = Schemas["PaymentCreate"];
export type PaymentUpdate = Schemas["PaymentUpdate"];

/** Everything a payment or standing order can change. */
export function invalidateBanking(queryClient: QueryClient) {
  for (const key of ["payments", "standing-orders", "upcoming-payments", "accounts", "bookings"]) {
    void queryClient.invalidateQueries({ queryKey: [key] });
  }
}

export function usePayments(status: "pending" | "completed") {
  return useQuery({
    queryKey: ["payments", status],
    queryFn: () => unwrap(api.GET("/payments", { params: { query: { status, limit: 200 } } })),
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PaymentCreate) => unwrap(api.POST("/payments", { body })),
    onSuccess: () => invalidateBanking(queryClient),
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; body: PaymentUpdate }) =>
      unwrap(api.PATCH("/payments/{paymentId}", { params: { path: { paymentId: v.id } }, body: v.body })),
    onSuccess: () => invalidateBanking(queryClient),
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.DELETE("/payments/{paymentId}", { params: { path: { paymentId: id } } })),
    onSuccess: () => invalidateBanking(queryClient),
  });
}
