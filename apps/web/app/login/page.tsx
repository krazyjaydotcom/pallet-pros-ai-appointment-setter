export default function LoginPage() {
  const expectedEmail = process.env.ADMIN_EMAIL ?? "";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? "";
  const devEmail = process.env.DEV_ADMIN_EMAIL ?? "dev@example.com";
  const devPassword = process.env.DEV_ADMIN_PASSWORD ?? "dev-password";
  const productionAuthConfigured = Boolean(expectedEmail && passwordHash);
  const defaultEmail = productionAuthConfigured ? expectedEmail : devEmail;
  const defaultPassword = productionAuthConfigured ? "" : devPassword;

  return (
    <main className="login-shell">
      <div className="login-grid">
        <section className="login-hero">
          <div>
            <span className="pill">Admin login</span>
            <h1>Sign in to the review console.</h1>
            <p className="muted">
              The interface is tuned to feel like a modern SaaS workspace: calmer surfaces, clearer hierarchy, and stronger visual separation between live controls and review-only surfaces.
            </p>
          </div>

          <div className="login-hero-list">
            <div>
              <span className="muted">Environment</span>
              <strong>Approval-first</strong>
            </div>
            <div>
              <span className="muted">Production guardrail</span>
              <strong>{productionAuthConfigured ? "Hash required" : "Dev fallback enabled"}</strong>
            </div>
            <div>
              <span className="muted">Dev login</span>
              <strong><code>{defaultEmail}</code></strong>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="section-header">
            <p className="eyebrow">Enter workspace</p>
            <h2>Use the credentials that match your environment.</h2>
            <p>
              In development you can use the fallback credentials shown below. In production the real admin email and password hash are required.
            </p>
          </div>

          <p className="callout">
            Dev login: <code>{defaultEmail}</code> / <code>{defaultPassword}</code>
          </p>

          <form className="stack" method="post" action="/api/auth/login">
            <label className="field">
              <span>Email</span>
              <input
                className="input"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={defaultEmail}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                className="input"
                name="password"
                type="password"
                autoComplete="current-password"
                defaultValue={defaultPassword}
              />
            </label>
            <button className="button" type="submit">
              Sign in
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
