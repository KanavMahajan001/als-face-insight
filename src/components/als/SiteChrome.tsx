import { Link, useRouterState } from "@tanstack/react-router";
import { Activity } from "lucide-react";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/setup", label: "Device Check" },
  { to: "/tasks", label: "Clinical Tasks" },
  { to: "/architecture", label: "Architecture" },
] as const;

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg navy-gradient text-primary-foreground">
            <Activity className="h-4.5 w-4.5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">ALS-NET</span>
            <span className="mono-label">Research Prototype</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-md px-3 py-2 text-sm transition-colors ${
                path === n.to ? "bg-primary-soft font-medium text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/setup"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Start Assessment
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <p className="font-medium text-foreground">ALS-NET — AI-Assisted Oro-Facial Motor Assessment</p>
        <p className="mt-2 max-w-3xl">
          University research prototype. Frontend-only demonstration: no backend, no database, no cloud upload. All
          model outputs shown in this interface are simulated demonstration values and must not be interpreted as
          medical findings.
        </p>
      </div>
    </footer>
  );
}
