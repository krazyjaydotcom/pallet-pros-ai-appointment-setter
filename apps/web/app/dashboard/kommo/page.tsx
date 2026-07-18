import Link from "next/link";
import { randomUUID } from "crypto";
import { buildKommoAuthUrl } from "@/src/lib/kommo-store";

export const dynamic = "force-dynamic";

const webhookUrl = "/api/kommo/webhook";
const callbackPath = "/api/kommo/oauth/callback";

export default function KommoSetupPage() {
  const state = randomUUID();

  let authUrl: string | null = null;
  let authError: string | null = null;

  try {
    authUrl = buildKommoAuthUrl(state);
  } catch (error) {
    authError = error instanceof Error ? error.message : "Unable to build Kommo auth URL.";
  }

  return (
    <main className="page-stack">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Kommo setup</span>
            <h1>Connect the live Kommo account, then keep everything approval-first.</h1>
            <p>
              We already wired the callback and webhook intake in the app. This page gives you the exact links to finish the
              one-time Kommo authorization and point Kommo at the local webhook endpoint.
            </p>
            <div className="hero-actions">
              <Link className="button secondary" href="/dashboard">Back to dashboard</Link>
              {authUrl ? (
                <a className="button" href={authUrl} target="_blank" rel="noreferrer">
                  Open Kommo auth
                </a>
              ) : null}
            </div>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Connection path</p>
            <h3>One-time auth, then webhook events land in the local queue.</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>OAuth callback</dt>
                <dd>
                  <code>{callbackPath}</code>
                </dd>
              </div>
              <div>
                <dt>Webhook intake</dt>
                <dd>
                  <code>{webhookUrl}</code>
                </dd>
              </div>
              <div>
                <dt>Setup state</dt>
                <dd>{authUrl ? "Ready" : "Needs Kommo env vars"}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section className="grid two">
        <article className="card">
          <h2>What to paste into Kommo</h2>
          <ol className="stack">
            <li>Open Kommo widget/app settings and start the OAuth flow.</li>
            <li>Point the redirect URI at the callback path above.</li>
            <li>Set the webhook URL in Kommo to the intake endpoint above.</li>
            <li>Approve the connection once, then watch the dashboard status update.</li>
          </ol>
        </article>

        <article className="card">
          <h2>Current guardrails</h2>
          {authError ? (
            <p className="status-off">{authError}</p>
          ) : (
            <ul className="stack">
              <li>Credentials are encrypted at rest in the local work file.</li>
              <li>Webhook events are stored locally before they touch the queue.</li>
              <li>Auto-send remains disabled until explicitly turned on.</li>
              <li>Every live reply still stays behind approval-first review.</li>
            </ul>
          )}
        </article>
      </section>
    </main>
  );
}
