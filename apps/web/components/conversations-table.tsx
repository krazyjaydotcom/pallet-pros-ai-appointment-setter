"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UiConversation } from "@/src/lib/mock-store";

export function ConversationsTable({ conversations }: { conversations: UiConversation[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState(conversations);
  const [isPending, startTransition] = useTransition();

  function updateDraft(conversationId: string, patch: Partial<UiConversation>) {
    setDrafts((current) => current.map((conversation) => (conversation.conversationId === conversationId ? { ...conversation, ...patch } : conversation)));
  }

  async function saveConversation(conversation: UiConversation) {
    const response = await fetch(`/api/state/conversations/${conversation.conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: conversation.status,
        note: conversation.note,
        replyDraft: conversation.replyDraft,
        latestIncoming: conversation.latestIncoming,
        stage: conversation.stage
      })
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Recent conversations</p>
          <h2>High-signal queue, not a wall of noise.</h2>
          <p className="muted">Each row can be edited, approved, or marked for another pass.</p>
        </div>
        <span className="chip">Rows: {conversations.length}</span>
      </div>

      <div className="stack">
        {drafts.map((conversation) => (
          <article key={conversation.conversationId} className="card compact">
            <div className="panel-header">
              <div>
                <span className="pill">{conversation.lead}</span>
                <h3 style={{ marginTop: 12 }}>{conversation.latestIncoming}</h3>
              </div>
              <span className={`status-pill ${conversation.status === "approved" ? "success" : conversation.status === "needs review" ? "warning" : ""}`.trim()}>
                {conversation.status}
              </span>
            </div>

            <div className="grid three" style={{ marginBottom: 18 }}>
              <div className="callout">
                <span className="muted">Lead ID</span>
                <strong style={{ display: "block", marginTop: 6 }}>{conversation.leadId}</strong>
              </div>
              <div className="callout">
                <span className="muted">Confidence</span>
                <strong style={{ display: "block", marginTop: 6 }}>{conversation.confidence}</strong>
              </div>
              <div className="callout">
                <span className="muted">Channel</span>
                <strong style={{ display: "block", marginTop: 6 }}>{conversation.channel}</strong>
              </div>
            </div>

            <div className="field-grid two">
              <label className="field">
                <span>Stage</span>
                <input className="input" value={conversation.stage} onChange={(event) => updateDraft(conversation.conversationId, { stage: event.target.value })} />
              </label>
              <label className="field">
                <span>Status</span>
                <select
                  className="select"
                  value={conversation.status}
                  onChange={(event) => updateDraft(conversation.conversationId, { status: event.target.value as UiConversation["status"] })}
                >
                  <option value="approved">approved</option>
                  <option value="needs review">needs review</option>
                  <option value="draft">draft</option>
                  <option value="rejected">rejected</option>
                </select>
              </label>
            </div>

            <label className="field" style={{ marginTop: 14 }}>
              <span>Reviewer note</span>
              <textarea className="textarea" value={conversation.note} onChange={(event) => updateDraft(conversation.conversationId, { note: event.target.value })} />
            </label>
            <label className="field">
              <span>Reply draft</span>
              <textarea className="textarea" value={conversation.replyDraft} onChange={(event) => updateDraft(conversation.conversationId, { replyDraft: event.target.value })} />
            </label>

            <div className="form-actions">
              <button className="button" type="button" disabled={isPending} onClick={() => startTransition(() => saveConversation(conversation))}>
                {isPending ? "Saving..." : "Save conversation"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
