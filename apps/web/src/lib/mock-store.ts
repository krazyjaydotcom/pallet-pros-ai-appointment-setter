import "server-only";

import path from "path";
import { sampleKnowledgeEntries } from "@pallet-pros/core/fixtures/knowledge";
import { sampleApprovedExamples } from "@pallet-pros/core/fixtures/examples";
import { mockOpenAIDecision } from "@pallet-pros/core/fixtures/openai";
import { ensureRuntimeSchema } from "./db-bootstrap";
import { getPrismaClient } from "./prisma-client";
import { readJsonState, writeJsonState } from "./state-path";

type UiKnowledgeStatus = "Draft" | "Published" | "Archived";
type UiConversationStatus = "approved" | "needs review" | "draft" | "rejected";

export type UiKnowledgeEntry = {
  id: string;
  title: string;
  category: string;
  content: string;
  retrievalSummary: string;
  tags: string[];
  priority: number;
  status: UiKnowledgeStatus;
  applicableLeadStages: string[];
  applicableProspectConditions: string[];
  author: string;
  archived: boolean;
  version: number;
  updatedAt: string;
  publishedAt: string | null;
};

export type UiCommunicationProfile = {
  name: string;
  defaultTone: string;
  formalityLevel: string;
  preferredLength: string;
  maximumQuestions: number;
  emojiUsage: string;
  slangAllowance: string;
  appointmentAggressiveness: string;
  preferredPhrases: string[];
  prohibitedPhrases: string[];
  globalInstructions: string;
  status: UiKnowledgeStatus;
  version: number;
  updatedAt: string;
  publishedAt: string | null;
};

export type UiConversation = {
  id: string;
  lead: string;
  leadId: string;
  contactId: string;
  conversationId: string;
  channel: string;
  latestIncoming: string;
  confidence: string;
  status: UiConversationStatus;
  stage: string;
  note: string;
  replyDraft: string;
  action: string;
  updatedAt: string;
  lastIncomingAt: string;
};

export type UiState = {
  summary: {
    pendingApprovals: number;
    autoSendEnabled: boolean;
    latestEvent: string;
    operatingMode: string;
    defaultModel: string;
    debounceSeconds: number;
    messageWindowHours: number;
    confidenceThreshold: number;
    lastSyncedAt: string;
  };
  conversations: UiConversation[];
  knowledgeEntries: UiKnowledgeEntry[];
  communicationProfile: UiCommunicationProfile;
  playground: {
    prospectMessage: string;
    leadStage: string;
    operatingMode: string;
    result: {
      action: string;
      confidence: number;
      intent: string;
      reply: string;
      reason: string;
      requires_human_reason: string | null;
    };
  };
  approvedExamples: typeof sampleApprovedExamples;
};

type PersistedUiState = UiState;

const UI_STATE_KEY = "ui-state-v1";
const UI_STATE_FILE = "ui-state.json";

