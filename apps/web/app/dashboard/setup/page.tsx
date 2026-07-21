import Link from "next/link";
import { CommunicationProfileEditor } from "@/components/communication-profile-editor";
import { KnowledgeBaseEditor } from "@/components/knowledge-base-editor";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Setup center</span>
            <h1>Put all the bot instructions in one place.</h1>
            <p>
              This screen is the easiest place to edit the voice, guardrails, and knowledge that shape replies before anything goes live.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/dashboard/communication-profile">Edit tone profile</Link>
              <Link className="button secondary" href="/dashboard/knowledge-base">Edit knowledge base</Link>
            </div>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Current setup</p>
            <h3>Review-first and approval-only by default.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Profile status</dt>
                <dd>{state.communicationProfile.status}</dd>
              </div>
              <div>
                <dt>Knowledge entries</dt>
                <dd>{state.knowledgeEntries.length}</dd>
              </div>
              <div>
                <dt>Auto-send</dt>
                <dd className="status-off">{state.summary.autoSendEnabled ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="grid two">
        <article className="card">
          <div className="section-header">
            <p className="eyebrow">What to edit first</p>
            <h2>Start with the tone profile, then tune the knowledge base.</h2>
          </div>
          <ul className="clean">
            <li>Voice, length, and question limits live in the communication profile.</li>
            <li>Offer wording, links, and guardrails live in the knowledge base.</li>
            <li>The playground helps you test a prompt without sending anything live.</li>
          </ul>
        </article>

        <article className="card">
          <div className="section-header">
            <p className="eyebrow">Live posture</p>
            <h2>Keep the app in review mode until you’re happy with the drafts.</h2>
          </div>
          <ul className="clean">
            <li>Auto-send stays off.</li>
            <li>Every response can still be reviewed manually.</li>
            <li>You can adjust the policy before testing with a real lead.</li>
          </ul>
        </article>
      </section>

      <CommunicationProfileEditor profile={state.communicationProfile} />
      <KnowledgeBaseEditor entries={state.knowledgeEntries} />
    </main>
  );
}
