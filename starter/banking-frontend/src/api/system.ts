import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "./client";

export function useSystemInfo() {
  return useQuery({
    queryKey: ["system-info"],
    queryFn: () => unwrap(api.GET("/system/info")),
    staleTime: Infinity,
  });
}

/** POST /admin/reset, then refetch everything. */
export function useResetDemoData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/admin/reset")),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
