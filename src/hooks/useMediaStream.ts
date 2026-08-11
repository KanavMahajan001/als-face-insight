import { useCallback, useEffect, useRef, useState } from "react";

export type PermState = "idle" | "pending" | "granted" | "denied";

/**
 * Real getUserMedia access. Camera and microphone are requested separately so
 * the setup screen can report each device independently.
 */
export function useMediaStream() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camera, setCamera] = useState<PermState>("idle");
  const [mic, setMic] = useState<PermState>("idle");
  const [error, setError] = useState<string | null>(null);
  const videoTrack = useRef<MediaStreamTrack | null>(null);
  const audioTrack = useRef<MediaStreamTrack | null>(null);

  const rebuild = useCallback(() => {
    const tracks = [videoTrack.current, audioTrack.current].filter(Boolean) as MediaStreamTrack[];
    setStream(tracks.length ? new MediaStream(tracks) : null);
  }, []);

  const enableCamera = useCallback(async () => {
    if (videoTrack.current) return;
    setCamera("pending");
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
      });
      videoTrack.current = s.getVideoTracks()[0] ?? null;
      setCamera("granted");
      rebuild();
    } catch (e) {
      setCamera("denied");
      setError(friendly(e, "camera"));
    }
  }, [rebuild]);

  const enableMic = useCallback(async () => {
    if (audioTrack.current) return;
    setMic("pending");
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      audioTrack.current = s.getAudioTracks()[0] ?? null;
      setMic("granted");
      rebuild();
    } catch (e) {
      setMic("denied");
      setError(friendly(e, "microphone"));
    }
  }, [rebuild]);

  const stopAll = useCallback(() => {
    videoTrack.current?.stop();
    audioTrack.current?.stop();
    videoTrack.current = null;
    audioTrack.current = null;
    setStream(null);
    setCamera("idle");
    setMic("idle");
  }, []);

  useEffect(() => () => stopAll(), [stopAll]);

  return { stream, camera, mic, error, enableCamera, enableMic, stopAll };
}

function friendly(e: unknown, device: string) {
  const name = (e as { name?: string })?.name ?? "";
  if (name === "NotAllowedError")
    return `Access to the ${device} was blocked. Allow it in your browser's address-bar permission menu, then try again.`;
  if (name === "NotFoundError") return `No ${device} was detected on this device.`;
  if (name === "NotReadableError") return `The ${device} is already in use by another application.`;
  return `Could not start the ${device}. ${(e as Error)?.message ?? ""}`;
}
