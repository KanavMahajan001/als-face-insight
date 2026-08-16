import { useEffect, useMemo, useRef } from "react";
import { LandmarkCanvas } from "./LandmarkCanvas";
import type { FaceFrame } from "@/hooks/useFaceLandmarks";
import type { Landmarks68 } from "@/lib/als/landmarks";

type Props = {
  stream: MediaStream | null;
  /** Latest real detection from face-api.js (video-pixel coordinates). */
  frame?: FaceFrame | null;
  showLandmarks?: boolean;
  trajectory?: boolean;
  statusLabel?: string | undefined;
  overlayLabel?: string | undefined;
  onVideoReady?: ((el: HTMLVideoElement | null) => void) | undefined;
};

/** Live webcam preview with an aligned facial-landmark overlay. */
export function CameraView({
  stream,
  frame = null,
  showLandmarks = true,
  trajectory = false,
  statusLabel,
  overlayLabel,
  onVideoReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = !!stream?.getVideoTracks().length;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    onVideoReady?.(v);
    if (stream && hasVideo) {
      v.srcObject = new MediaStream(stream.getVideoTracks());
      void v.play().catch(() => {});
    } else {
      v.srcObject = null;
    }
  }, [stream, hasVideo, onVideoReady]);

  // Convert video-pixel landmarks into the 0..1 space the canvas overlay uses.
  const overlay: Landmarks68 | null = useMemo(() => {
    const v = videoRef.current;
    if (!frame || !v || !v.videoWidth || !v.videoHeight) return null;
    return frame.rawLandmarks.map(([x, y]) => ({ x: x / v.videoWidth, y: y / v.videoHeight }));
  }, [frame]);

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
        <LandmarkCanvas
          landmarks={overlay}
          className="absolute inset-0 h-full w-full scale-x-[-1]"
          trajectory={trajectory}
        />
      )}
      {!hasVideo && (
        <div className="absolute inset-0 grid place-items-center text-sm text-[oklch(0.85_0.01_250)]">
          Camera is off
        </div>
      )}
      {hasVideo && (
        <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
          {statusLabel && (
            <span className="rounded-md bg-black/55 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
              {statusLabel}
            </span>
          )}
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
