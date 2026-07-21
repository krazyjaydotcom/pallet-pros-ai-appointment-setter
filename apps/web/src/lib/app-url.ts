import { env } from "@/src/lib/env";

type HeaderReader = {
  get(name: string): string | null;
};

export function resolveAppBaseUrl(headersList?: HeaderReader) {
  const configuredUrl = env.APP_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const forwardedHost = headersList?.get("x-forwarded-host");
  const host = forwardedHost || headersList?.get("host");

  if (!host) {
    return "http://localhost:3000";
  }

  const forwardedProto = headersList?.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
