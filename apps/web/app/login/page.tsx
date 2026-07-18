import { LoginForm } from "./login-form";

export default function LoginPage() {
  const defaultEmail = process.env.NODE_ENV !== "production"
    ? (process.env.DEV_ADMIN_EMAIL ?? "dev@example.com")
    : (process.env.ADMIN_EMAIL ?? "admin@example.com");
  const defaultPassword = process.env.NODE_ENV !== "production"
    ? (process.env.DEV_ADMIN_PASSWORD ?? "dev-password")
    : "";

  return (
    <main className="login-shell">
      <div className="login-grid">
        <section className="login-hero">
          <div>
            <span className="pill">Admin login</span>
            <h1>Sign in to the review console.</h1>
            <p className="muted">
              The interface is now tuned to feel like a modern SaaS workspace: calmer surfaces, clearer hierarchy, and stronger visual separation between live controls and review-only surfaces.
            </p>
          </div>

          <div className="login-hero-list">
            <div>
              <span className="muted">Environment</span>
              <strong>Approval-first</strong>
            </div>
            <div>
              <span className="muted">Production guardrail</span>
              <strong>Hash required</strong>
            </div>
            <div>
              <span className="muted">Dev fallback</span>
              <strong><code>{defaultEmail}</code></strong>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="section-header">
            <p className="eyebrow">Enter workspace</p>
            <h2>Use the credentials that match your environment.</h2>
            <p>In development you can use the fallback credentials shown below. In production the real admin email and password hash are required.</p>
          </div>

          <p className="callout">
            Dev login: <code>{defaultEmail}</code> / <code>{defaultPassword}</code>
          </p>

          <LoginForm defaultEmail={defaultEmail} defaultPassword={defaultPassword} />
        </section>
      </div>
    </main>
  );
}
