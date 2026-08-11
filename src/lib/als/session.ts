/**
 * Frontend-only session store.
 *
 * Holds the demo session state (selected task, recording metadata, mock
 * result). Replace `runAnalysis()` with a fetch to a Python/PyTorch service
 * when a real backend is added — nothing else in the UI needs to change.
 */
import { useSyncExternalStore } from "react";
import type { Landmarks68 } from "./landmarks";
import type { DemoResult } from "./mock-results";

export type SessionState = {
  taskId: string | null;
  recordingDurationMs: number;
  recordingUrl: string | null;
  hasRecording: boolean;
  sequence: Landmarks68[]; // (20, 68, 2)
  result: DemoResult | null;
};

const initial: SessionState = {
  taskId: null,
  recordingDurationMs: 0,
  recordingUrl: null,
  hasRecording: false,
  sequence: [],
  result: null,
};

let state: SessionState = initial;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function setSession(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  emit();
}

export function resetSession() {
  if (state.recordingUrl) URL.revokeObjectURL(state.recordingUrl);
  state = initial;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useSession(): SessionState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export function getSession() {
  return state;
}
