import { NextResponse } from "next/server";
import {
  buildKommoOAuthStartUrl,
  createKommoOAuthStateCookieValue,
  serializeKommoOAuthStateCookie
} from "@/src/lib/kommo";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const state = createKommoOAuthStateCookieValue();
    const response = NextResponse.redirect(buildKommoOAuthStartUrl(state));
    response.headers.append("Set-Cookie", serializeKommoOAuthStateCookie(state));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ ok: false, error: "oauth_start_failed", message }, { status: 500 });
  }
}
