import { useCallback, useEffect, useRef, useState } from "react";

export interface SpeechFrame {
  timestampMs: number;
  rms: number;
  pitchHz: number | null;
}

export interface DDKSummary {
  rateHz: number;
  peakCount: number;
  rhythmVariability: number | null;
}

export interface UseSpeechFeaturesOptions {
  minPeakIntervalMs?: number;
  energyThreshold?: number;
  fftSize?: number;
}

export interface UseSpeechFeaturesResult {
  isReady: boolean;
  error: string | null;
  isRecording: boolean;
  frames: SpeechFrame[];
  ddkSummary: DDKSummary;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
}

function estimatePitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i]! * buffer[i]!;
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  const MIN_HZ = 75;
  const MAX_HZ = 400;
  const maxLag = Math.floor(sampleRate / MIN_HZ);
  const minLag = Math.floor(sampleRate / MAX_HZ);

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag && lag < SIZE; lag++) {
    let corr = 0;
    for (let i = 0; i < SIZE - lag; i++) corr += buffer[i]! * buffer[i + lag]!;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return null;
  return sampleRate / bestLag;
}

export function useSpeechFeatures(options: UseSpeechFeaturesOptions = {}): UseSpeechFeaturesResult {
  const { minPeakIntervalMs = 120, energyThreshold = 0.08, fftSize = 2048 } = options;

  const [isReady] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [frames, setFrames] = useState<SpeechFrame[]>([]);
  const [ddkSummary, setDdkSummary] = useState<DDKSummary>({
    rateHz: 0,
    peakCount: 0,
    rhythmVariability: null,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastPeakTimeRef = useRef<number>(-Infinity);
  const peakTimestampsRef = useRef<number[]>([]);
  const wasAboveThresholdRef = useRef<boolean>(false);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    const audioCtx = audioCtxRef.current;
    if (!analyser || !audioCtx) return;

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    let sumSquares = 0;
    for (let i = 0; i < buffer.length; i++) sumSquares += buffer[i]! * buffer[i]!;
    const rms = Math.sqrt(sumSquares / buffer.length);
    const pitchHz = estimatePitch(buffer, audioCtx.sampleRate);

    const now = performance.now();
    const timestampMs = now - startTimeRef.current;
    setFrames((prev) => [...prev, { timestampMs, rms, pitchHz }]);

    const above = rms > energyThreshold;
    if (above && !wasAboveThresholdRef.current && now - lastPeakTimeRef.current > minPeakIntervalMs) {
      lastPeakTimeRef.current = now;
      peakTimestampsRef.current.push(now);

      const peaks = peakTimestampsRef.current;
      const elapsedS = (now - startTimeRef.current) / 1000;
      const rateHz = elapsedS > 0 ? peaks.length / elapsedS : 0;

      let rhythmVariability: number | null = null;
      if (peaks.length >= 3) {
        const intervals: number[] = [];
        for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i]! - peaks[i - 1]!);
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
        const std = Math.sqrt(variance);
        rhythmVariability = mean > 0 ? std / mean : null;
      }

      setDdkSummary({ rateHz, peakCount: peaks.length, rhythmVariability });
    }

    wasAboveThresholdRef.current = above;
    rafRef.current = requestAnimationFrame(tick);
  }, [energyThreshold, minPeakIntervalMs]);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx: AudioContext = new AudioContextCtor();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = fftSize;
      source.connect(analyser);
      analyserRef.current = analyser;

      startTimeRef.current = performance.now();
      lastPeakTimeRef.current = -Infinity;
      peakTimestampsRef.current = [];
      wasAboveThresholdRef.current = false;

      setIsRecording(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setError(`Microphone access failed: ${String(e)}`);
    }
  }, [fftSize, tick]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    setFrames([]);
    peakTimestampsRef.current = [];
    setDdkSummary({ rateHz: 0, peakCount: 0, rhythmVariability: null });
  }, []);

  useEffect(() => stop, [stop]);

  return { isReady, error, isRecording, frames, ddkSummary, start, stop, reset };
}
