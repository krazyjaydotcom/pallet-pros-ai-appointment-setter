import { NextResponse } from "next/server";
import { z } from "zod";
import { updatePlayground } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const simulateSchema = z.object({
  prospectMessage: z.string().min(1),
  leadStage: z.string().min(1),
  operatingMode: z.enum(["LOG_ONLY", "APPROVAL_ONLY", "LIMITED_AUTO_SEND", "FULL_AUTO_SEND"])
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = simulateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const nextState = await updatePlayground(parsed.data);
  return NextResponse.json({ ok: true, result: nextState.playground.result });
}
