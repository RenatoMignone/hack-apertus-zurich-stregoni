import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { clearAuth, setAuth } from "../auth";
import { LOGIN_PATH } from "../routes";
import { api, unwrap, type Schemas } from "./client";

/** POST /auth/login. On success, drops all cached data (a previous customer's) and stores the new token. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: Schemas["LoginRequest"]) => unwrap(api.POST("/auth/login", { body: credentials })),
    onSuccess: (auth) => {
      queryClient.clear();
      setAuth(auth);
    },
  });
}

/** Forgets the token, leaves the app shell (unmounting the TrustRoom), then drops all cached data. */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    clearAuth();
    // Navigate first, so no mounted page refetches its cleared data without a token.
    await navigate(LOGIN_PATH);
    queryClient.clear();
  };
}
