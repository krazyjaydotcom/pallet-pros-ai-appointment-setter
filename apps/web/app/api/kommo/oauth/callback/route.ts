import { NextResponse } from "next/server";
import { clearKommoOAuthStateCookie, exchangeKommoAuthorizationCode, saveKommoOAuthTokens } from "@/src/lib/kommo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function buildRedirectUrl(request: Request, status: string, detail?: string) {
  const url = new URL("/dashboard/communication-profile", request.url);
  url.searchParams.set("kommo", status);
  if (detail) {
    url.searchParams.set("detail", detail);
  }
  return url;
}

function readCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const entry of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = entry.split("=");
    if (rawName?.trim() === name) {
      return rawValueParts.join("=").trim() || null;
    }
  }
  return null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = readCookieValue(request, "ppaa_kommo_oauth_state");
  const response = new NextResponse(null, { status: 302 });
  response.headers.set("Set-Cookie", clearKommoOAuthStateCookie());

  if (error === "access_denied") {
    response.headers.set("Location", buildRedirectUrl(request, "denied", "access_denied").toString());
    return response;
  }

  if (!code) {
    response.headers.set("Location", buildRedirectUrl(request, "missing-code", "Authorization code missing").toString());
    return response;
  }

  if (expectedState && state !== expectedState) {
    response.headers.set("Location", buildRedirectUrl(request, "invalid-state", "State did not match").toString());
    return response;
  }

  try {
    const tokens = await exchangeKommoAuthorizationCode({ code, requestUrl: request.url });
    await saveKommoOAuthTokens(tokens);
    response.headers.set("Location", buildRedirectUrl(request, "connected").toString());
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    response.headers.set("Location", buildRedirectUrl(request, "error", message).toString());
    return response;
  }
}
