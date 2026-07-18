import { NextResponse } from "next/server";
import { z } from "zod";
import { updateConversation } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

const conversationPatchSchema = z.object({
  status: z.enum(["approved", "needs review", "draft", "rejected"]).optional(),
  note: z.string().min(1).optional(),
  replyDraft: z.string().min(1).optional(),
  latestIncoming: z.string().min(1).optional(),
  stage: z.string().min(1).optional()
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const parsed = conversationPatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const nextState = await updateConversation(id, parsed.data);
  const conversation = nextState.conversations.find((item) => item.conversationId === id);

  return NextResponse.json({ ok: true, conversation });
}
