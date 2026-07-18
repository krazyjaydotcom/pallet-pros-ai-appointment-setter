import { describe, expect, it } from "vitest";
import { pickTopEntries } from "../src/knowledge";
import { sampleKnowledgeEntries } from "../src/fixtures/knowledge";

describe("pickTopEntries", () => {
  it("returns published entries", () => {
    const result = pickTopEntries(sampleKnowledgeEntries as never, {
      query: "training",
      limit: 3
    });

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("kb_training_url");
  });

  it("excludes draft entries", () => {
    const result = pickTopEntries(
      [
        ...sampleKnowledgeEntries,
        {
          ...(sampleKnowledgeEntries[0] as (typeof sampleKnowledgeEntries)[number]),
          id: "draft_entry",
          status: "Draft" as const,
          title: "Draft only",
          retrievalSummary: "Should not be returned."
        }
      ] as never,
      {
        query: "draft",
        limit: 10
      }
    );

    expect(result.some((entry) => entry.id === "draft_entry")).toBe(false);
  });

  it("excludes archived entries", () => {
    const result = pickTopEntries(
      [
        {
          ...(sampleKnowledgeEntries[0] as (typeof sampleKnowledgeEntries)[number]),
          id: "archived_entry",
          status: "Archived" as const
        }
      ] as never,
      {
        query: "archived",
        limit: 10
      }
    );

    expect(result).toHaveLength(0);
  });
});
