import { useEffect, useRef, useState } from "react";
import { LandmarkCanvas } from "./LandmarkCanvas";
import { useFaceLandmarks, type LandmarkEngine } from "@/hooks/useFaceLandmarks";
import type { Landmarks68 } from "@/lib/als/landmarks";

type Props = {
  stream: MediaStream | null;
  showLandmarks?: boolean;
  trajectory?: boolean;
  paused?: boolean;
  onFrame?: (l: Landmarks68) => void;
  onStatus?: (s: { detected: boolean; engine: LandmarkEngine; landmarks: Landmarks68 | null }) => void;
  overlayLabel?: string;
};

/** Live webcam preview with an aligned facial-landmark overlay. */
export function CameraView({
  stream,
  showLandmarks = true,
  trajectory = false,
  paused = false,
  onFrame,
  onStatus,
  overlayLabel,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const hasVideo = !!stream?.getVideoTracks().length;
  const { landmarks, detected, engine } = useFaceLandmarks(videoEl, hasVideo && !paused);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    setVideoEl(v);
    if (stream && hasVideo) {
      v.srcObject = new MediaStream(stream.getVideoTracks());
      void v.play().catch(() => {});
    } else {
      v.srcObject = null;
    }
  }, [stream, hasVideo]);

  useEffect(() => {
    if (landmarks && !paused) onFrame?.(landmarks);
    onStatus?.({ detected, engine, landmarks });
  }, [landmarks, detected, engine, paused, onFrame, onStatus]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-[oklch(0.24_0.03_258)]">
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full scale-x-[-1] object-cover"
        aria-label="Live webcam preview"
      />
      {showLandmarks && hasVideo && (
        <LandmarkCanvas landmarks={landmarks} className="absolute inset-0 h-full w-full scale-x-[-1]" trajectory={trajectory} />
      )}
      {!hasVideo && (
        <div className="absolute inset-0 grid place-items-center text-sm text-[oklch(0.85_0.01_250)]">
          Camera is off
        </div>
      )}
      {hasVideo && (
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
          <span className="rounded-md bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
            {engine === "mediapipe" ? "Face Mesh · live" : engine === "loading" ? "Loading model…" : "Simulated landmarks"}
          </span>
          {overlayLabel && (
            <span className="rounded-md bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
              {overlayLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
