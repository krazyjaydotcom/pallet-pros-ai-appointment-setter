import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "pallet-pros-web",
    mode: process.env.OPERATING_MODE ?? "APPROVAL_ONLY"
  });
}
