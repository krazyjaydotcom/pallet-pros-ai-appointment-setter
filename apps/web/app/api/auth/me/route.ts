import { NextResponse } from "next/server";
import { getSessionTokenFromCookies } from "@/src/lib/auth";

export async function GET() {
  const token = await getSessionTokenFromCookies();
  return NextResponse.json({
    ok: Boolean(token),
    authenticated: Boolean(token)
  });
}