const DEFAULT_STATE: PersistedUiState = {
  summary: {
    pendingApprovals: 12,
    autoSendEnabled: false,
    latestEvent: "2m ago",
    operatingMode: "APPROVAL_FIRST",
    defaultModel: "gpt-5.4-mini",
    debounceSeconds: 8,
    messageWindowHours: 24,
    confidenceThreshold: 0.9,
    lastSyncedAt: new Date().toISOString()
  },
  conversations: [
    {
      id: "conv-001",
      lead: "Miami Private Chef",
      leadId: "49634894",
      contactId: "8831221",
      conversationId: "conv-001",
      channel: "Instagram",
      latestIncoming: "Already done. I got an email confirmation",
      confidence: "0.97",
      status: "approved",
      stage: "booking",
      note: "Talk Monday at 10am.",
      replyDraft: "Great, you’re all set. I’ll keep the Monday slot on my radar.",
      action: "send",
      updatedAt: new Date("2026-07-18T14:00:00Z").toISOString(),
      lastIncomingAt: new Date("2026-07-18T13:58:00Z").toISOString()
    },
    {
      id: "conv-002",
      lead: "The Family Biz",
      leadId: "49807528",
      contactId: "8831222",
      conversationId: "conv-002",
      channel: "Instagram",
      latestIncoming: "No I’m booked up",
      confidence: "0.73",
      status: "needs review",
      stage: "qualifying",
      note: "Weekday follow-up pending.",
      replyDraft: "No worries — which weekday usually works best for you?",
      action: "approval_required",
      updatedAt: new Date("2026-07-18T13:55:00Z").toISOString(),
      lastIncomingAt: new Date("2026-07-18T13:54:00Z").toISOString()
    },
    {
      id: "conv-003",
      lead: "Chad Smith",
      leadId: "49807529",
      contactId: "8831223",
      conversationId: "conv-003",
      channel: "Instagram",
      latestIncoming: "I saw the training link. Not sure if I watched it yet.",
      confidence: "0.84",
      status: "draft",
      stage: "qualifying",
      note: "Already received the training link once.",
      replyDraft: "Did you get a chance to watch it yet?",
      action: "approval_required",
      updatedAt: new Date("2026-07-18T13:50:00Z").toISOString(),
      lastIncomingAt: new Date("2026-07-18T13:50:00Z").toISOString()
    }
  ],
  knowledgeEntries: sampleKnowledgeEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    content: entry.content,
    retrievalSummary: entry.retrievalSummary,
    tags: entry.tags,
    priority: entry.priority,
    status: entry.status as UiKnowledgeStatus,
    applicableLeadStages: entry.applicableLeadStages,
    applicableProspectConditions: entry.applicableProspectConditions,
    author: entry.author,
    archived: entry.archived,
    version: entry.version,
    updatedAt: entry.updatedAt.toISOString(),
    publishedAt: entry.publishedAt ? entry.publishedAt.toISOString() : null
  })),
  communicationProfile: {
    name: "Default approval-first profile",
    defaultTone: "Friendly, natural, confident",
    formalityLevel: "conversational",
    preferredLength: "short",
    maximumQuestions: 1,
    emojiUsage: "minimal",
    slangAllowance: "light",
    appointmentAggressiveness: "moderate",
    preferredPhrases: ["happy to help", "which weekday works", "I’ll be by my phone"],
    prohibitedPhrases: ["guaranteed income", "earn $X per day", "pushy close"],
    globalInstructions: "Keep responses short, conversational, and approval-first.",
    status: "Draft",
    version: 1,
    updatedAt: new Date().toISOString(),
    publishedAt: null
  },
  playground: {
    prospectMessage: "How much do I need to start?",
    leadStage: "qualifying",
    operatingMode: "APPROVAL_ONLY",
    result: {
      action: mockOpenAIDecision.action,
      confidence: mockOpenAIDecision.confidence,
      intent: mockOpenAIDecision.intent,
      reply: mockOpenAIDecision.reply ?? "",
      reason: mockOpenAIDecision.reason,
      requires_human_reason: mockOpenAIDecision.requires_human_reason
    }
  },
  approvedExamples: sampleApprovedExamples
};

const UI_STATE_LEGACY_PATHS = [
  path.resolve(process.cwd(), "../../work/ui-state.json"),
  path.resolve(process.cwd(), "../work/ui-state.json"),
  path.resolve(process.cwd(), "work/ui-state.json")
];

function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

async function readStateFromDatabase(): Promise<PersistedUiState | null> {
  try {
    await ensureRuntimeSchema();
    const prisma = await getPrismaClient();
    const setting = await prisma.appSetting.findUnique({ where: { key: UI_STATE_KEY } });

    if (!setting?.value) {
      return null;
    }

    return setting.value as PersistedUiState;
  } catch {
    return null;
  }
}

async function writeStateToDatabase(nextState: PersistedUiState) {
  try {
    await ensureRuntimeSchema();
    const prisma = await getPrismaClient();
    await prisma.appSetting.upsert({
      where: { key: UI_STATE_KEY },
      create: {
        key: UI_STATE_KEY,
        value: nextState
      },
      update: {
        value: nextState
      }
    });
    return true;
  } catch {
    return false;
  }
}

