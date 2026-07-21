import Link from "next/link";
import { CommunicationProfileEditor } from "@/components/communication-profile-editor";
import { KnowledgeBaseEditor } from "@/components/knowledge-base-editor";
import { env } from "@/src/lib/env";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const state = await readUiState();
  const appBaseUrl = env.APP_BASE_URL?.trim() || "http://localhost:3000";
  const kommoOauthStartUrl = new URL("/api/kommo/oauth", appBaseUrl).toString();
  const kommoRedirectUrl = new URL("/api/kommo/oauth/callback", appBaseUrl).toString();
  const kommoWebhookUrl = new URL("/api/kommo/webhook", appBaseUrl).toString();

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

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Kommo connection</p>
            <h2>One obvious place to connect Kommo.</h2>
            <p className="muted">
              This button starts the Kommo authorization flow. Use the callback and webhook URLs below when you finish the Kommo side.
            </p>
          </div>
          <a className="button" href={kommoOauthStartUrl}>
            Connect Kommo
          </a>
        </div>

        <div className="grid two">
          <div className="callout">
            <span className="muted">OAuth start</span>
            <code style={{ display: "block", marginTop: 8, wordBreak: "break-all" }}>{kommoOauthStartUrl}</code>
          </div>
          <div className="callout">
            <span className="muted">OAuth callback</span>
            <code style={{ display: "block", marginTop: 8, wordBreak: "break-all" }}>{kommoRedirectUrl}</code>
          </div>
          <div className="callout" style={{ gridColumn: "1 / -1" }}>
            <span className="muted">Webhook intake</span>
            <code style={{ display: "block", marginTop: 8, wordBreak: "break-all" }}>{kommoWebhookUrl}</code>
          </div>
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
