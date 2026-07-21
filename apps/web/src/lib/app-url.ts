import { env } from "@/src/lib/env";

const DEFAULT_PUBLIC_APP_BASE_URL = "https://pallet-pros-dm-bot-c5fjg.ondigitalocean.app";

type HeaderReader = {
  get(name: string): string | null;
};

function getOrigin(input: string) {
  try {
    return new URL(input).origin;
  } catch {
    return null;
  }
}

function isInternalDigitalOceanHost(host: string) {
  return host.includes(":8080") && !host.includes(".ondigitalocean.app");
}

export function resolveAppBaseUrl(headersList?: HeaderReader) {
  const configuredUrl = env.APP_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const configuredRedirectOrigin = env.KOMMO_REDIRECT_URI?.trim() ? getOrigin(env.KOMMO_REDIRECT_URI.trim()) : null;

  if (configuredRedirectOrigin) {
    return configuredRedirectOrigin;
  }

  const forwardedHost = headersList?.get("x-forwarded-host");
  const host = forwardedHost || headersList?.get("host");

  if (!host) {
    return DEFAULT_PUBLIC_APP_BASE_URL;
  }

  if (isInternalDigitalOceanHost(host)) {
    return DEFAULT_PUBLIC_APP_BASE_URL;
  }

  const forwardedProto = headersList?.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
