import { CommunicationProfileEditor } from "@/components/communication-profile-editor";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function CommunicationProfilePage() {
  const state = await readUiState();

  return (
    <main className="page-stack">
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
