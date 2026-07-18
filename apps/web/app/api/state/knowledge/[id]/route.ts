import { NextResponse } from "next/server";
import { z } from "zod";
import { updateKnowledgeEntry } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

const knowledgePatchSchema = z.object({
  title: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  retrievalSummary: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.number().int().nonnegative().optional(),
  status: z.enum(["Draft", "Published", "Archived"]).optional(),
  archived: z.boolean().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = knowledgePatchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const nextState = await updateKnowledgeEntry(id, parsed.data);
  const updatedEntry = nextState.knowledgeEntries.find((entry) => entry.id === id);

  return NextResponse.json({ ok: true, entry: updatedEntry });
}
