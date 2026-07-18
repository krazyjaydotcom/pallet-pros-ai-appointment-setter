import { PlaygroundSimulator } from "@/components/playground-simulator";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function PlaygroundPage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Testing playground</span>
            <h1>Simulate a prospect message without sending anything live.</h1>
            <p>
              This sandbox is tuned for a modern review flow: structured output inspection, knowledge-base retrieval, approval gating, and token/cost estimates all visible at a glance.
            </p>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Current posture</p>
            <h3>Nothing leaves the queue until someone approves it.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Confidence threshold</dt>
                <dd>{state.summary.confidenceThreshold.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Human review</dt>
                <dd>Required</dd>
              </div>
              <div>
                <dt>Live send</dt>
                <dd className="status-off">Off</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <PlaygroundSimulator
        initialMessage={state.playground.prospectMessage}
        initialLeadStage={state.playground.leadStage}
        initialOperatingMode={state.playground.operatingMode as "LOG_ONLY" | "APPROVAL_ONLY" | "LIMITED_AUTO_SEND" | "FULL_AUTO_SEND"}
        initialResult={state.playground.result}
      />
    </main>
  );
}
