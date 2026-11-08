import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { C, FONT, MARCA } from "../brand";
import { clamp01, ease, p, useT, useTimeline } from "./time";
import { FAIXA_LEGENDA } from "./telaSegura";

type V3 = [number, number, number];

/** Mola determinística: `mola(t0)` vai de 0 a 1 (com leve sobra) a partir de t0 segundos. */
export const useMola = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (t0: number, rig = 150, am = 14) => (frame < t0 * fps ? 0 : spring({ frame: frame - t0 * fps, fps, config: { damping: am, stiffness: rig, mass: 0.8 } }));
};

/** Material simples com cache (cor chapada, bom para "maquete"). */
const cache = new Map<string, THREE.MeshStandardMaterial>();
export const mat = (cor: string, rough = 0.75) => {
  const k = `${cor}-${rough}`;
  if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color: cor, roughness: rough, flatShading: true }));
  return cache.get(k)!;
};

/** Caixa com sombra: o tijolo de qualquer peça feita em código. */
export const B: React.FC<{ s: V3; p?: V3; r?: V3; cor: string; rough?: number }> = ({ s, p = [0, 0, 0], r = [0, 0, 0], cor, rough }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow material={mat(cor, rough)}>
    <boxGeometry args={s} />
  </mesh>
);

/**
 * LEGENDA GRANDE, UMA PALAVRA POR VEZ, no centro (faixa segura). É a única camada de texto
 * "falado" do vídeo: nada de karaokê + faixa escura + cartões competindo.
 * `destaque` é uma regex com as palavras que ficam na cor de destaque.
 */
export const PalavraGrande: React.FC<{ ate?: number; destaque?: RegExp; y?: number }> = ({ ate = 1e9, destaque, y = FAIXA_LEGENDA[0] + 35 }) => {
  const t = useT();
  const { palavras } = useTimeline();
  if (t > ate) return null;
  const i = palavras.findIndex((pw, k) => t >= pw.start - 0.04 && t < (palavras[k + 1]?.start ?? pw.end + 0.4) - 0.04);
  if (i < 0) return null;
  const txt = palavras[i].w.replace(/[.,:;!?]+$/, "");
  const k = clamp01((t - palavras[i].start + 0.04) / 0.12);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center" }}>
      <span
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: txt.length > 11 ? 92 : 112,
          letterSpacing: "-0.03em",
          color: destaque?.test(txt) ? C.destaque : "#ffffff",
          WebkitTextStroke: "10px rgba(10,14,12,0.9)",
          paintOrder: "stroke fill",
          textShadow: "0 8px 24px rgba(0,0,0,0.35)",
          transform: `scale(${0.86 + 0.14 * ease.out(k)})`,
        }}
      >
        {txt}
      </span>
    </div>
  );
};

/** Flash radial de corte: dá "peso" à troca de estação. */
export const Flash: React.FC<{ at: number; dur?: number; cor?: string; max?: number }> = ({ at, dur = 0.35, cor = "#ffffff", max = 0.35 }) => {
  const t = useT();
  const k = clamp01((t - at) / dur);
  if (t < at || k >= 1) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at 50% 52%, ${cor} 0%, transparent 72%)`, opacity: (1 - k) ** 2 * max, mixBlendMode: "screen" }} />;
};

/** Grão de filme determinístico (sutil). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Selo fixo no topo (ex.: "PARTE 1/3" ou o nome da série). Fica dentro da margem segura. */
export const Selo: React.FC<{ txt: string }> = ({ txt }) => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "10px 28px", borderRadius: 99, background: "rgba(10,14,12,0.78)", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: "0.08em" }}>{txt}</div>
  </div>
);

/** Fecho: marca + frase + chamada. Entra por cima de tudo. */
export const Fecho: React.FC<{ at: number; marca?: { nome: string; linha: string; cta: string } }> = ({ at, marca = MARCA }) => {
  const t = useT();
  const mola = useMola();
  if (t < at - 0.05) return null;
  const fe = mola(at + 0.25, 90, 15);
  const fw = p(t, at + 0.6, 0.7);
  const fl = p(t, at + 1.1, 0.7);
  return (
    <AbsoluteFill style={{ background: C.paper, opacity: p(t, at - 0.05, 0.4) }}>
      <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: FONT, transform: `scale(${0.8 + 0.2 * Math.min(1, fe)})` }}>
        <div style={{ fontSize: 130, fontWeight: 800, letterSpacing: "-0.04em", color: C.ink, opacity: fw, transform: `translateY(${(1 - fw) * 30}px)` }}>{marca.nome}</div>
        <div style={{ margin: "34px auto 0", width: 120 * fl, height: 5, background: C.primaria, borderRadius: 3 }} />
        <div style={{ marginTop: 34, padding: "0 90px", fontSize: 42, fontWeight: 600, lineHeight: 1.35, color: C.ink, opacity: fl * 0.8 }}>{marca.linha}</div>
        <div style={{ display: "inline-block", marginTop: 60, padding: "18px 38px", borderRadius: 99, background: C.primaria, color: C.paper, fontSize: 36, fontWeight: 700, opacity: p(t, at + 1.8, 0.6) }}>{marca.cta}</div>
      </div>
    </AbsoluteFill>
  );
};
