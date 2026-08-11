import { createFileRoute, Link } from "@tanstack/react-router";
import { ArchitectureCards } from "@/components/als/ArchitectureCards";
import { PrivacyCard } from "@/components/als/PrivacyCard";
import { ResearchDisclaimer } from "@/components/als/Disclaimers";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "ALS-NET Architectures — Siamese, Bi-GRU, ST-GCN" },
      {
        name: "description",
        content:
          "Comparison of the three task-conditioned ALS-NET architectures: Siamese symmetry prior, Bi-GRU temporal attention and ST-GCN coordinated movement.",
      },
      { property: "og:title", content: "ALS-NET Architectures — Siamese, Bi-GRU, ST-GCN" },
      {
        property: "og:description",
        content: "Task-conditioned model selection in the ALS-NET research framework.",
      },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mono-label">Framework</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">ALS-NET Architecture</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Each clinical task emphasises different motion characteristics, so the framework pairs the task with an
          architecture whose inductive bias matches those characteristics. All figures shown are demonstration values
          from the research paper.
        </p>
      </header>

      <ArchitectureCards />

      <section className="mt-10 surface-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">Shared input representation</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Landmarks", "68 points"],
            ["Coordinates", "2D, bounding-box normalized"],
            ["Tensor", "(20, 68, 2)"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border bg-surface px-4 py-3">
              <p className="mono-label">{k}</p>
              <p className="mt-1 font-mono text-sm font-medium">{v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          The frontend produces exactly this tensor in the browser, so a Python/PyTorch inference service can be
          connected later without changing the interface.
        </p>
      </section>

      <div className="mt-10">
        <PrivacyCard />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          to="/setup"
          className="inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Start Assessment
        </Link>
        <Link to="/tasks" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          Browse clinical tasks
        </Link>
      </div>

      <div className="mt-8">
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
