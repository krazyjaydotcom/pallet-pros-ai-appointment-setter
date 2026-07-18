import { ConversationsTable } from "@/components/conversations-table";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Conversation view</span>
            <h1>Inspect the full context before approving any reply.</h1>
            <p>
              The queue view now pulls from the same local workspace file as the other pages, so approvals and notes can be changed and revisited without losing state.
            </p>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Queue summary</p>
            <h3>Three conversations are currently in the local review set.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Approved</dt>
                <dd>{state.conversations.filter((conversation) => conversation.status === "approved").length}</dd>
              </div>
              <div>
                <dt>Needs review</dt>
                <dd>{state.conversations.filter((conversation) => conversation.status === "needs review").length}</dd>
              </div>
              <div>
                <dt>Draft</dt>
                <dd>{state.conversations.filter((conversation) => conversation.status === "draft").length}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <ConversationsTable conversations={state.conversations} />
    </main>
  );
}
