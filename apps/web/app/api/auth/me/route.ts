import { NextResponse } from "next/server";
import { getSessionTokenFromCookies } from "@/src/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const token = await getSessionTokenFromCookies();
  return NextResponse.json({
    ok: Boolean(token),
    authenticated: Boolean(token)
  });
}
