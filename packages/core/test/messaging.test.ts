import { describe, expect, it } from "vitest";
import {
  hasValidTimestamp,
  isDuplicateMessage,
  mergeBackToBackMessages,
  shouldIgnoreBotMessage,
  shouldIgnoreOutgoingBusinessMessage,
  shouldResetDebounce
} from "../src/messaging";

describe("messaging helpers", () => {
  it("ignores outgoing business messages", () => {
    expect(
      shouldIgnoreOutgoingBusinessMessage({
        externalMessageId: "m1",
        conversationId: "c1",
        direction: "outgoing",
        text: "hello",
        createdAt: new Date()
      })
    ).toBe(true);
  });

  it("ignores bot messages", () => {
    expect(
      shouldIgnoreBotMessage({
        externalMessageId: "m2",
        conversationId: "c1",
        direction: "incoming",
        text: "hello",
        createdAt: new Date(),
        actorType: "bot"
      })
    ).toBe(true);
  });

  it("detects missing timestamp", () => {
    expect(
      hasValidTimestamp({
        createdAt: null
      })
    ).toBe(false);
  });

  it("deduplicates external ids", () => {
    expect(isDuplicateMessage("dup", new Set(["dup"]))).toBe(true);
  });

  it("resets debounce for close back-to-back messages", () => {
    expect(shouldResetDebounce(new Date("2026-07-18T00:00:00Z"), new Date("2026-07-18T00:00:06Z"), 8)).toBe(true);
  });

  it("merges messages inside the debounce window", () => {
    const merged = mergeBackToBackMessages(
      [
        {
          externalMessageId: "a",
          conversationId: "c1",
          direction: "incoming",
          text: "First line",
          createdAt: "2026-07-18T00:00:00Z"
        },
        {
          externalMessageId: "b",
          conversationId: "c1",
          direction: "incoming",
          text: "Second line",
          createdAt: "2026-07-18T00:00:05Z"
        },
        {
          externalMessageId: "c",
          conversationId: "c1",
          direction: "incoming",
          text: "Later line",
          createdAt: "2026-07-18T00:00:20Z"
        }
      ],
      8
    );

    expect(merged).toHaveLength(2);
    expect(merged[0]?.text).toContain("Second line");
  });
});
