import { describe, expect, it } from "vitest";
import { enforcePolicy } from "../src/policy";
import type { DecisionResult } from "../src/types";

const baseDecision: DecisionResult = {
  action: "send",
  reply: "Sure, what city are you in?",
  reason: "Routine qualification question.",
  confidence: 0.96,
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
  suggested_tags: [] as string[],
  knowledge_entry_ids: [] as string[],
  approved_example_ids: [] as string[],
  requires_human_reason: null
};

describe("enforcePolicy", () => {
  it("expires when window is closed", () => {
    const result = enforcePolicy(baseDecision, {
      operatingMode: "APPROVAL_ONLY",
      confidenceThreshold: 0.9,
      withinWindow: false
    });
    expect(result.action).toBe("expired_window");
  });

  it("requires approval in approval mode", () => {
    const result = enforcePolicy(baseDecision, {
      operatingMode: "APPROVAL_ONLY",
      confidenceThreshold: 0.9,
      withinWindow: true
    });
    expect(result.action).toBe("approval_required");
  });

  it("blocks low confidence", () => {
    const result = enforcePolicy({ ...baseDecision, confidence: 0.1 }, {
      operatingMode: "LIMITED_AUTO_SEND",
      confidenceThreshold: 0.9,
      withinWindow: true,
      autoSendAllowed: true,
      lowConfidence: true
    });
    expect(result.action).toBe("approval_required");
  });
});
