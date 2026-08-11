import { Camera, ArrowRight, Grid3x3, Waypoints, ServerOff, DatabaseZap, CloudOff } from "lucide-react";

export function PrivacyCard() {
  return (
    <section className="surface-card overflow-hidden">
      <div className="grid gap-8 p-7 lg:grid-cols-[1.1fr_0.9fr] lg:p-9">
        <div>
          <p className="mono-label">Design principle</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Privacy-Preserving Design</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            The proposed ALS-NET framework is based on compact facial landmark trajectories rather than direct RGB pixel
            representations. For this frontend prototype, recordings remain within the browser session unless you
            explicitly download them.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {[
              { icon: Camera, label: "Camera" },
              { icon: Grid3x3, label: "Landmark Representation" },
              { icon: Waypoints, label: "Kinematic Data" },
            ].map((s, i, arr) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-lg border bg-surface px-3 py-2 text-sm">
                  <s.icon className="h-4 w-4 text-primary" aria-hidden />
                  {s.label}
                </span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden />}
              </div>
            ))}
          </div>
        </div>

        <ul className="grid content-start gap-3">
          {[
            { icon: ServerOff, label: "No backend", note: "All processing stays in this browser tab." },
            { icon: DatabaseZap, label: "No database", note: "Nothing is persisted between sessions." },
            { icon: CloudOff, label: "No cloud upload", note: "Recordings are never transmitted anywhere." },
          ].map((r) => (
            <li key={r.label} className="flex items-start gap-3 rounded-lg border bg-surface px-4 py-3">
              <r.icon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success" aria-hidden />
              <span>
                <span className="block text-sm font-medium">{r.label}</span>
                <span className="block text-xs text-muted-foreground">{r.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
