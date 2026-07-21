"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/setup", label: "Setup" },
  { href: "/dashboard/playground", label: "Playground" },
  { href: "/dashboard/knowledge-base", label: "Knowledge" },
  { href: "/dashboard/communication-profile", label: "Tone profile" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dashboard-app">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">P</div>
          <div>
            <p className="eyebrow">Pallet Pros Academy</p>
            <h2>Approval Console</h2>
            <p className="muted">Approval-first inbox, reply drafts, and guardrails for review workflows.</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          {navigation.map((item) => {
            const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "sidebar-link active" : "sidebar-link"}
              >
                <span className="sidebar-link-dot" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <section className="sidebar-card">
          <p className="eyebrow">Safety rails</p>
          <h3>Human approval stays in the loop.</h3>
          <dl className="sidebar-stats">
            <div>
              <dt>Mode</dt>
              <dd>APPROVAL_ONLY</dd>
            </div>
            <div>
              <dt>Window</dt>
              <dd>24h</dd>
            </div>
            <div>
              <dt>Auto-send</dt>
              <dd className="status-off">Disabled</dd>
            </div>
          </dl>
        </section>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations console</p>
            <h1>Review, tune, and approve every reply before it ships.</h1>
          </div>

          <div className="topbar-badges" aria-label="Workspace status">
            <span className="chip chip-emerald">Review only</span>
            <span className="chip chip-cyan">OpenAI structured draft</span>
            <span className="chip">Human review required</span>
          </div>
        </header>

        <main className="workspace-content">{children}</main>
      </div>
    </div>
  );
}
