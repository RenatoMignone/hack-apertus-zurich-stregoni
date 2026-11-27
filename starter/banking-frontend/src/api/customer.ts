import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap, type Schemas } from "./client";

export function useCustomer() {
  return useQuery({ queryKey: ["customer"], queryFn: () => unwrap(api.GET("/customer")) });
}

/** PATCH /customer, then refetch the profile (also shown in the greeting). */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: Schemas["CustomerUpdate"]) => unwrap(api.PATCH("/customer", { body: update })),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customer"] }),
  });
}
