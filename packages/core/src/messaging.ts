export type IncomingMessage = {
  externalMessageId: string;
  conversationId: string;
  direction: "incoming" | "outgoing";
  text: string;
  createdAt: string | Date | null | undefined;
  actorType?: "human" | "bot" | "business" | "system";
};

export function hasValidTimestamp(message: Pick<IncomingMessage, "createdAt">) {
  if (!message.createdAt) return false;
  const date = message.createdAt instanceof Date ? message.createdAt : new Date(message.createdAt);
  return !Number.isNaN(date.getTime());
}

export function shouldIgnoreOutgoingBusinessMessage(message: IncomingMessage) {
  return message.direction === "outgoing" || message.actorType === "business";
}

export function shouldIgnoreBotMessage(message: IncomingMessage) {
  return message.actorType === "bot" || message.actorType === "system";
}

export function shouldResetDebounce(previousAt: Date | null, currentAt: Date, thresholdSeconds: number) {
  if (!previousAt) return true;
  return currentAt.getTime() - previousAt.getTime() <= thresholdSeconds * 1000;
}

export function mergeBackToBackMessages(messages: IncomingMessage[], thresholdSeconds: number) {
  const sorted = messages
    .slice()
    .filter((message) => !shouldIgnoreOutgoingBusinessMessage(message) && !shouldIgnoreBotMessage(message) && hasValidTimestamp(message))
    .sort((a, b) => new Date(a.createdAt as string | Date).getTime() - new Date(b.createdAt as string | Date).getTime());

  const merged: Array<{ externalMessageIds: string[]; conversationId: string; text: string; latestAt: Date }> = [];

  for (const message of sorted) {
    const currentAt = new Date(message.createdAt as string | Date);
    const last = merged[merged.length - 1];
    if (!last || last.conversationId !== message.conversationId || currentAt.getTime() - last.latestAt.getTime() > thresholdSeconds * 1000) {
      merged.push({
        externalMessageIds: [message.externalMessageId],
        conversationId: message.conversationId,
        text: message.text,
        latestAt: currentAt
      });
      continue;
    }

    last.externalMessageIds.push(message.externalMessageId);
    last.text = `${last.text}\n${message.text}`.trim();
    last.latestAt = currentAt;
  }

  return merged;
}

export function isDuplicateMessage(externalMessageId: string, seenExternalMessageIds: Set<string>) {
  return seenExternalMessageIds.has(externalMessageId);
}

export function shouldTakeHumanTakeover(input: {
  intent: string;
  confidence: number;
  operatingMode: "LOG_ONLY" | "APPROVAL_ONLY" | "LIMITED_AUTO_SEND" | "FULL_AUTO_SEND";
}) {
  return input.intent === "human_takeover" || input.confidence < 0.9 || input.operatingMode === "LOG_ONLY";
}
