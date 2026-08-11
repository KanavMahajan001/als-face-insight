import { useEffect, useRef, useState } from "react";
import { MEDIAPIPE_TO_68, syntheticFace, type Landmarks68 } from "@/lib/als/landmarks";

export type LandmarkEngine = "loading" | "mediapipe" | "simulated";

/**
 * Browser-side facial landmark extraction (visualisation layer only).
 * Uses MediaPipe FaceLandmarker when it can be loaded, otherwise falls back
 * to a clearly-labelled synthetic landmark stream so the demo stays usable.
 */
export function useFaceLandmarks(
  video: HTMLVideoElement | null,
  active: boolean,
): { landmarks: Landmarks68 | null; detected: boolean; engine: LandmarkEngine } {
  const [landmarks, setLandmarks] = useState<Landmarks68 | null>(null);
  const [detected, setDetected] = useState(false);
  const [engine, setEngine] = useState<LandmarkEngine>("loading");
  const detectorRef = useRef<{ detectForVideo: (v: HTMLVideoElement, t: number) => unknown } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const vision = await import("@mediapipe/tasks-vision");
        const fileset = await vision.FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm",
        );
        const lm = await vision.FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });
        if (cancelled) return;
        detectorRef.current = lm as unknown as { detectForVideo: (v: HTMLVideoElement, t: number) => unknown };
        setEngine("mediapipe");
      } catch {
        if (!cancelled) setEngine("simulated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let lastTs = -1;
    const start = performance.now();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const det = detectorRef.current;
      if (det && video && video.readyState >= 2 && video.currentTime !== lastTs) {
        lastTs = video.currentTime;
        try {
          const res = det.detectForVideo(video, performance.now()) as {
            faceLandmarks?: { x: number; y: number }[][];
          };
          const face = res?.faceLandmarks?.[0];
          if (face && face.length > 400) {
            setLandmarks(MEDIAPIPE_TO_68.map((i) => ({ x: face[i]!.x, y: face[i]!.y })));
            setDetected(true);
            return;
          }
          setDetected(false);
          return;
        } catch {
          /* fall through to synthetic */
        }
      }
      if (!det) {
        const t = (performance.now() - start) / 1000;
        setLandmarks(syntheticFace(t, (Math.sin(t * 3) + 1) / 2));
        setDetected(engine === "simulated");
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, video, engine]);

  return { landmarks, detected, engine };
}
