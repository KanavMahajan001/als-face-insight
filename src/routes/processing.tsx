import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Cpu } from "lucide-react";
import { PIPELINE_STAGES, runAnalysis } from "@/lib/als/mock-results";
import { getTask, ARCHITECTURES } from "@/lib/als/tasks";
import { setSession, useSession } from "@/lib/als/session";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "ALS-NET Analysis — Processing" },
      {
        name: "description",
        content:
          "Simulated ALS-NET processing pipeline: landmark extraction, bounding-box normalization, 20-frame sequence construction and architecture selection.",
      },
      { property: "og:title", content: "ALS-NET Analysis — Processing" },
      { property: "og:description", content: "Frontend demonstration of the ALS-NET processing pipeline." },
    ],
  }),
  component: ProcessingPage,
});

function ProcessingPage() {
  const navigate = useNavigate();
  const session = useSession();
  const task = getTask(session.taskId);
  const arch = ARCHITECTURES[task.architecture];
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const per = 480;
    const id = window.setInterval(() => {
      setStage((s) => {
        if (s >= PIPELINE_STAGES.length - 1) {
          window.clearInterval(id);
          return s;
        }
        return s + 1;
      });
    }, per);
    const done = window.setTimeout(() => {
      setSession({ result: runAnalysis(task.id) });
      void navigate({ to: "/results" });
    }, per * PIPELINE_STAGES.length + 700);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(done);
    };
  }, [navigate, task.id]);

  return (
    <div className="relative min-h-[80vh] overflow-hidden hero-gradient">
      <div className="absolute inset-0 grid-backdrop opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Cpu className="h-3.5 w-3.5" aria-hidden /> Simulated pipeline
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">ALS-NET Analysis</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Frontend demonstration only — no machine-learning model is executing.
          </p>
        </div>

        <ol className="mx-auto mt-10 max-w-xl space-y-2">
          {PIPELINE_STAGES.map((s, i) => {
            const state = i < stage ? "done" : i === stage ? "active" : "idle";
            return (
              <li
                key={s}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                  state === "idle" ? "bg-card/50 opacity-55" : "bg-card shadow-[var(--shadow-card)]"
                }`}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    state === "done"
                      ? "bg-success/15 text-success"
                      : state === "active"
                        ? "bg-primary-soft text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {state === "done" ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : state === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <span className="font-mono text-[10px]">{i + 1}</span>
                  )}
                </span>
                <span className="flex-1 text-sm font-medium">{s}</span>
                <span className="mono-label">{state === "done" ? "ok" : state === "active" ? "running" : "queued"}</span>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
          <div className="surface-card p-5">
            <p className="mono-label">Input Representation</p>
            <p className="mt-1 font-mono text-xl">(20, 68, 2)</p>
          </div>
          <div className="surface-card p-5">
            <p className="mono-label">Selected Architecture</p>
            <p className="mt-1 text-sm font-semibold">{arch.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{arch.prior}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
