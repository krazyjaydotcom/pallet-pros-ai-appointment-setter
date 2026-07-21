import { headers } from "next/headers";
import { CommunicationProfileEditor } from "@/components/communication-profile-editor";
import { resolveAppBaseUrl } from "@/src/lib/app-url";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function getKommoStatusMessage(status: string | string[] | undefined, detail: string | string[] | undefined) {
  const resolvedStatus = Array.isArray(status) ? status[0] : status;
  const resolvedDetail = Array.isArray(detail) ? detail[0] : detail;

  if (!resolvedStatus) {
    return null;
  }

  const labelMap: Record<string, { title: string; tone: string }> = {
    connected: { title: "Kommo connected successfully.", tone: "success" },
    denied: { title: "Kommo access was denied.", tone: "warning" },
    "missing-code": { title: "Kommo did not return an authorization code.", tone: "warning" },
    "invalid-state": { title: "Kommo OAuth state did not match.", tone: "warning" },
    error: { title: "Kommo connection failed.", tone: "warning" }
  };

  const label = labelMap[resolvedStatus] ?? { title: `Kommo status: ${resolvedStatus}`, tone: "warning" };

  return (
    <section className="panel" style={{ marginBottom: 24 }}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Kommo setup</p>
          <h2>{label.title}</h2>
          {resolvedDetail ? <p className="muted">{resolvedDetail}</p> : null}
        </div>
        <span className={`status-pill ${label.tone}`.trim()}>{resolvedStatus}</span>
      </div>
    </section>
  );
}

export default async function CommunicationProfilePage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams: SearchParams = (await props.searchParams) ?? {};
  const state = await readUiState();
  const appBaseUrl = resolveAppBaseUrl(await headers());
  const kommoOauthStartUrl = new URL("/api/kommo/oauth", appBaseUrl).toString();
  const kommoRedirectUrl = new URL("/api/kommo/oauth/callback", appBaseUrl).toString();
  const kommoWebhookUrl = new URL("/api/kommo/webhook", appBaseUrl).toString();

  return (
    <main className="page-stack">
      {getKommoStatusMessage(searchParams.kommo, searchParams.detail)}

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Kommo connection</p>
            <h2>Use these URLs when you wire Kommo to the app.</h2>
            <p className="muted">The start link opens Kommo authorization, the callback receives the code, and the webhook receives incoming message events.</p>
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

      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Communication profile</span>
            <h1>Control tone, question count, and appointment aggressiveness.</h1>
            <p className="muted">
              The profile is versioned and publishable just like the knowledge base, so tone changes stay intentional and easy to review.
            </p>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Tone posture</p>
            <h3>{state.communicationProfile.defaultTone}</h3>
            <dl className="hero-panel-list">
              <div>
                <dt>Max questions</dt>
                <dd>{state.communicationProfile.maximumQuestions}</dd>
              </div>
              <div>
                <dt>Default mode</dt>
                <dd>Approval-first</dd>
              </div>
              <div>
                <dt>Publish state</dt>
                <dd>{state.communicationProfile.status}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <CommunicationProfileEditor profile={state.communicationProfile} />
    </main>
  );
}
