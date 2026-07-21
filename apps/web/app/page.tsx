import Link from "next/link";
import { readUiState } from "@/src/lib/mock-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const state = await readUiState();
  const stats = [
    { label: "Operating mode", value: state.summary.operatingMode },
    { label: "Default model", value: state.summary.defaultModel },
    { label: "Debounce", value: `${state.summary.debounceSeconds}s` },
    { label: "Window", value: `${state.summary.messageWindowHours}h` }
  ];

  return (
    <main className="shell layout">
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="pill">Pallet Pros Academy</span>
            <h1>Modern approval-first AI for reply review.</h1>
            <p>
              We're turning the old-school dashboard into a calmer, clearer workspace: structured reply drafts, obvious approval states, and a cleaner review flow so the whole thing feels more like a modern product than a prototype.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/dashboard">Open dashboard</Link>
              <Link className="button secondary" href="/dashboard/setup">Open setup</Link>
              <Link className="button secondary" href="/dashboard/playground">Try the playground</Link>
            </div>
          </div>

          <aside className="hero-panel">
            <p className="eyebrow">Live posture</p>
            <h3>Human review stays first.</h3>
            <dl className="hero-panel-list">
              {stats.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </section>

      <section className="grid three">
        {stats.map((item) => (
          <article className="card metric" key={item.label}>
            <span className="muted">{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="grid two">
        <article className="card">
          <div className="section-header">
            <p className="eyebrow">What it does</p>
            <h2>Turns incoming events into a readable approval queue.</h2>
          </div>
          <ul className="clean">
            <li>Stores incoming event records.</li>
            <li>Queues processing jobs with BullMQ.</li>
            <li>Retrieves relevant knowledge-base entries.</li>
            <li>Generates structured AI decisions.</li>
            <li>Requires approval by default.</li>
          </ul>
        </article>
        <article className="card">
          <div className="section-header">
            <p className="eyebrow">What stays disabled</p>
            <h2>Safe by default, with live send intentionally off.</h2>
          </div>
          <ul className="clean">
            <li>Automatic sending by default.</li>
            <li>Browser automation.</li>
            <li>Polling loops.</li>
            <li>Live credentials in source.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
