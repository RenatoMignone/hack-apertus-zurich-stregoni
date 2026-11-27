import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "./client";

export function useAssetOverview() {
  return useQuery({ queryKey: ["asset-overview"], queryFn: () => unwrap(api.GET("/asset-overview")) });
}
