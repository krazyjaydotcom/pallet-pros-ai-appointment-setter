import { z } from "zod";
import type { KnowledgeStatus } from "./types";

export const KnowledgeEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  content: z.string(),
  retrievalSummary: z.string(),
  tags: z.array(z.string()),
  priority: z.number().int().nonnegative(),
  status: z.enum(["Draft", "Published", "Archived"]),
  applicableLeadStages: z.array(z.string()),
  applicableProspectConditions: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  publishedAt: z.date().nullable(),
  version: z.number().int().positive(),
  author: z.string(),
  previousVersionIds: z.array(z.string()),
  archived: z.boolean()
});

export type KnowledgeEntry = z.infer<typeof KnowledgeEntrySchema>;

export type RetrievalInput = {
  query: string;
  category?: string | null;
  tags?: string[];
  leadStage?: string | null;
  prospectConditions?: string[];
  limit?: number;
};

export type RetrievalStrategy = {
  retrieve(input: RetrievalInput): Promise<KnowledgeEntry[]>;
};

export function scoreEntry(entry: KnowledgeEntry, input: RetrievalInput): number {
  if (entry.status !== "Published") return -1000;
  let score = entry.priority;
  const query = input.query.toLowerCase();
  const haystack = [
    entry.title,
    entry.category,
    entry.content,
    entry.retrievalSummary,
    ...entry.tags
  ].join(" ").toLowerCase();
  if (input.category && entry.category.toLowerCase() === input.category.toLowerCase()) score += 50;
  if (input.leadStage && entry.applicableLeadStages.some((stage) => stage.toLowerCase() === input.leadStage?.toLowerCase())) score += 15;
  for (const tag of input.tags ?? []) {
    if (entry.tags.some((entryTag) => entryTag.toLowerCase() === tag.toLowerCase())) score += 10;
  }
  for (const condition of input.prospectConditions ?? []) {
    if (entry.applicableProspectConditions.some((item) => item.toLowerCase() === condition.toLowerCase())) score += 8;
  }
  if (query) {
    for (const token of query.split(/\s+/).filter(Boolean)) {
      if (haystack.includes(token)) score += 3;
    }
  }
  return score;
}

export function pickTopEntries(entries: KnowledgeEntry[], input: RetrievalInput): KnowledgeEntry[] {
  const limit = input.limit ?? 5;
  return entries
    .slice()
    .sort((a, b) => scoreEntry(b, input) - scoreEntry(a, input))
    .filter((entry) => entry.status === "Published")
    .slice(0, limit);
}

export function isPublished(entry: { status: KnowledgeStatus }) {
  return entry.status === "Published";
}
