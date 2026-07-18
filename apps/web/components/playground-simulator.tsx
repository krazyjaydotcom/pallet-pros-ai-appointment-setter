"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";

type SimulatorResult = {
  action: string;
  confidence: number;
  intent: string;
  reply: string;
  reason: string;
  requires_human_reason: string | null;
};

export function PlaygroundSimulator({
  initialMessage,
  initialLeadStage,
  initialOperatingMode,
  initialResult
}: {
  initialMessage: string;
  initialLeadStage: string;
  initialOperatingMode: "LOG_ONLY" | "APPROVAL_ONLY" | "LIMITED_AUTO_SEND" | "FULL_AUTO_SEND";
  initialResult: SimulatorResult;
}) {
  const [prospectMessage, setProspectMessage] = useState(initialMessage);
  const [leadStage, setLeadStage] = useState(initialLeadStage);
  const [operatingMode, setOperatingMode] = useState(initialOperatingMode);
  const [result, setResult] = useState<SimulatorResult>(initialResult);
  const [isPending, startTransition] = useTransition();

  const resultBadges = useMemo(
    () => [
      { label: `Action: ${result.action}`, tone: "chip-cyan" },
      { label: `Confidence: ${result.confidence.toFixed(2)}`, tone: "" },
      { label: `Intent: ${result.intent}`, tone: "chip-emerald" }
    ],
    [result]
  );

  async function onRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const response = await fetch("/api/playground/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospectMessage, leadStage, operatingMode })
      });

      if (!response.ok) return;
      const payload = (await response.json()) as { result: SimulatorResult };
      setResult(payload.result);
    });
  }

  return (
    <form className="split" onSubmit={onRun}>
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Simulation input</p>
            <h2>Compose the prospect context.</h2>
            <p className="muted">Use the same kind of inputs a real review card would show, but keep the flow local and dry-run only.</p>
          </div>
          <span className="status-pill warning">Draft only</span>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Prospect message</span>
            <textarea className="textarea" value={prospectMessage} onChange={(event) => setProspectMessage(event.target.value)} />
          </label>
          <div className="field-grid two">
            <label className="field">
              <span>Lead stage</span>
              <input className="input" value={leadStage} onChange={(event) => setLeadStage(event.target.value)} />
            </label>
            <label className="field">
              <span>Operating mode</span>
              <select className="select" value={operatingMode} onChange={(event) => setOperatingMode(event.target.value as typeof operatingMode)}>
                <option value="LOG_ONLY">LOG_ONLY</option>
                <option value="APPROVAL_ONLY">APPROVAL_ONLY</option>
                <option value="LIMITED_AUTO_SEND">LIMITED_AUTO_SEND</option>
                <option value="FULL_AUTO_SEND">FULL_AUTO_SEND</option>
              </select>
            </label>
          </div>
        </div>

        <div className="divider" />

        <div className="form-actions">
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Running..." : "Run simulation"}
          </button>
          <button className="button secondary" type="button" onClick={() => {
            setProspectMessage(initialMessage);
            setLeadStage(initialLeadStage);
            setOperatingMode(initialOperatingMode);
            setResult(initialResult);
          }}>
            Reset example
          </button>
        </div>
      </article>

      <article className="stack">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Expected output</p>
              <h2>Drafted response and decision.</h2>
            </div>
            <span className="status-pill success">Approval required</span>
          </div>

          <div className="reply-card">
            <div className="reply-meta">
              {resultBadges.map((badge) => (
                <span key={badge.label} className={`chip ${badge.tone}`.trim()}>
                  {badge.label}
                </span>
              ))}
            </div>
            <p className="reply-copy">{result.reason}</p>
            <div className="callout">
              <strong>Suggested reply</strong>
              <p className="muted" style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{result.reply}</p>
            </div>
            <p className="muted">{result.requires_human_reason ?? "No human reason provided."}</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Review notes</p>
              <h2>What the reviewer sees.</h2>
            </div>
          </div>

          <div className="checklist">
            <div className="check-item">
              <span className="check-bullet" />
              <div>
                <strong>Intent classification</strong>
                <p className="muted">Pricing question, qualification still open, no auto-send.</p>
              </div>
            </div>
            <div className="check-item">
              <span className="check-bullet" />
              <div>
                <strong>Policy check</strong>
                <p className="muted">Keep the reply conversational, short, and approval-first.</p>
              </div>
            </div>
          </div>
        </section>
      </article>
    </form>
  );
}