export async function readUiState(): Promise<PersistedUiState> {
  if (shouldUseDatabase()) {
    const dbState = await readStateFromDatabase();
    if (dbState) {
      return dbState;
    }
  }

  return readJsonState({
    fileName: UI_STATE_FILE,
    defaultState: DEFAULT_STATE,
    legacyFilePaths: UI_STATE_LEGACY_PATHS
  });
}

export async function writeUiState(nextState: PersistedUiState) {
  if (shouldUseDatabase()) {
    const saved = await writeStateToDatabase(nextState);
    if (saved) {
      return nextState;
    }
  }

  return writeJsonState({
    fileName: UI_STATE_FILE,
    state: nextState
  });
}

export async function updateKnowledgeEntry(entryId: string, patch: Partial<UiKnowledgeEntry>) {
  const state = await readUiState();
  const nextKnowledgeEntries = state.knowledgeEntries.map((entry) => {
    if (entry.id !== entryId) return entry;
    return {
      ...entry,
      ...patch,
      updatedAt: new Date().toISOString()
    };
  });

  return writeUiState({
    ...state,
    knowledgeEntries: nextKnowledgeEntries,
    summary: { ...state.summary, lastSyncedAt: new Date().toISOString() }
  });
}

export async function upsertCommunicationProfile(patch: Partial<UiCommunicationProfile>) {
  const state = await readUiState();
  return writeUiState({
    ...state,
    communicationProfile: {
      ...state.communicationProfile,
      ...patch,
      updatedAt: new Date().toISOString()
    },
    summary: { ...state.summary, lastSyncedAt: new Date().toISOString() }
  });
}

export async function updateConversation(conversationId: string, patch: Partial<UiConversation>) {
  const state = await readUiState();
  return writeUiState({
    ...state,
    conversations: state.conversations.map((conversation) =>
      conversation.conversationId === conversationId
        ? { ...conversation, ...patch, updatedAt: new Date().toISOString() }
        : conversation
    ),
    summary: {
      ...state.summary,
      pendingApprovals: Math.max(
        0,
        state.conversations.filter((conversation) => conversation.status !== "approved").length -
          (patch.status === "approved" ? 1 : 0)
      ),
      lastSyncedAt: new Date().toISOString()
    }
  });
}

export async function upsertConversation(nextConversation: UiConversation) {
  const state = await readUiState();
  const exists = state.conversations.some((conversation) => conversation.conversationId === nextConversation.conversationId);
  const conversations = exists
    ? state.conversations.map((conversation) =>
        conversation.conversationId === nextConversation.conversationId
          ? { ...conversation, ...nextConversation, updatedAt: new Date().toISOString() }
          : conversation
      )
    : [nextConversation, ...state.conversations];

  return writeUiState({
    ...state,
    conversations,
    summary: {
      ...state.summary,
      pendingApprovals: conversations.filter((conversation) => conversation.status !== "approved").length,
      lastSyncedAt: new Date().toISOString()
    }
  });
}

export async function updatePlayground(input: { prospectMessage: string; leadStage: string; operatingMode: string }) {
  const state = await readUiState();
  const normalizedReply =
    input.prospectMessage.toLowerCase().includes("how much") ||
    input.prospectMessage.toLowerCase().includes("start")
      ? "What city and state are you in?"
      : "Happy to help — what’s your current setup looking like, and how soon are you hoping to get moving?";

  return writeUiState({
    ...state,
    playground: {
      prospectMessage: input.prospectMessage,
      leadStage: input.leadStage,
      operatingMode: input.operatingMode,
      result: {
        action: "approval_required",
        confidence: input.operatingMode === "LOG_ONLY" ? 0.84 : 0.91,
        intent: input.prospectMessage.toLowerCase().includes("how much") ? "pricing_question" : "other",
        reply: normalizedReply,
        reason: "Local simulation derived from the current approval-first policy and sample rules.",
        requires_human_reason:
          input.operatingMode === "LOG_ONLY"
            ? "LOG_ONLY is active."
            : "Confidence is below the auto-send threshold or approval is still required."
      }
    },
    summary: { ...state.summary, lastSyncedAt: new Date().toISOString() }
  });
}
