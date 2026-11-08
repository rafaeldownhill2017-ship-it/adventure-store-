import { createContext, useContext } from "react";
import { Easing, useCurrentFrame, useVideoConfig } from "remotion";

export type Palavra = { w: string; start: number; end: number };
export type Timeline = {
  id: string;
  duracao: number;
  fimVoz: number;
  cues: Record<string, number>;
  palavras: Palavra[];
};

export const TimelineCtx = createContext<Timeline | null>(null);
export const useTimeline = () => {
  const t = useContext(TimelineCtx);
  if (!t) throw new Error("Timeline ausente");
  return t;
};

/** Tempo atual do filme em segundos. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
};

/** Progresso 0..1 entre a e a+dur, com curva. */
export const p = (t: number, a: number, dur: number, curve: (x: number) => number = ease.out) =>
  curve(clamp01((t - a) / dur));

/** Janela: entra em a, sai em b (com rampas de entrada/saída). */
export const win = (t: number, a: number, b: number, rampIn = 0.35, rampOut = 0.35) =>
  Math.min(p(t, a, rampIn), 1 - p(t, b - rampOut, rampOut, ease.in));

/** Ruído determinístico 0..1 por índice. */
export const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
