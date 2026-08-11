import { useEffect, useRef, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { LandmarkCanvas } from "./LandmarkCanvas";
import { syntheticFace, normalizeBoundingBox, type Landmarks68 } from "@/lib/als/landmarks";

function fallbackSequence(): Landmarks68[] {
  return Array.from({ length: 20 }, (_, i) =>
    normalizeBoundingBox(syntheticFace(i * 0.25, (Math.sin((i / 19) * Math.PI * 2) + 1) / 2)),
  );
}

/** Frame-by-frame playback of the (20, 68, 2) kinematic sequence. */
export function KinematicPlayer({ sequence }: { sequence: Landmarks68[] }) {
  const frames = sequence.length === 20 ? sequence : fallbackSequence();
  const [frame, setFrame] = useState(1);
  const [playing, setPlaying] = useState(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = window.setInterval(() => setFrame((f) => (f >= 20 ? 1 : f + 1)), 110);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing]);

  return (
    <section className="surface-card p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold tracking-tight">Facial Kinematic Analysis</h2>
        <span className="mono-label">Visualisation only</span>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="aspect-square w-full rounded-xl border bg-surface">
            <LandmarkCanvas
              landmarks={frames[frame - 1] ?? null}
              className="h-full w-full"
              fit="contain"
              background="grid"
              pointRadius={2.6}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current frame</span>
              <span className="font-mono font-medium">
                {String(frame).padStart(2, "0")} / 20
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={frame}
              onChange={(e) => {
                setPlaying(false);
                setFrame(Number(e.target.value));
              }}
              className="w-full accent-[oklch(0.58_0.13_245)]"
              aria-label="Frame slider"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setPlaying(true)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${playing ? "border-primary bg-primary-soft text-primary" : "bg-card hover:bg-surface-2"}`}
              >
                <Play className="h-3.5 w-3.5" aria-hidden /> Play
              </button>
              <button
                onClick={() => setPlaying(false)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${!playing ? "border-primary bg-primary-soft text-primary" : "bg-card hover:bg-surface-2"}`}
              >
                <Pause className="h-3.5 w-3.5" aria-hidden /> Pause
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setFrame(1);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-sm hover:bg-surface-2"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
              </button>
            </div>
          </div>
        </div>

        <dl className="grid content-start gap-2.5 text-sm">
          {[
            ["Sequence Length", "20 frames"],
            ["Landmarks", "68"],
            ["Coordinates", "2D"],
            ["Normalization", "Bounding-box normalized"],
            ["Representation", "(20, 68, 2)"],
            ["Source", sequence.length === 20 ? "Captured this session" : "Demonstration sequence"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-mono font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
