import { useEffect, useRef } from "react";

/** Real-time microphone waveform driven by the Web Audio API. */
export function AudioWaveform({
  stream,
  height = 96,
  active = true,
}: {
  stream: MediaStream | null;
  height?: number;
  active?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const levelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioTracks = stream?.getAudioTracks() ?? [];
    let raf = 0;
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let data: Uint8Array<ArrayBuffer> | null = null;

    if (audioTracks.length && active) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
      const src = audioCtx.createMediaStreamSource(new MediaStream(audioTracks));
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      src.connect(analyser);
      data = new Uint8Array(new ArrayBuffer(analyser.fftSize));
      void audioCtx.resume();
    }

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // baseline
      ctx.strokeStyle = "rgba(100,116,139,0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = analyser ? "#2563eb" : "rgba(100,116,139,0.45)";
      ctx.beginPath();

      let peak = 0;
      if (analyser && data) {
        analyser.getByteTimeDomainData(data);
        const step = Math.max(1, Math.floor(data.length / w));
        for (let i = 0, x = 0; i < data.length; i += step, x++) {
          const v = (data[i]! - 128) / 128;
          peak = Math.max(peak, Math.abs(v));
          const y = h / 2 + v * (h / 2 - 4) * 2.2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, Math.max(2, Math.min(h - 2, y)));
        }
      } else {
        for (let x = 0; x < w; x++) {
          const y = h / 2 + Math.sin(x / 22) * 1.5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      if (levelRef.current) {
        levelRef.current.style.width = `${Math.min(100, Math.round(peak * 180))}%`;
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      void audioCtx?.close();
    };
  }, [stream, active]);

  return (
    <div className="space-y-2">
      <canvas ref={canvasRef} style={{ height }} className="w-full rounded-lg bg-surface-2/70" />
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <span ref={levelRef} className="block h-full w-0 rounded-full bg-accent transition-[width] duration-75" />
      </div>
    </div>
  );
}
