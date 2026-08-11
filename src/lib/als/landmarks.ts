/**
 * Facial landmark utilities.
 *
 * The browser layer only *extracts and visualises* landmarks.
 * No classification happens here — a Python/PyTorch service can consume
 * the exact same `(T, 68, 2)` tensor produced by `buildSequence()`.
 */

export type Point = { x: number; y: number };
export type Landmarks68 = Point[]; // length 68

/** MediaPipe FaceMesh (478 pts) -> classic 68-point dlib-style layout. */
export const MEDIAPIPE_TO_68: number[] = [
  // jaw (0-16)
  127, 234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365,
  // right eyebrow (17-21)
  70, 63, 105, 66, 107,
  // left eyebrow (22-26)
  336, 296, 334, 293, 300,
  // nose bridge (27-30)
  168, 197, 5, 4,
  // nostrils (31-35)
  75, 97, 2, 326, 305,
  // right eye (36-41)
  33, 160, 158, 133, 153, 144,
  // left eye (42-47)
  362, 385, 387, 263, 373, 380,
  // outer lips (48-59)
  61, 39, 37, 0, 267, 269, 291, 405, 314, 17, 84, 181,
  // inner lips (60-67)
  78, 82, 13, 312, 308, 317, 14, 87,
];

export const REGIONS: Record<string, { label: string; idx: number[]; closed: boolean }> = {
  jaw: { label: "Jaw", idx: range(0, 16), closed: false },
  browR: { label: "Eyebrows", idx: range(17, 21), closed: false },
  browL: { label: "Eyebrows", idx: range(22, 26), closed: false },
  noseBridge: { label: "Nose", idx: range(27, 30), closed: false },
  nostrils: { label: "Nose", idx: range(31, 35), closed: false },
  eyeR: { label: "Eyes", idx: range(36, 41), closed: true },
  eyeL: { label: "Eyes", idx: range(42, 47), closed: true },
  lipsOuter: { label: "Mouth", idx: range(48, 59), closed: true },
  lipsInner: { label: "Mouth", idx: range(60, 67), closed: true },
};

export const REGION_COLORS: Record<string, string> = {
  jaw: "#2563eb",
  browR: "#0ea5e9",
  browL: "#0ea5e9",
  noseBridge: "#14b8a6",
  nostrils: "#14b8a6",
  eyeR: "#6366f1",
  eyeL: "#6366f1",
  lipsOuter: "#e11d48",
  lipsInner: "#f97316",
};

function range(a: number, b: number) {
  const out: number[] = [];
  for (let i = a; i <= b; i++) out.push(i);
  return out;
}

/** Bounding-box normalisation -> every coordinate lands in [0, 1]. */
export function normalizeBoundingBox(pts: Landmarks68): Landmarks68 {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const w = Math.max(maxX - minX, 1e-6);
  const h = Math.max(maxY - minY, 1e-6);
  return pts.map((p) => ({ x: (p.x - minX) / w, y: (p.y - minY) / h }));
}

export function boundingBox(pts: Landmarks68) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/** Uniformly resample a landmark stream into the T-frame model input. */
export function buildSequence(frames: Landmarks68[], T = 20): Landmarks68[] {
  if (frames.length === 0) return [];
  const out: Landmarks68[] = [];
  for (let i = 0; i < T; i++) {
    const src = Math.min(frames.length - 1, Math.round((i / (T - 1)) * (frames.length - 1)));
    out.push(normalizeBoundingBox(frames[src]!));
  }
  return out;
}

/** Deterministic synthetic face used when no camera landmarks are available. */
export function syntheticFace(t: number, open = 0): Landmarks68 {
  const pts: Landmarks68 = [];
  const cx = 0.5;
  const cy = 0.52;
  const rx = 0.26;
  const ry = 0.34;
  const wob = Math.sin(t * 1.6) * 0.006;

  // jaw
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (0.08 + (i / 16) * 0.84);
    pts.push({ x: cx - Math.cos(a) * rx + wob, y: cy + Math.sin(a) * ry * 0.95 });
  }
  // eyebrows
  for (let i = 0; i < 5; i++)
    pts.push({ x: cx - 0.17 + i * 0.045, y: cy - 0.2 - Math.sin((i / 4) * Math.PI) * 0.03 + wob });
  for (let i = 0; i < 5; i++)
    pts.push({ x: cx + 0.035 + i * 0.045, y: cy - 0.2 - Math.sin((i / 4) * Math.PI) * 0.03 + wob });
  // nose bridge
  for (let i = 0; i < 4; i++) pts.push({ x: cx + wob, y: cy - 0.15 + i * 0.06 });
  // nostrils
  for (let i = 0; i < 5; i++) pts.push({ x: cx - 0.055 + i * 0.0275 + wob, y: cy + 0.1 });
  // eyes
  const eye = (ex: number) => {
    const ey = cy - 0.11;
    const er = 0.055;
    const eh = 0.024;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      pts.push({ x: ex + Math.cos(a) * er + wob, y: ey + Math.sin(a) * eh });
    }
  };
  eye(cx - 0.11);
  eye(cx + 0.11);
  // lips
  const my = cy + 0.2;
  const mw = 0.11 + open * 0.02;
  const mh = 0.035 + open * 0.05;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * mw + wob, y: my + Math.sin(a) * mh });
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * mw * 0.62 + wob, y: my + Math.sin(a) * mh * 0.55 });
  }
  return pts;
}
