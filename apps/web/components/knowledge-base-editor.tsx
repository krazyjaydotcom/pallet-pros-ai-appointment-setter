"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UiKnowledgeEntry } from "@/src/lib/mock-store";

type EntryDraft = UiKnowledgeEntry & { tagsText: string; stagesText: string; conditionsText: string };

function toDraft(entry: UiKnowledgeEntry): EntryDraft {
  return {
    ...entry,
    tagsText: entry.tags.join(", "),
    stagesText: entry.applicableLeadStages.join(", "),
    conditionsText: entry.applicableProspectConditions.join(", ")
  };
}

export function KnowledgeBaseEditor({ entries }: { entries: UiKnowledgeEntry[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<EntryDraft[]>(entries.map(toDraft));
  const [isPending, startTransition] = useTransition();

  const publishedCount = useMemo(() => drafts.filter((entry) => entry.status === "Published").length, [drafts]);

  function updateDraft(index: number, patch: Partial<EntryDraft>) {
    setDrafts((current) => current.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...patch } : entry)));
  }

  async function saveEntry(entry: EntryDraft) {
    const response = await fetch(`/api/state/knowledge/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: entry.title,
        category: entry.category,
        content: entry.content,
        retrievalSummary: entry.retrievalSummary,
        tags: entry.tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
        priority: Number(entry.priority),
        status: entry.status,
        archived: entry.archived,
        applicableLeadStages: entry.stagesText.split(",").map((value) => value.trim()).filter(Boolean),
        applicableProspectConditions: entry.conditionsText.split(",").map((value) => value.trim()).filter(Boolean)
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
          <p className="eyebrow">Policy set</p>
          <h2>Knowledge entries and their publish state.</h2>
          <p className="muted">A small, editable library keeps the reply logic easy to tune without a redeploy.</p>
        </div>
        <span className="chip">Published {publishedCount}/{drafts.length}</span>
      </div>

      <div className="stack">
        {drafts.map((entry, index) => (
          <article key={entry.id} className="card compact">
            <div className="panel-header">
              <div>
                <span className="pill">{entry.id}</span>
                <h3 style={{ marginTop: 12 }}>{entry.title}</h3>
                <p className="muted" style={{ marginTop: 8 }}>
                  {entry.category} · Priority {entry.priority} · {entry.tags.length} tags
                </p>
              </div>
              <div className="hero-actions">
                <span
                  className={`status-pill ${entry.status === "Published" ? "success" : entry.status === "Draft" ? "warning" : ""}`.trim()}
                >
                  {entry.status}
                </span>
                <span className="chip">#{index + 1}</span>
              </div>
            </div>

            <div className="grid two">
              <div className="field-grid">
                <label className="field">
                  <span>Title</span>
                  <input className="input" value={entry.title} onChange={(event) => updateDraft(index, { title: event.target.value })} />
                </label>
                <label className="field">
                  <span>Category</span>
                  <input className="input" value={entry.category} onChange={(event) => updateDraft(index, { category: event.target.value })} />
                </label>
                <label className="field">
                  <span>Content</span>
                  <textarea className="textarea" value={entry.content} onChange={(event) => updateDraft(index, { content: event.target.value })} />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Retrieval summary</span>
                  <textarea className="textarea" value={entry.retrievalSummary} onChange={(event) => updateDraft(index, { retrievalSummary: event.target.value })} />
                </label>
                <label className="field">
                  <span>Tags</span>
                  <input className="input" value={entry.tagsText} onChange={(event) => updateDraft(index, { tagsText: event.target.value })} />
                </label>
                <label className="field">
                  <span>Lead stages</span>
                  <input className="input" value={entry.stagesText} onChange={(event) => updateDraft(index, { stagesText: event.target.value })} />
                </label>
                <label className="field">
                  <span>Prospect conditions</span>
                  <input className="input" value={entry.conditionsText} onChange={(event) => updateDraft(index, { conditionsText: event.target.value })} />
                </label>
                <div className="field-grid two">
                  <label className="field">
                    <span>Priority</span>
                    <input
                      className="input"
                      type="number"
                      value={entry.priority}
                      onChange={(event) => updateDraft(index, { priority: Number(event.target.value) })}
                    />
                  </label>
                  <label className="field">
                    <span>Status</span>
                    <select className="select" value={entry.status} onChange={(event) => updateDraft(index, { status: event.target.value as UiKnowledgeEntry["status"] })}>
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button className="button" type="button" disabled={isPending} onClick={() => startTransition(() => saveEntry(entry))}>
                {isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
