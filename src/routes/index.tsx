import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  ScanFace,
  Grid3x3,
  Crop,
  ClipboardList,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Layers,
  LineChart,
} from "lucide-react";
import { ResearchDisclaimer } from "@/components/als/Disclaimers";
import { PrivacyCard } from "@/components/als/PrivacyCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALS-NET — AI-Assisted Oro-Facial Motor Assessment" },
      {
        name: "description",
        content:
          "Research prototype for analysing facial kinematics and speech-related motor patterns using compact 68-point landmark representations. Demonstration only.",
      },
      { property: "og:title", content: "ALS-NET — AI-Assisted Oro-Facial Motor Assessment" },
      {
        property: "og:description",
        content:
          "An experimental privacy-preserving framework for analysing facial kinematics and speech-related motor patterns in neurological disorders.",
      },
    ],
  }),
  component: Landing,
});

const WORKFLOW = [
  { icon: Camera, label: "Webcam + Microphone", note: "Browser MediaDevices" },
  { icon: ScanFace, label: "Facial Landmark Extraction", note: "Client-side" },
  { icon: Grid3x3, label: "68-Point Facial Kinematics", note: "(68, 2)" },
  { icon: Crop, label: "Bounding-Box Normalization", note: "[0, 1]" },
  { icon: ClipboardList, label: "Clinical Task Analysis", note: "NSM / DDK / BBP" },
  { icon: BrainCircuit, label: "ALS-NET Architecture", note: "Siamese · Bi-GRU · ST-GCN" },
  { icon: BarChart3, label: "Assessment Results", note: "Demo values" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Privacy-Preserving",
    body: "Uses compact facial landmark representations rather than relying on raw facial imagery for the proposed analysis pipeline.",
  },
  {
    icon: Layers,
    title: "Task-Specific AI",
    body: "Different neural architectures are associated with different clinical motion characteristics.",
  },
  {
    icon: LineChart,
    title: "Interpretable Analysis",
    body: "Temporal attention and facial movement visualizations help demonstrate which movement patterns contribute to the assessment.",
  },
];

function Landing() {
  return (
    <div>
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 grid-backdrop opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                University research prototype
              </span>
              <h1 className="mt-6 text-5xl font-bold tracking-tight text-foreground lg:text-6xl">ALS-NET</h1>
              <p className="mt-3 text-xl font-medium text-primary lg:text-2xl">
                AI-Assisted Oro-Facial Motor Assessment
              </p>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                An experimental privacy-preserving framework for analyzing facial kinematics and speech-related motor
                patterns in neurological disorders.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/setup"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
                >
                  Start Assessment <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to="/architecture"
                  className="inline-flex items-center gap-2 rounded-lg border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
                >
                  Explore ALS-NET
                </Link>
              </div>
              <ResearchDisclaimer className="mt-8 max-w-xl bg-card/80" />
            </div>

            <div className="surface-card p-6">
              <p className="mono-label">Processing workflow</p>
              <ol className="mt-4 space-y-2">
                {WORKFLOW.map((s, i) => (
                  <li key={s.label}>
                    <div className="flex items-center gap-3 rounded-lg border bg-surface px-3.5 py-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                        <s.icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{s.label}</span>
                        <span className="block font-mono text-[11px] text-muted-foreground">{s.note}</span>
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    {i < WORKFLOW.length - 1 && (
                      <div className="ml-[30px] h-3 w-px bg-border" aria-hidden />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface-card p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <PrivacyCard />
      </section>
    </div>
  );
}
