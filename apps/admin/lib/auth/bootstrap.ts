import { createAxiosInstance } from "../http/client";
import { refreshAccessToken } from "./refresh";
import { hasAccessToken } from "./session";

let bootstrapPromise: Promise<boolean> | null = null;

export function bootstrapAuthSession(): Promise<boolean> {
  if (hasAccessToken()) {
    return Promise.resolve(true);
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const token = await refreshAccessToken(createAxiosInstance());
      return Boolean(token);
    })().finally(() => {
      bootstrapPromise = null;
    });
  }

  return bootstrapPromise;
}
