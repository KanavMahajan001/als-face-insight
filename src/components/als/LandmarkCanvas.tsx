import { useEffect, useRef } from "react";
import { REGIONS, REGION_COLORS, type Landmarks68 } from "@/lib/als/landmarks";

type Props = {
  landmarks: Landmarks68 | null;
  className?: string;
  showBox?: boolean;
  trajectory?: boolean;
  pointRadius?: number;
  fit?: "stretch" | "contain";
  background?: "none" | "grid";
};

/**
 * Canvas renderer for a normalised 68-point landmark set.
 * Coordinates are expected in [0,1] space and are scaled to the canvas.
 */
export function LandmarkCanvas({
  landmarks,
  className,
  showBox = true,
  trajectory = false,
  pointRadius = 2.2,
  fit = "stretch",
  background = "none",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const history = useRef<Landmarks68[]>([]);

  useEffect(() => {
    if (!trajectory) history.current = [];
  }, [trajectory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (background === "grid") {
      ctx.strokeStyle = "rgba(100,116,139,0.14)";
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo((w / 8) * i, 0);
        ctx.lineTo((w / 8) * i, h);
        ctx.moveTo(0, (h / 8) * i);
        ctx.lineTo(w, (h / 8) * i);
        ctx.stroke();
      }
    }

    if (!landmarks) return;

    let sx = w;
    let sy = h;
    let ox = 0;
    let oy = 0;
    if (fit === "contain") {
      const s = Math.min(w, h) * 0.86;
      sx = s;
      sy = s;
      ox = (w - s) / 2;
      oy = (h - s) / 2;
    }
    const P = (p: { x: number; y: number }) => ({ x: ox + p.x * sx, y: oy + p.y * sy });

    if (trajectory) {
      history.current.push(landmarks);
      if (history.current.length > 26) history.current.shift();
      history.current.forEach((frame, i) => {
        const alpha = (i / history.current.length) * 0.35;
        ctx.fillStyle = `rgba(37,99,235,${alpha})`;
        for (const idx of [...REGIONS["lipsOuter"]!.idx, ...REGIONS["jaw"]!.idx]) {
          const p = P(frame[idx]!);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    if (showBox) {
      const xs = landmarks.map((p) => P(p).x);
      const ys = landmarks.map((p) => P(p).y);
      const x0 = Math.min(...xs);
      const y0 = Math.min(...ys);
      const x1 = Math.max(...xs);
      const y1 = Math.max(...ys);
      ctx.strokeStyle = "rgba(37,99,235,0.55)";
      ctx.setLineDash([6, 5]);
      ctx.lineWidth = 1.25;
      ctx.strokeRect(x0 - 8, y0 - 12, x1 - x0 + 16, y1 - y0 + 22);
      ctx.setLineDash([]);
    }

    for (const [key, region] of Object.entries(REGIONS)) {
      ctx.strokeStyle = REGION_COLORS[key] ?? "#2563eb";
      ctx.lineWidth = 1.4;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      region.idx.forEach((idx, i) => {
        const p = P(landmarks[idx]!);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      if (region.closed) ctx.closePath();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const [key, region] of Object.entries(REGIONS)) {
      ctx.fillStyle = REGION_COLORS[key] ?? "#2563eb";
      for (const idx of region.idx) {
        const p = P(landmarks[idx]!);
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [landmarks, showBox, trajectory, pointRadius, fit, background]);

  return <canvas ref={canvasRef} className={className} />;
}
