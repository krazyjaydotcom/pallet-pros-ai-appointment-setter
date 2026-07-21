import Link from "next/link";
import { KnowledgeBaseEditor } from "@/components/knowledge-base-editor";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const state = await readUiState();
  const publishedCount = state.knowledgeEntries.filter((entry) => entry.status === "Published").length;
  const draftCount = state.knowledgeEntries.filter((entry) => entry.status === "Draft").length;

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Knowledge base</span>
            <h1>Keep the bot&apos;s knowledge editable and easy to review.</h1>
            <p>
              This screen is where the assistant learns the guardrails, offer details, and training links that shape every proposed reply without needing a redeploy.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/dashboard/setup">
                Open setup
              </Link>
              <Link className="button secondary" href="/dashboard/communication-profile">
                Tone profile
              </Link>
            </div>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Publish posture</p>
            <h3>Drafts stay staged until you publish them on purpose.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Entries</dt>
                <dd>{state.knowledgeEntries.length}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{publishedCount}</dd>
              </div>
              <div>
                <dt>Drafts</dt>
                <dd>{draftCount}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="grid three">
        <article className="card metric">
          <span className="muted">Entries</span>
          <strong>{state.knowledgeEntries.length}</strong>
        </article>
        <article className="card metric">
          <span className="muted">Published</span>
          <strong>{publishedCount}</strong>
        </article>
        <article className="card metric">
          <span className="muted">Drafts</span>
          <strong>{draftCount}</strong>
        </article>
      </section>

      <KnowledgeBaseEditor entries={state.knowledgeEntries} />
    </main>
  );
}
