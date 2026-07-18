import { z } from "zod";

export const OperatingModeSchema = z.enum([
  "LOG_ONLY",
  "APPROVAL_ONLY",
  "LIMITED_AUTO_SEND",
  "FULL_AUTO_SEND"
]);

export type OperatingMode = z.infer<typeof OperatingModeSchema>;

export const DecisionActionSchema = z.enum([
  "send",
  "approval_required",
  "ignore",
  "human_takeover",
  "expired_window"
]);

export type DecisionAction = z.infer<typeof DecisionActionSchema>;

export const IntentSchema = z.enum([
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
]);

export type Intent = z.infer<typeof IntentSchema>;

export const SentimentSchema = z.enum(["positive", "neutral", "negative"]);
export type Sentiment = z.infer<typeof SentimentSchema>;

export const LeadStageSchema = z.string().min(1);
export type LeadStage = z.infer<typeof LeadStageSchema>;

export const NullableBooleanSchema = z.union([z.boolean(), z.null()]);

export const DecisionResultSchema = z.object({
  action: DecisionActionSchema,
  reply: z.string().nullable(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  lead_stage: LeadStageSchema,
  intent: IntentSchema,
  sentiment: SentimentSchema,
  fields_to_update: z.object({
    city: z.string().nullable(),
    state: z.string().nullable(),
    has_truck: NullableBooleanSchema,
    has_trailer: NullableBooleanSchema,
    watched_training: NullableBooleanSchema,
    appointment_interest: NullableBooleanSchema
  }),
  suggested_tags: z.array(z.string()),
  knowledge_entry_ids: z.array(z.string()),
  approved_example_ids: z.array(z.string()),
  requires_human_reason: z.string().nullable()
});

export type DecisionResult = z.infer<typeof DecisionResultSchema>;

export const KnowledgeStatusSchema = z.enum(["Draft", "Published", "Archived"]);
export type KnowledgeStatus = z.infer<typeof KnowledgeStatusSchema>;

export const AppRoleSchema = z.enum(["administrator", "owner", "manager", "worker"]);
export type AppRole = z.infer<typeof AppRoleSchema>;

export const QualificationFieldsSchema = z.object({
  city: z.string().nullable(),
  state: z.string().nullable(),
  has_truck: NullableBooleanSchema,
  has_trailer: NullableBooleanSchema,
  watched_training: NullableBooleanSchema,
  appointment_interest: NullableBooleanSchema
});

export type QualificationFields = z.infer<typeof QualificationFieldsSchema>;
