/**
 * Typed client for the banking API. Types are generated from banking-api-contract/openapi.yaml
 * (`npm run gen:api`), never written by hand.
 */
import createClient from "openapi-fetch";
import { getAuth, redirectToLogin } from "../auth";
import { config } from "../config";
import type { components, paths } from "./schema";

export type Schemas = components["schemas"];

export const api = createClient<paths>({ baseUrl: config.apiUrl });

/**
 * Every call carries the logged-in customer's token; the token selects whose data the API returns.
 * A 401 (outside the login itself) means the token is gone or invalid: back to the login page, with a
 * full page load so no cached data of the previous customer survives.
 */
api.use({
  onRequest({ request }) {
    const token = getAuth()?.token;
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    return request;
  },
  onResponse({ response, schemaPath }) {
    if (response.status === 401 && schemaPath !== "/auth/login") redirectToLogin(window.location);
  },
});

/** Error body of the API; `details` holds the per-field messages of a 422. */
export class ApiError extends Error {
  constructor(
    message: string,
    public details: { field?: string; message?: string }[] = [],
    public status = 0,
  ) {
    super(message);
  }
}

/** Returns the response body (undefined for 204), or throws an ApiError so queries and forms can show it. */
export async function unwrap<T>(request: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  const { data, error, response } = await request;
  if (error !== undefined || (data === undefined && response.status !== 204)) {
    const body = error as { message?: string; details?: { field?: string; message?: string }[] } | undefined;
    throw new ApiError(
      `${response.status} ${body?.message ?? response.statusText}`,
      body?.details ?? [],
      response.status,
    );
  }
  return data as T;
}

/** Error text for a form field: details are keyed like `body.amount`, so match on the last segment. */
export function fieldError(error: unknown, ...fields: string[]): string | undefined {
  if (!(error instanceof ApiError)) return undefined;
  return error.details.find((d) => fields.includes(d.field?.split(".").pop() ?? ""))?.message;
}
