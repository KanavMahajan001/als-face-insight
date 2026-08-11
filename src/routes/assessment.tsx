import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Circle, Square, RotateCcw, Sparkles, CheckCircle2, Mic, Camera } from "lucide-react";
import { CameraView } from "@/components/als/CameraView";
import { AudioWaveform } from "@/components/als/AudioWaveform";
import { useMediaStream } from "@/hooks/useMediaStream";
import { getTask, ARCHITECTURES } from "@/lib/als/tasks";
import { setSession, useSession } from "@/lib/als/session";
import { buildSequence, type Landmarks68 } from "@/lib/als/landmarks";
import { ResearchDisclaimer } from "@/components/als/Disclaimers";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment Recording — ALS-NET" },
      {
        name: "description",
        content:
          "Record a clinical task with live webcam, landmark overlay and real-time microphone waveform. Recordings stay inside the browser session.",
      },
      { property: "og:title", content: "Assessment Recording — ALS-NET" },
      {
        property: "og:description",
        content: "Webcam and microphone capture with a live 68-point landmark overlay for the ALS-NET prototype.",
      },
    ],
  }),
  component: AssessmentPage,
});

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function AssessmentPage() {
  const navigate = useNavigate();
  const session = useSession();
  const task = getTask(session.taskId);
  const arch = ARCHITECTURES[task.architecture];
  const { stream, camera, mic, error, enableCamera, enableMic } = useMediaStream();

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [complete, setComplete] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const framesRef = useRef<Landmarks68[]>([]);
  const startRef = useRef(0);

  useEffect(() => {
    void enableCamera();
    void enableMic();
  }, [enableCamera, enableMic]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setElapsed(Date.now() - startRef.current), 200);
    return () => window.clearInterval(id);
  }, [recording]);

  const onFrame = useCallback((l: Landmarks68) => {
    if (recorderRef.current?.state === "recording") framesRef.current.push(l);
  }, []);

  const start = () => {
    if (!stream) return;
    chunksRef.current = [];
    framesRef.current = [];
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream);
    } catch {
      return;
    }
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      setSession({
        hasRecording: true,
        recordingUrl: url,
        recordingDurationMs: Date.now() - startRef.current,
        sequence: buildSequence(framesRef.current, 20),
      });
      setComplete(true);
    };
    recorderRef.current = rec;
    startRef.current = Date.now();
    setElapsed(0);
    setComplete(false);
    rec.start();
    setRecording(true);
  };

  const stop = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const retake = () => {
    setComplete(false);
    setElapsed(0);
    setSession({ hasRecording: false, sequence: [], recordingDurationMs: 0 });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mono-label">Step 4 · Recording</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Assessment — <span className="font-mono">{task.id}</span>
          </h1>
        </div>
        <div className="text-right">
          <p className="mono-label">Progress</p>
          <p className="text-sm font-medium">Task 1 of 1</p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="surface-card p-4">
          <CameraView stream={stream} onFrame={onFrame} overlayLabel={recording ? "REC" : undefined} />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!recording ? (
              <button
                onClick={start}
                disabled={!stream || complete}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Circle className="h-3.5 w-3.5 fill-current" aria-hidden /> Start Recording
              </button>
            ) : (
              <button
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
              >
                <Square className="h-3.5 w-3.5 fill-current" aria-hidden /> Stop
              </button>
            )}
            <button
              onClick={retake}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden /> Retake
            </button>
            {complete && (
              <button
                onClick={() => void navigate({ to: "/processing" })}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4" aria-hidden /> Analyze Demo
              </button>
            )}
          </div>
          {error && (
            <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {(camera !== "granted" || mic !== "granted") && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => void enableCamera()} className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs">
                <Camera className="h-3.5 w-3.5" aria-hidden /> Enable Camera
              </button>
              <button onClick={() => void enableMic()} className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1.5 text-xs">
                <Mic className="h-3.5 w-3.5" aria-hidden /> Enable Microphone
              </button>
            </div>
          )}
        </div>

        <div className="grid content-start gap-4">
          <section className="surface-card p-6">
            <p className="mono-label">Current Task</p>
            <h2 className="mt-1 font-mono text-lg font-semibold">{task.id}</h2>
            <p className="mt-2 text-sm font-medium">“{task.instruction}”</p>
            <p className="mt-2 text-sm text-muted-foreground">{task.purpose}</p>
            <p className="mt-3 font-mono text-xs text-muted-foreground">{arch.name} · {arch.prior}</p>
          </section>

          <section className="surface-card p-6">
            <div className="flex items-center justify-between">
              <p className="mono-label">Microphone</p>
              <span className={`text-xs ${mic === "granted" ? "text-success" : "text-muted-foreground"}`}>
                {mic === "granted" ? "Live input" : "Not connected"}
              </span>
            </div>
            <div className="mt-3">
              <AudioWaveform stream={stream} height={88} />
            </div>
          </section>

          <section className="surface-card p-6">
            <p className="mono-label">Recording</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-3xl tabular-nums">{fmt(elapsed)}</span>
              {recording && (
                <span className="inline-flex items-center gap-2 rounded-full bg-destructive/12 px-3 py-1 text-xs font-medium text-destructive">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" aria-hidden /> Recording
                </span>
              )}
              {complete && (
                <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-medium text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Recording Complete
                </span>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Captured with MediaRecorder and kept in this browser tab only — nothing is uploaded.
            </p>
          </section>

          <ResearchDisclaimer />
          <Link to="/tasks" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            ← Choose a different task
          </Link>
        </div>
      </div>
    </div>
  );
}
