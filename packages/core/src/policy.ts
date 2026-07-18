import { DecisionResultSchema, type DecisionResult, type OperatingMode } from "./types";

export type PolicyContext = {
  operatingMode: OperatingMode;
  confidenceThreshold: number;
  withinWindow: boolean;
  latestIncomingAt?: Date | null;
  newerIncomingExists?: boolean;
  prohibitedCategory?: boolean;
  lowConfidence?: boolean;
  humanReason?: string | null;
  autoSendAllowed?: boolean;
};

export function enforcePolicy(result: DecisionResult, context: PolicyContext): DecisionResult {
  const parsed = DecisionResultSchema.parse(result);

  if (!context.withinWindow) {
    return { ...parsed, action: "expired_window", reply: null, requires_human_reason: "Latest lead message is outside the allowed messaging window." };
  }

  if (context.prohibitedCategory) {
    return { ...parsed, action: "human_takeover", reply: null, requires_human_reason: context.humanReason ?? "Message requires human handling." };
  }

  if (context.lowConfidence || parsed.confidence < context.confidenceThreshold) {
    return { ...parsed, action: "approval_required", requires_human_reason: context.humanReason ?? "Confidence below auto-send threshold." };
  }

  if (context.operatingMode === "LOG_ONLY") {
    return { ...parsed, action: "ignore", reply: null, requires_human_reason: "LOG_ONLY mode is active." };
  }

  if (context.operatingMode === "APPROVAL_ONLY") {
    return { ...parsed, action: "approval_required", requires_human_reason: null };
  }

  if (context.operatingMode === "LIMITED_AUTO_SEND" && !context.autoSendAllowed) {
    return { ...parsed, action: "approval_required", requires_human_reason: "Message is not eligible for limited auto-send." };
  }

  if (context.newerIncomingExists) {
    return { ...parsed, action: "approval_required", reply: null, requires_human_reason: "A newer incoming message arrived before sending." };
  }

  if (parsed.action === "send") {
    return parsed;
  }

  return { ...parsed, action: "approval_required", requires_human_reason: parsed.requires_human_reason ?? null };
}

export function isEligibleForAutoSend(action: DecisionResult["action"]) {
  return action === "send";
}
