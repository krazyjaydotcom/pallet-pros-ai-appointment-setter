import { KnowledgeBaseEditor } from "@/components/knowledge-base-editor";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Knowledge base</span>
            <h1>Edit the business knowledge without redeploying.</h1>
            <p>
              This surface is where the assistant learns the guardrails, offer details, and training links that shape every proposed reply.
            </p>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Publish posture</p>
            <h3>Drafts can be staged before they become live policy.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Entries</dt>
                <dd>{state.knowledgeEntries.length}</dd>
              </div>
              <div>
                <dt>Published</dt>
                <dd>{state.knowledgeEntries.filter((entry) => entry.status === "Published").length}</dd>
              </div>
              <div>
                <dt>Draft</dt>
                <dd>{state.knowledgeEntries.filter((entry) => entry.status === "Draft").length}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <KnowledgeBaseEditor entries={state.knowledgeEntries} />
    </main>
  );
}
