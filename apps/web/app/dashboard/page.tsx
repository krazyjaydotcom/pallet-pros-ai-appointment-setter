import Link from "next/link";
import { ConversationsTable } from "@/components/conversations-table";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Dashboard</span>
            <h1>Approval queue and conversation control.</h1>
            <p>
              Review AI proposals, edit replies, and keep automatic sending locked down with a cleaner, more familiar control surface.
            </p>
            <div className="hero-actions">
              <Link className="button secondary" href="/dashboard/knowledge-base">Knowledge base</Link>
              <Link className="button secondary" href="/dashboard/communication-profile">Communication profile</Link>
              <Link className="button" href="/dashboard/playground">Playground</Link>
            </div>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Queue health</p>
            <h3>Everything stays in review until approved.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Pending approvals</dt>
                <dd>{state.summary.pendingApprovals}</dd>
              </div>
              <div>
                <dt>Auto-send</dt>
                <dd className="status-off">{state.summary.autoSendEnabled ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>Latest event</dt>
                <dd>{state.summary.latestEvent}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="grid three">
        <article className="card metric">
          <span className="muted">Pending approvals</span>
          <strong>{state.summary.pendingApprovals}</strong>
        </article>
        <article className="card metric">
          <span className="muted">Auto-send enabled</span>
          <strong className="status-off">{state.summary.autoSendEnabled ? "Yes" : "No"}</strong>
        </article>
          <article className="card metric">
            <span className="muted">Latest event</span>
            <strong>{state.summary.latestEvent}</strong>
          </article>
        </section>

      <ConversationsTable conversations={state.conversations} />
    </main>
  );
}
