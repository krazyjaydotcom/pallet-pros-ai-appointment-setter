import { NextResponse } from "next/server";
import { z } from "zod";
import { upsertCommunicationProfile } from "@/src/lib/mock-store";

const profilePatchSchema = z.object({
  name: z.string().min(1).optional(),
  defaultTone: z.string().min(1).optional(),
  formalityLevel: z.string().min(1).optional(),
  preferredLength: z.string().min(1).optional(),
  maximumQuestions: z.number().int().nonnegative().optional(),
  emojiUsage: z.string().min(1).optional(),
  slangAllowance: z.string().min(1).optional(),
  appointmentAggressiveness: z.string().min(1).optional(),
  preferredPhrases: z.array(z.string()).optional(),
  prohibitedPhrases: z.array(z.string()).optional(),
  globalInstructions: z.string().min(1).optional(),
  status: z.enum(["Draft", "Published", "Archived"]).optional(),
  version: z.number().int().positive().optional(),
  publishedAt: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = profilePatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const nextState = await upsertCommunicationProfile({
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ?? undefined
  });

  return NextResponse.json({ ok: true, profile: nextState.communicationProfile });
}
