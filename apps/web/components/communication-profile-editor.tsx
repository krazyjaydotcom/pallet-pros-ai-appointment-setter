"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { UiCommunicationProfile } from "@/src/lib/mock-store";

export function CommunicationProfileEditor({ profile }: { profile: UiCommunicationProfile }) {
  const router = useRouter();
  const [draft, setDraft] = useState(profile);
  const [isPending, startTransition] = useTransition();

  async function saveProfile() {
    const response = await fetch("/api/state/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        maximumQuestions: Number(draft.maximumQuestions)
      })
    });

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <section className="split">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Profile settings</p>
            <h2>Control the voice in one place.</h2>
          </div>
          <span className="chip chip-cyan">Versioned</span>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Name</span>
            <input className="input" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <div className="field-grid two">
            <label className="field">
              <span>Default tone</span>
              <input className="input" value={draft.defaultTone} onChange={(event) => setDraft((current) => ({ ...current, defaultTone: event.target.value }))} />
            </label>
            <label className="field">
              <span>Formality level</span>
              <input className="input" value={draft.formalityLevel} onChange={(event) => setDraft((current) => ({ ...current, formalityLevel: event.target.value }))} />
            </label>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Preferred length</span>
              <input className="input" value={draft.preferredLength} onChange={(event) => setDraft((current) => ({ ...current, preferredLength: event.target.value }))} />
            </label>
            <label className="field">
              <span>Maximum questions</span>
              <input className="input" type="number" value={draft.maximumQuestions} onChange={(event) => setDraft((current) => ({ ...current, maximumQuestions: Number(event.target.value) }))} />
            </label>
          </div>
          <div className="field-grid two">
            <label className="field">
              <span>Emoji usage</span>
              <input className="input" value={draft.emojiUsage} onChange={(event) => setDraft((current) => ({ ...current, emojiUsage: event.target.value }))} />
            </label>
            <label className="field">
              <span>Slang allowance</span>
              <input className="input" value={draft.slangAllowance} onChange={(event) => setDraft((current) => ({ ...current, slangAllowance: event.target.value }))} />
            </label>
          </div>
          <label className="field">
            <span>Appointment aggressiveness</span>
            <input className="input" value={draft.appointmentAggressiveness} onChange={(event) => setDraft((current) => ({ ...current, appointmentAggressiveness: event.target.value }))} />
          </label>
        </div>
      </article>

      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Global instructions</p>
            <h2>How the assistant should speak.</h2>
          </div>
          <span className="status-pill warning">Draft</span>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Preferred phrases</span>
            <input
              className="input"
              value={draft.preferredPhrases.join(", ")}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  preferredPhrases: event.target.value.split(",").map((value) => value.trim()).filter(Boolean)
                }))
              }
            />
          </label>
          <label className="field">
            <span>Prohibited phrases</span>
            <input
              className="input"
              value={draft.prohibitedPhrases.join(", ")}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  prohibitedPhrases: event.target.value.split(",").map((value) => value.trim()).filter(Boolean)
                }))
              }
            />
          </label>
          <label className="field">
            <span>Global response instructions</span>
            <textarea className="textarea" value={draft.globalInstructions} onChange={(event) => setDraft((current) => ({ ...current, globalInstructions: event.target.value }))} />
            <small>Shorter replies keep the whole experience feeling human and easy to approve.</small>
          </label>
          <div className="field-grid two">
            <label className="field">
              <span>Status</span>
              <select className="select" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as UiCommunicationProfile["status"] }))}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </label>
            <label className="field">
              <span>Version</span>
              <input className="input" type="number" value={draft.version} onChange={(event) => setDraft((current) => ({ ...current, version: Number(event.target.value) }))} />
            </label>
          </div>
          <div className="form-actions">
            <button className="button" type="button" disabled={isPending} onClick={() => startTransition(() => saveProfile())}>
              {isPending ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
