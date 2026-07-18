import OpenAI from "openai";
import { z } from "zod";
import { DecisionResultSchema, type DecisionResult } from "./types";

export const OpenAIDecisionPromptSchema = z.object({
  model: z.string(),
  reasoningEffort: z.enum(["minimal", "low", "medium", "high", "xhigh", "max"]).default("low"),
  temperature: z.number().optional()
});

export type OpenAIDecisionPrompt = z.infer<typeof OpenAIDecisionPromptSchema>;

export type ModelContext = {
  recentMessages: Array<{ role: "user" | "assistant" | "system"; text: string }>;
  summary: string;
  qualificationFields: Record<string, unknown>;
  leadStage: string;
  knowledgeEntries: Array<{ id: string; title: string; summary: string }>;
  approvedExamples: Array<{ id: string; prospectMessage: string; approvedResponse: string }>;
  businessRules: string[];
};

export class OpenAIDecisionEngine {
  private readonly client: OpenAI;
  private readonly config: OpenAIDecisionPrompt;

  constructor(client: OpenAI, config: OpenAIDecisionPrompt) {
    this.client = client;
    this.config = OpenAIDecisionPromptSchema.parse(config);
  }

  async generate(context: ModelContext): Promise<DecisionResult> {
    const response = await this.client.responses.create({
      model: this.config.model,
      reasoning: { effort: this.config.reasoningEffort as never },
      input: [
        {
          role: "system",
          content:
            "You are an approval-first AI appointment setter for Pallet Pros Academy. Follow the provided business rules exactly."
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "pallet_pros_decision",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: [
              "action",
              "reply",
              "reason",
              "confidence",
              "lead_stage",
              "intent",
              "sentiment",
              "fields_to_update",
              "suggested_tags",
              "knowledge_entry_ids",
              "approved_example_ids",
              "requires_human_reason"
            ],
            properties: {
              action: { type: "string", enum: ["send", "approval_required", "ignore", "human_takeover", "expired_window"] },
              reply: { anyOf: [{ type: "string" }, { type: "null" }] },
              reason: { type: "string" },
              confidence: { type: "number", minimum: 0, maximum: 1 },
              lead_stage: { type: "string" },
              intent: {
                type: "string",
                enum: [
                  "sourcing_question",
                  "pricing_question",
                  "discount_request",
                  "refund_request",
                  "chargeback_request",
                  "earnings_guarantee_question",
                  "existing_student_complaint",
                  "hostile_message",
                  "human_takeover",
                  "other"
                ]
              },
              sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
              fields_to_update: {
                type: "object",
                additionalProperties: false,
                required: ["city", "state", "has_truck", "has_trailer", "watched_training", "appointment_interest"],
                properties: {
                  city: { anyOf: [{ type: "string" }, { type: "null" }] },
                  state: { anyOf: [{ type: "string" }, { type: "null" }] },
                  has_truck: { anyOf: [{ type: "boolean" }, { type: "null" }] },
                  has_trailer: { anyOf: [{ type: "boolean" }, { type: "null" }] },
                  watched_training: { anyOf: [{ type: "boolean" }, { type: "null" }] },
                  appointment_interest: { anyOf: [{ type: "boolean" }, { type: "null" }] }
                }
              },
              suggested_tags: { type: "array", items: { type: "string" } },
              knowledge_entry_ids: { type: "array", items: { type: "string" } },
              approved_example_ids: { type: "array", items: { type: "string" } },
              requires_human_reason: { anyOf: [{ type: "string" }, { type: "null" }] }
            }
          }
        }
      }
    });

    const text = response.output_text?.trim();
    if (!text) {
      throw new Error("OpenAI returned no structured text output");
    }

    const parsed = JSON.parse(text) as unknown;
    return DecisionResultSchema.parse(parsed);
  }
}

export function estimateTokenCost(tokens: { input: number; output: number; cachedInput?: number }, rates: { inputPerMillion: number; outputPerMillion: number; cachedInputPerMillion?: number }) {
  const cached = tokens.cachedInput ?? 0;
  return ((tokens.input - cached) / 1_000_000) * rates.inputPerMillion + (cached / 1_000_000) * (rates.cachedInputPerMillion ?? rates.inputPerMillion) + (tokens.output / 1_000_000) * rates.outputPerMillion;
}
