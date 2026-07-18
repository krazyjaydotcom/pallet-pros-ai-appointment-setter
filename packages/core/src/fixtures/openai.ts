export const mockOpenAIDecision = {
  action: "approval_required",
  reply: "What city and state are you in?",
  reason: "Routine qualification question.",
  confidence: 0.91,
  lead_stage: "qualifying",
  intent: "sourcing_question",
  sentiment: "neutral",
  fields_to_update: {
    city: null,
    state: null,
    has_truck: null,
    has_trailer: null,
    watched_training: null,
    appointment_interest: null
  },
  suggested_tags: ["qualifying"],
  knowledge_entry_ids: ["kb_training_url"],
  approved_example_ids: ["ex_qualified_city_state"],
  requires_human_reason: null
} as const;
