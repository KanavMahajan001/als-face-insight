import { useCallback, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Mic, ScanFace, Crosshair, Sun, Check, X, ArrowRight, Play, Pause, Route as RouteIcon } from "lucide-react";
import { CameraView } from "@/components/als/CameraView";
import { LandmarkCanvas } from "@/components/als/LandmarkCanvas";
import { AudioWaveform } from "@/components/als/AudioWaveform";
import { useMediaStream } from "@/hooks/useMediaStream";
import { boundingBox, normalizeBoundingBox, type Landmarks68 } from "@/lib/als/landmarks";
import type { LandmarkEngine } from "@/hooks/useFaceLandmarks";

export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Device Check & Live Landmarks — ALS-NET" },
      {
        name: "description",
        content:
          "Verify camera and microphone access and preview the live 68-point facial landmark visualisation before starting an ALS-NET demonstration task.",
      },
      { property: "og:title", content: "Device Check & Live Landmarks — ALS-NET" },
      {
        property: "og:description",
        content: "Camera, microphone, face position and lighting checks for the ALS-NET research prototype.",
      },
    ],
  }),
  component: SetupPage,
});

type Status = { ok: boolean; good: string; bad: string };

function StatusRow({ icon: Icon, label, status }: { icon: typeof Camera; label: string; status: Status }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border bg-surface px-4 py-3">
      <Icon className="h-4.5 w-4.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className={`text-sm ${status.ok ? "text-success" : "text-muted-foreground"}`}>
        {status.ok ? status.good : status.bad}
      </span>
      <span
        className={`grid h-6 w-6 place-items-center rounded-full ${
          status.ok ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
        }`}
      >
        {status.ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : <X className="h-3.5 w-3.5" aria-hidden />}
      </span>
    </li>
  );
}

function SetupPage() {
  const { stream, camera, mic, error, enableCamera, enableMic } = useMediaStream();
  const [detected, setDetected] = useState(false);
  const [engine, setEngine] = useState<LandmarkEngine>("loading");
  const [landmarks, setLandmarks] = useState<Landmarks68 | null>(null);
  const [paused, setPaused] = useState(false);
  const [trajectory, setTrajectory] = useState(false);

  const onStatus = useCallback(
    (s: { detected: boolean; engine: LandmarkEngine; landmarks: Landmarks68 | null }) => {
      setDetected(s.detected);
      setEngine(s.engine);
      if (s.landmarks) setLandmarks(s.landmarks);
    },
    [],
  );

  const { centered, size } = useMemo(() => {
    if (!landmarks || !detected) return { centered: false, size: 0 };
    const bb = boundingBox(landmarks);
    const cx = bb.x + bb.w / 2;
    const cy = bb.y + bb.h / 2;
    return { centered: Math.abs(cx - 0.5) < 0.16 && Math.abs(cy - 0.5) < 0.2 && bb.w > 0.12, size: bb.w };
  }, [landmarks, detected]);

  const lightingOk = detected && size > 0.1;
  const normalized = landmarks ? normalizeBoundingBox(landmarks) : null;
  const canContinue = camera === "granted" && mic === "granted";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="mono-label">Step 1 · Device check</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Camera &amp; Microphone Check</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The prototype requests real camera and microphone access from your browser. Streams stay local to this tab.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="surface-card p-4">
          <CameraView stream={stream} paused={paused} trajectory={trajectory} onStatus={onStatus} overlayLabel="68-pt overlay" />
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setPaused(false)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${!paused ? "border-primary bg-primary-soft text-primary" : "bg-card hover:bg-surface-2"}`}
            >
              <Play className="h-3.5 w-3.5" aria-hidden /> Live
            </button>
            <button
              onClick={() => setPaused(true)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${paused ? "border-primary bg-primary-soft text-primary" : "bg-card hover:bg-surface-2"}`}
            >
              <Pause className="h-3.5 w-3.5" aria-hidden /> Pause
            </button>
            <button
              onClick={() => setTrajectory((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm ${trajectory ? "border-primary bg-primary-soft text-primary" : "bg-card hover:bg-surface-2"}`}
            >
              <RouteIcon className="h-3.5 w-3.5" aria-hidden /> Show Trajectory
            </button>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-base font-semibold">System Check</h2>
          <ul className="mt-4 space-y-2.5">
            <StatusRow icon={Camera} label="Camera" status={{ ok: camera === "granted", good: "Connected", bad: "Not detected" }} />
            <StatusRow icon={Mic} label="Microphone" status={{ ok: mic === "granted", good: "Connected", bad: "Not detected" }} />
            <StatusRow icon={ScanFace} label="Face" status={{ ok: detected, good: "Detected", bad: "Not detected" }} />
            <StatusRow
              icon={Crosshair}
              label="Face Position"
              status={{ ok: centered, good: "Centered", bad: "Reposition required" }}
            />
            <StatusRow icon={Sun} label="Lighting" status={{ ok: lightingOk, good: "Good", bad: "Improve lighting" }} />
          </ul>

          <div className="mt-5">
            <p className="mono-label">Microphone input</p>
            <div className="mt-2">
              <AudioWaveform stream={stream} height={72} />
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {engine === "simulated" && (
            <p className="mt-4 rounded-lg border bg-surface px-3 py-2 text-xs text-muted-foreground">
              The in-browser face mesh model could not be loaded, so the landmark overlay falls back to a clearly
              labelled simulated stream. Camera and microphone still work normally.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => void enableCamera()}
              disabled={camera === "granted"}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" aria-hidden /> Enable Camera
            </button>
            <button
              onClick={() => void enableMic()}
              disabled={mic === "granted"}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              <Mic className="h-4 w-4" aria-hidden /> Enable Microphone
            </button>
            <Link
              to="/tasks"
              aria-disabled={!canContinue}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                canContinue
                  ? "bg-primary text-primary-foreground hover:opacity-90"
                  : "pointer-events-none bg-muted text-muted-foreground"
              }`}
            >
              Continue <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="surface-card p-6">
          <p className="mono-label">Step 2 · Visualisation layer</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Live Facial Landmark View</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Normalised landmark set rendered independently of the video frame. This is a visualisation layer only — no
            detection or classification of any condition happens in the browser.
          </p>
          <div className="mt-4 aspect-square w-full max-w-md rounded-xl border bg-surface">
            <LandmarkCanvas
              landmarks={normalized}
              className="h-full w-full"
              fit="contain"
              background="grid"
              pointRadius={2.6}
              trajectory={trajectory}
            />
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="surface-card p-6">
            <p className="mono-label">Landmark Representation</p>
            <p className="mt-1 font-mono text-lg">68 points × 2 coordinates</p>
          </div>
          <div className="surface-card p-6">
            <p className="mono-label">Normalized Coordinate Space</p>
            <p className="mt-1 font-mono text-lg">[0, 1]</p>
          </div>
          <div className="surface-card p-6">
            <p className="mono-label">Regions</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {[
                ["Jaw", "#2563eb"],
                ["Mouth", "#e11d48"],
                ["Nose", "#14b8a6"],
                ["Eyes", "#6366f1"],
                ["Eyebrows", "#0ea5e9"],
                ["Inner lips", "#f97316"],
              ].map(([label, color]) => (
                <li key={label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
