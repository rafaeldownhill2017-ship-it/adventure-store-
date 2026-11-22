import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { CelularPedido, Carimbo, CardNumero, corBloco, Escudo, NotasVoando, PalcoCor, Pedestal, PlanoTexto, Relogio, TOPO_PEDESTAL } from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · libertadores1 · "Quanto custa ir à final da Libertadores com R$ 10 mil" (formato "caixa").
// Dados: docs/dossies/libertadores1.md. Estádio GENÉRICO (sem escudo, sem logo da Conmebol, sem cores de clube).
precarregar(["comercial/building-c", "comercial/building-a", "personagens/character-male-a", "natureza/tree_oak"]);

const E0: V3 = [0, 0, 0];
const E0b: V3 = [15, 0, 0];
const E1: V3 = [30, 0, 0];
const E2: V3 = [60, 0, 0];
const E3: V3 = [90, 0, 0];
const E4: V3 = [120, 0, 0];
const E5: V3 = [150, 0, 0];
const E6: V3 = [180, 0, 0];
const E7: V3 = [210, 0, 0];
const DESTAQUE = /final|Libertadores|ingresso|salário|mínimo|dez|mil|reais|três|dois|um|noventa|dólares|viagem|própria|nove|Estourou|pacote|sete|cabe|sobra|bate-volta|Onze|doze|porra|nominal|golpe|estádio|sofá|Comenta|vídeos|Link|bio/i;

const fmt = (v: number) => Math.round(Math.abs(v)).toLocaleString("pt-BR");

/** Estádio genérico: arquibancada em anel (2 degraus), gramado com linhas, 4 refletores e uma torre alta. */
const Estadio: React.FC<{ p: V3; s?: number; rotY?: number; t?: number; luz?: number }> = ({ p: pos, s = 1, rotY = 0, t = 0, luz = 1 }) => {
  if (s <= 0.002) return null;
  const seg = 30;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      <B s={[2.5, 0.02, 1.8]} p={[0, 0.01, 0]} cor="#2f7a3e" rough={1} />
      {Array.from({ length: 8 }, (_, i) => (
        <B key={i} s={[0.3, 0.012, 1.4]} p={[-1.05 + i * 0.3, 0.026, 0]} cor={i % 2 ? "#3f9a4e" : "#4aa95a"} rough={1} />
      ))}
      <B s={[2.2, 0.006, 0.014]} p={[0, 0.034, -0.7]} cor="#ffffff" />
      <B s={[2.2, 0.006, 0.014]} p={[0, 0.034, 0.7]} cor="#ffffff" />
      <B s={[0.014, 0.006, 1.4]} p={[-1.1, 0.034, 0]} cor="#ffffff" />
      <B s={[0.014, 0.006, 1.4]} p={[1.1, 0.034, 0]} cor="#ffffff" />
      <B s={[0.014, 0.006, 1.4]} p={[0, 0.034, 0]} cor="#ffffff" />
      <mesh position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.26, 36]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {[-1, 1].map((l) => (
        <group key={l} position={[l * 1.1, 0, 0]}>
          <B s={[0.03, 0.2, 0.03]} p={[0, 0.1, -0.22]} cor="#ffffff" />
          <B s={[0.03, 0.2, 0.03]} p={[0, 0.1, 0.22]} cor="#ffffff" />
          <B s={[0.03, 0.03, 0.47]} p={[0, 0.2, 0]} cor="#ffffff" />
        </group>
      ))}
      {[0, 1].map((nivel) =>
        Array.from({ length: seg }, (_, i) => {
          const a = (i / seg) * Math.PI * 2;
          const rx = nivel ? 1.72 : 1.5;
          const rz = nivel ? 1.28 : 1.1;
          return (
            <group key={`${nivel}${i}`} position={[Math.cos(a) * rx, nivel ? 0.27 : 0.1, Math.sin(a) * rz]} rotation={[0, -a + Math.PI / 2, 0]}>
              <B s={[0.38, nivel ? 0.36 : 0.2, 0.22]} cor={i % 3 === 0 ? "#e8ecf2" : i % 3 === 1 ? "#5b7fb5" : "#3f5f95"} />
            </group>
          );
        }),
      )}
      {[
        [-1.75, -1.2],
        [1.75, -1.2],
        [-1.75, 1.2],
        [1.75, 1.2],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <B s={[0.06, 1.0, 0.06]} p={[0, 0.5, 0]} cor="#8a929e" />
          <B s={[0.3, 0.16, 0.06]} p={[0, 1.04, 0]} cor="#2a2f3a" />
          <mesh position={[0, 1.04, z > 0 ? -0.035 : 0.035]}>
            <boxGeometry args={[0.26, 0.12, 0.01]} />
            <meshStandardMaterial color="#fff6d8" emissive="#fff3c4" emissiveIntensity={1.5 * luz} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0.3 + Math.sin(t * 2) * 0.12, 0.1 + Math.abs(Math.sin(t * 3)) * 0.12, 0.1]}>
        <sphereGeometry args={[0.07, 14, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
};

/** Maço de notas: `n` camadas (cada uma = R$ 100). */
const Maco: React.FC<{ p: V3; n: number; s?: number; cor?: string; h?: number }> = ({ p: pos, n, s = 1, cor = "#5fae5a", h = 0.045 }) => (
  <group position={pos} scale={s}>
    {Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => (
      <B key={i} s={[0.5, h * 0.9, 0.26]} p={[((i % 3) - 1) * 0.012, h * 0.45 + i * h, 0]} cor={i % 2 ? cor : "#6dbb5e"} />
    ))}
  </group>
);

/** Ingresso 3D: bilhete com picote e texto. Largura ~0.8 com s=1. */
const Ingresso: React.FC<{ p: V3; rot?: V3; s?: number; cor: string; l1: string; l2: string; l3?: string }> = ({ p: pos, rot = [0, 0, 0], s = 1, cor, l1, l2, l3 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={rot} scale={s}>
      <B s={[0.82, 0.4, 0.025]} cor={cor} />
      <B s={[0.012, 0.4, 0.028]} p={[0.27, 0, 0]} cor="#ffffff" />
      {[-0.15, -0.05, 0.05, 0.15].map((y) => (
        <B key={y} s={[0.025, 0.02, 0.03]} p={[0.27, y, 0]} cor="#2a2f3a" />
      ))}
      <PlanoTexto linhas={l3 ? [[l1, 0.7, "#ffffff"], [l2, 1.2, "#ffffff"], [l3, 0.8, "#ffffff"]] : [[l1, 0.8, "#ffffff"], [l2, 1.3, "#ffffff"]]} fundo={null} tam={[0.5, 0.32]} p={[-0.12, 0, 0.015]} px={[440, 280]} />
      <PlanoTexto linhas={[["⚽", 1, "#ffffff"]]} fundo={null} tam={[0.2, 0.2]} p={[0.55, 0, 0.015]} px={[200, 200]} />
    </group>
  );
};

/** Avião genérico, frente para +x. */
const Aviao: React.FC<{ p: V3; rotY?: number; s?: number; cor?: string; rolo?: number }> = ({ p: pos, rotY = 0, s = 1, cor = "#f4f6f8", rolo = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[rolo, rotY, 0]} scale={s}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.95, 20]} />
        <meshStandardMaterial color={cor} roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh position={[0.52, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.16, 20]} />
        <meshStandardMaterial color={cor} roughness={0.35} />
      </mesh>
      <B s={[0.24, 0.025, 1.0]} p={[0.02, -0.01, 0]} cor="#c9ced6" />
      <B s={[0.1, 0.22, 0.025]} p={[-0.45, 0.14, 0]} cor="#3a78b8" />
      <B s={[0.12, 0.02, 0.34]} p={[-0.45, 0.04, 0]} cor="#c9ced6" />
      {Array.from({ length: 7 }, (_, i) => (
        <B key={i} s={[0.04, 0.035, 0.205]} p={[-0.32 + i * 0.1, 0.03, 0]} cor="#2a3440" />
      ))}
      <B s={[0.9, 0.012, 0.206]} p={[-0.02, -0.04, 0]} cor="#3a78b8" />
    </group>
  );
};

/** Sofá + TV (final): sofá vermelho e televisão com gramado. */
const SofaTV: React.FC<{ p: V3; s?: number }> = ({ p: pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <B s={[1.0, 0.2, 0.45]} p={[0, 0.2, 0.35]} cor="#b8322a" />
    <B s={[1.0, 0.34, 0.1]} p={[0, 0.38, 0.14]} cor="#a02a24" />
    {[-0.55, 0.55].map((x) => (
      <B key={x} s={[0.1, 0.3, 0.45]} p={[x, 0.25, 0.35]} cor="#a02a24" />
    ))}
    <B s={[1.0, 0.06, 0.45]} p={[0, 0.07, 0.35]} cor="#3a281e" />
    <B s={[0.95, 0.55, 0.05]} p={[0, 0.78, -0.35]} cor="#1d2230" />
    <PlanoTexto linhas={[["⚽ AO VIVO", 1, "#ffffff"]]} fundo="#2f8f4a" tam={[0.88, 0.47]} p={[0, 0.78, -0.32]} px={[600, 320]} />
    <B s={[0.5, 0.05, 0.25]} p={[0, 0.28, -0.35]} cor="#3a281e" />
  </group>
);

/** Caixa de "pacote" de agência (papelão com fita). */
const PacoteCaixa: React.FC<{ p: V3; s?: number }> = ({ p: pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <B s={[0.7, 0.45, 0.5]} p={[0, 0.225, 0]} cor="#c9a24a" />
    <B s={[0.72, 0.45, 0.07]} p={[0, 0.225, 0]} cor="#c8262c" />
    <B s={[0.07, 0.46, 0.52]} p={[0, 0.225, 0]} cor="#c8262c" />
    <PlanoTexto linhas={[["PACOTE", 1, "#ffffff"]]} fundo="#1d2230" tam={[0.5, 0.14]} p={[0, 0.3, 0.26]} px={[460, 130]} />
  </group>
);

/** Hotel reconhecível: prédio com janelas, porta e letreiro. Altura ~0.95 com s=1. */
const Hotel: React.FC<{ p: V3; s?: number }> = ({ p: pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <B s={[0.55, 0.85, 0.42]} p={[0, 0.425, 0]} cor="#e8d9b8" />
    <B s={[0.58, 0.05, 0.45]} p={[0, 0.86, 0]} cor="#8a6a4a" />
    {Array.from({ length: 5 }, (_, r) =>
      [-0.17, 0, 0.17].map((x) => <B key={`${r}${x}`} s={[0.1, 0.09, 0.012]} p={[x, 0.25 + r * 0.12, 0.215]} cor={(r + (x > 0 ? 1 : 0)) % 3 === 0 ? "#ffd86a" : "#7fb0d6"} />),
    )}
    <B s={[0.14, 0.18, 0.014]} p={[0, 0.09, 0.215]} cor="#3a281e" />
    <B s={[0.6, 0.02, 0.2]} p={[0, 0.2, 0.3]} cor="#c8262c" />
    <PlanoTexto linhas={[["HOTEL", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.12]} p={[0, 0.98, 0.1]} px={[420, 100]} />
  </group>
);

/** Porta grande com rótulo e emoji; brilha quando `ativo`. Largura ~0.52 com s=1. */
const Porta: React.FC<{ p: V3; s?: number; cor: string; txt: string; emoji: string; ativo: boolean; t: number }> = ({ p: pos, s = 1, cor, txt, emoji, ativo, t }) => {
  if (s <= 0.002) return null;
  const pulso = ativo ? 1 + 0.06 * Math.abs(Math.sin(t * 8)) : 1;
  return (
    <group position={pos} scale={s * pulso}>
      {ativo ? (
        <mesh position={[0, 0.5, -0.04]}>
          <planeGeometry args={[0.75, 1.1]} />
          <meshBasicMaterial color={cor} transparent opacity={0.45} toneMapped={false} />
        </mesh>
      ) : null}
      <B s={[0.56, 1.0, 0.06]} p={[0, 0.5, 0]} cor="#2a2f3a" />
      <B s={[0.46, 0.9, 0.07]} p={[0, 0.47, 0.01]} cor={cor} />
      <PlanoTexto linhas={[[emoji, 1, "#ffffff"]]} fundo={null} tam={[0.36, 0.36]} p={[0, 0.6, 0.05]} px={[300, 300]} />
      <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo="#14211d" tam={[0.52, 0.13]} p={[0, 1.1, 0.04]} px={[480, 120]} />
      <mesh position={[0.17, 0.4, 0.06]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial color="#ffd86a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
};

const HUD: React.FC<{ v: number }> = ({ v }) => {
  const cheio = v > 9999;
  const neg = v < 0;
  const cor = neg ? "#ff5a4e" : cheio ? "#ffffff" : "#9fe08a";
  return (
    <div
      style={{
        position: "absolute",
        top: 245,
        left: 160,
        width: 760,
        background: "rgba(14,18,24,0.9)",
        borderRadius: 28,
        padding: "16px 30px",
        border: `5px solid ${neg ? "#ff5a4e" : cheio ? "#7aa8ff" : "#5ad17a"}`,
        fontFamily: FONT,
        color: "#fff",
        boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.06em", opacity: 0.75 }}>{neg ? "FALTAM" : cheio ? "NO CAIXA" : "SOBRAM"}</div>
      <div style={{ fontSize: 68, fontWeight: 800, letterSpacing: "-0.03em", color: cor, whiteSpace: "nowrap" }}>
        {neg ? "−" : ""}R$ {fmt(v)}
      </div>
    </div>
  );
};

/** Interpola uma lista de [t, valor] com suavização entre pontos. */
const escada = (t: number, pts: [number, number][]) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [t0, v0] = pts[i];
    const [t1, v1] = pts[i + 1];
    if (t >= t0 && t < t1) return v0 === v1 ? v0 : lerp(v0, v1, ease.inOut((t - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};

export const Libertadores1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c, palavras } = useTimeline();
  const sofa = palavras.find((x) => x.w === "sofá?")?.start ?? c.estadio + 0.9;
  const T0b = c.minimo - 2.65;
  const T1 = c.dez - 0.6;
  const T2 = c.tres - 0.5;
  const T3 = c.viagem - 0.6;
  const T4 = c.pacote - 0.4;
  const T5 = c.bateVolta - 0.4;
  const T6 = c.cuidado - 0.2;
  const T7 = c.estadio - 0.5;

  // caixa: as viradas (reset para 10.000) são instantâneas, sem valores intermediários na tela
  const caixa = escada(t, [
    [0, 10000],
    [c.nove - 0.15, 10000],
    [c.nove + 2.3, 700],
    [c.soma + 1.4, 700],
    [c.estourou - 0.5, -783],
    [T4 + 0.1, -783],
    [T4 + 0.13, 10000],
    [c.sete - 0.15, 10000],
    [c.sete + 1.8, 2021],
    [T5 - 0.3, 2021],
    [T5 - 0.27, 10000],
    [c.onze - 0.1, 10000],
    [c.onze + 1.5, -1912],
    [1e9, -1912],
  ]);
  const hud = t >= T1 + 0.2 && t < T6 - 0.1;
  const topoEm = (x: number) => (x >= T1 - 0.05 && x < T6 - 0.1 ? 470 : 250);

  const cam = (x: number, y: number, z: number, ly: number, lz = 0): [V3, V3] => [[x, y, z], [x, ly, lz]];
  const defs: [number, V3, [V3, V3]][] = [
    [0, E0, cam(E0[0], 1.9, 3.4, 0.12, -0.1)],
    [T0b, E0b, cam(E0b[0], 1.1, 3.0, 0.45)],
    [T1, E1, cam(E1[0], 1.1, 3.2, 0.45)],
    [T2, E2, cam(E2[0], 1.15, 3.1, 0.42)],
    [T3, E3, cam(E3[0], 1.45, 3.3, 0.42)],
    [T4, E4, cam(E4[0], 1.4, 3.2, 0.42)],
    [T5, E5, cam(E5[0], 1.45, 3.3, 0.45)],
    [T6, E6, cam(E6[0], 1.1, 3.1, 0.45)],
    [T7, E7, cam(E7[0], 1.1, 3.3, 0.48)],
  ];
  const blocos: [number, V3, V3, V3][] = defs.map(([t0, o, [pos, look]]) => [t0, o, pos, look]);
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0] + (i % 2 ? -0.12 : 0.12), pos[1] - 0.08, pos[2] * 0.94], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#1f4a3a"],
      [T0b, "#2a4a5a"],
      [T1, "#2a3a5a"],
      [T2, "#3a3a6a"],
      [T3, "#2f5f8a"],
      [T4, "#2f6a4a"],
      [T5, "#6a2a2e"],
      [T6, "#4a2a5a"],
      [T7, "#2f8f5b"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  // ingressos, um de cada vez
  const tks: [string, string, string, number, number][] = [
    ["#2f78c8", "CATEGORIA 3", "US$ 95", c.tres - 0.3, 6],
    ["#d9a21e", "CATEGORIA 2", "US$ 250", c.dois - 0.3, 15],
    ["#c8262c", "CATEGORIA 1", "US$ 340", c.doisMil - 0.5, 20],
  ];

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: T0b - 0.1, titulo: "FINAL DA LIBERTADORES", valor: "sáb 28/11 · 17h ⚽", cor: C.destaque },
    { de: c.minimo - 2.55, ate: c.minimo - 0.45, titulo: "INGRESSO DA CATEGORIA 1", valor: "≈ R$ 2.016", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.minimo - 0.3, ate: T1 - 0.1, titulo: "SALÁRIO MÍNIMO 2026", valor: "R$ 1.621" },
    { de: T1 + 0.1, ate: c.dez + 2.3, titulo: "IMAGINA QUE VOCÊ TEM", valor: "R$ 10 mil", cor: C.destaque },
    { de: c.tres - 0.3, ate: c.dois - 0.35, titulo: "CAT. 3 · SÓ TORCIDA DOS FINALISTAS", valor: "US$ 95 ≈ R$ 563" },
    { de: c.dois - 0.2, ate: c.doisMil - 0.55, titulo: "CATEGORIA 2", valor: "US$ 250 ≈ R$ 1.483" },
    { de: c.doisMil - 0.4, ate: T3 - 0.2, titulo: "CATEGORIA 1", valor: "US$ 340 ≈ R$ 2.016", cor: C.destaque },
    { de: T3 + 0.1, ate: c.propria - 0.2, titulo: "AGORA A VIAGEM", valor: "Montevidéu ✈️" },
    { de: c.propria - 0.1, ate: c.nove - 0.3, titulo: "POR CONTA PRÓPRIA", valor: "estimativa de outubro" },
    { de: c.nove - 0.2, ate: c.soma - 0.2, titulo: "PASSAGEM + HOTEL (EST. OUT/2026)", valor: "≈ R$ 9.300" },
    { de: c.soma - 0.1, ate: c.soma + 1.3, titulo: "+ INGRESSO DA CATEGORIA 2", valor: "≈ R$ 1.483" },
    { de: c.soma + 1.4, ate: c.estourou - 0.2, titulo: "TOTAL", valor: "R$ 10.783", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T4 + 0.1, ate: c.sete - 0.2, titulo: "PACOTE DE AGÊNCIA", valor: "voo + 3 noites + ingresso" },
    { de: c.sete - 0.1, ate: c.cabe - 0.1, titulo: "A PARTIR DE", valor: "R$ 7.979", cor: C.destaque },
    { de: c.cabe + 0.3, ate: T5 - 0.15, titulo: "SOBRAM", valor: "R$ 2.021", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T5 + 0.1, ate: c.onze - 0.2, titulo: "BATE-VOLTA · VOO FRETADO", valor: "mesmo dia" },
    { de: c.onze - 0.1, ate: c.porra - 0.3, titulo: "BATE-VOLTA · INGRESSO A CONFIRMAR", valor: "R$ 11.912", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T6 + 0.1, ate: c.golpe - 1.6, titulo: "CUIDADO", valor: "ingresso é nominal", cor: C.destaque },
    { de: c.golpe - 1.5, ate: c.golpe - 0.15, titulo: "OFERTA EM REDE SOCIAL", valor: "é golpe", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T7 + 0.1, ate: c.comenta - 0.4, titulo: "COM SEUS R$ 10 MIL", valor: "estádio ou sofá?", cor: C.destaque },
    { de: c.comenta - 0.2, ate: c.fim - 1.6, titulo: "COMENTA", valor: "ESTÁDIO ou SOFÁ", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.2}>
        {/* 0: estádio visto de cima */}
        {em(0) ? (
          <group position={E0}>
            <Estadio p={[0, 0, 0]} s={0.3 * mola(0.0, 200, 12)} rotY={Math.sin(t * 0.5) * 0.3} t={t} />
          </group>
        ) : null}

        {/* 1: ingresso cat. 1 × salário mínimo (maços lado a lado) */}
        {em(1) ? (
          <group position={[E0b[0], 0.22, 0]} scale={0.6}>
            <group position={[0.24, 0, 0.1]} scale={Math.min(1, mola(c.minimo - 2.55, 220, 12))}>
              <Maco p={[0, 0, 0]} n={20 * ease.out(p(t, c.minimo - 2.5, 1.2))} s={0.8} cor="#d9a21e" h={0.03} />
              <PlanoTexto linhas={[["INGRESSO CAT. 1", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.1]} p={[0, 0.58, 0.2]} px={[480, 100]} />
            </group>
            {t >= c.minimo - 0.7 ? (
              <group position={[-0.24, 0, 0.1]} scale={Math.min(1, mola(c.minimo - 0.7, 220, 12))}>
                <Maco p={[0, 0, 0]} n={16 * ease.out(p(t, c.minimo - 0.65, 0.9))} s={0.8} h={0.03} />
                <PlanoTexto linhas={[["SAL. MÍNIMO", 1, "#ffffff"]]} fundo="#2a7f4f" tam={[0.5, 0.1]} p={[0, 0.5, 0.2]} px={[480, 100]} />
              </group>
            ) : null}
          </group>
        ) : null}

        {/* 2: você tem R$ 10 mil */}
        {em(2) ? (
          <group position={[E1[0], 0.22, 0]} scale={0.6}>
            {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
              <Maco key={x} p={[x, 0, -0.1]} n={14} s={0.45 * mola(T1 + 0.05 + i * 0.08, 220, 12)} />
            ))}
            <Boneco url="personagens/character-male-a" p={[0, 0, 0.5]} rotY={0} altura={0.62} anim={t >= c.dez + 2.3 ? "interact-right" : "idle"} tAnim={t} s={mola(T1, 220, 12)} />
            <NotasVoando de={[0, 0.9, 0.3]} k={p(t, T1, 2.2, (x) => x)} n={14} alcance={1.0} />
          </group>
        ) : null}

        {/* 3: os 3 ingressos, um de cada vez, com maço proporcional */}
        {em(3) ? (
          <group position={[E2[0], 0.22, 0]} scale={0.6}>
            {tks.map(([cr, l1, l2, t0, n], i) => {
              const fim = i < tks.length - 1 ? tks[i + 1][3] : T3 + 0.1;
              if (t < t0 - 0.05 || t > fim + 0.3) return null;
              const sai = 1 - p(t, fim - 0.1, 0.3, ease.in);
              const e = mola(t0, 220, 12) * sai;
              return (
                <group key={l1} scale={e}>
                  <Ingresso p={[-0.26, 0.3, 0.2]} rot={[0, 0.25 + Math.sin(t * 1.5) * 0.08, 0.03]} s={0.85} cor={cr} l1={l1} l2={l2} />
                  <Maco p={[0.42, 0, 0.2]} n={n * ease.out(p(t, t0 + 0.1, 0.8))} s={0.7} h={0.03} />
                </group>
              );
            })}
          </group>
        ) : null}

        {/* 4: conta própria: avião cruza, hotel, ingresso cat. 2 */}
        {em(4) ? (
          <group position={[E3[0], 0.22, 0]} scale={0.6}>
            <Hotel p={[0.35, 0, -0.05]} s={0.7 * mola(T3 + 0.1, 220, 12)} />
            <Aviao p={[lerp(-1.0, -0.05, ease.out(p(t, T3, 3.0))), 0.58 + 0.08 * Math.sin(p(t, T3, 3.0) * Math.PI), 0.2]} s={0.85} rolo={Math.sin(t * 1.2) * 0.06} />
            {t >= c.soma - 0.5 ? <Ingresso p={[-0.28, 0.1, 0.7]} rot={[0, 0.1, 0.03]} s={0.62 * mola(c.soma - 0.5, 220, 12)} cor="#d9a21e" l1="CATEGORIA 2" l2="≈ R$ 1.483" /> : null}
            <Maco p={[-0.55, 0, 0.3]} n={93 * ease.out(p(t, c.nove, 2.0))} s={0.4} h={0.0075} />
          </group>
        ) : null}

        {/* 5: pacote */}
        {em(5) ? (
          <group position={[E4[0], 0.22, 0]} scale={0.6}>
            <PacoteCaixa p={[-0.1, 0, 0.1]} s={0.95 * mola(T4 + 0.1, 220, 12)} />
            <Aviao p={[0.25 + Math.cos(t * 1.2) * 0.1, 0.62 + Math.sin(t * 1.5) * 0.04, -0.1]} s={0.5 * mola(c.pacote + 0.3, 220, 12)} rotY={0.3} />
            <Ingresso p={[-0.1, 0.55 + 0.05 * Math.sin(t * 2), 0.2]} rot={[0, 0, -0.3]} s={0.45 * mola(c.pacote + 1.2, 220, 12)} cor="#d9a21e" l1="CATEGORIA 2" l2="INCLUSO" />
            <Pedestal p={[0, -0.02, 0.1]} raio={0.7} alt={0.02} aro="#3aff7a" acende={p(t, c.cabe - 0.2, 0.5)} />
          </group>
        ) : null}

        {/* 6: bate-volta */}
        {em(6) ? (
          <group position={[E5[0], 0.22, 0]} scale={0.6}>
            <Aviao p={[lerp(-0.5, 0.4, ease.inOut(p(t, T5, 4.6))), 0.55 + 0.1 * Math.sin(p(t, T5, 4.6) * Math.PI), 0.1]} s={0.9} rolo={Math.sin(t * 1.4) * 0.06} />
            <Relogio p={[-0.38, 0, 0.55]} s={0.55 * mola(c.bateVolta, 220, 12)} t={t} vel={10} />
            <PlanoTexto linhas={[["MESMO DIA", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.11]} p={[0.25, 0.1, 0.6]} px={[480, 104]} />
          </group>
        ) : null}

        {/* 7: golpe: ingresso nominal → oferta no celular (X vermelho) → canal oficial */}
        {em(7) ? (
          <group position={[E6[0], 0.22, 0]} scale={0.6}>
            {(() => {
              const k = ease.inOut(p(t, c.golpe - 1.7, 0.5));
              return <Ingresso p={[lerp(0, -0.33, k), lerp(0.3, 0.5, k), 0.3]} rot={[0, 0.2, 0.03]} s={lerp(0.85, 0.5, k) * mola(T6, 220, 12)} cor="#2f78c8" l1="INGRESSO NOMINAL" l2="SEU NOME" l3="DIGITAL" />;
            })()}
            {t >= c.golpe - 1.7 ? <CelularPedido p={[0.28, 0, 0.4]} rotY={-0.2} s={0.78 * mola(c.golpe - 1.7, 220, 12)} k={p(t, c.golpe - 1.5, 1.0, (x) => x)} linhas={["Vendo ingresso da final!", "Pix agora 😉"]} cor="#c8262c" /> : null}
            {t >= c.golpe - 0.1 ? (
              <group position={[0.28, 0.38, 0.8]} scale={mola(c.golpe - 0.1, 260, 12)}>
                <B s={[0.5, 0.06, 0.03]} r={[0, 0, Math.PI / 4]} cor="#e0262c" />
                <B s={[0.5, 0.06, 0.03]} r={[0, 0, -Math.PI / 4]} cor="#e0262c" />
              </group>
            ) : null}
            {t >= c.golpe + 0.5 ? <Escudo p={[-0.35, 0, 0.9]} s={0.38 * mola(c.golpe + 0.5, 220, 12)} txt="CANAL OFICIAL" gira={t} /> : null}
          </group>
        ) : null}

        {/* 8: duas portas: estádio × sofá */}
        {em(8) ? (
          <group position={[E7[0], 0.22, 0]} scale={0.6}>
            <Porta p={[-0.3, 0, 0]} s={0.62 * mola(T7 + 0.1, 220, 12)} cor="#2f78c8" txt="ESTÁDIO" emoji="🏟️" ativo={t >= c.estadio - 0.05 && t < c.estadio + 1.0} t={t} />
            <Porta p={[0.3, 0, 0]} s={0.62 * mola(T7 + 0.25, 220, 12)} cor="#c8262c" txt="SOFÁ" emoji="🛋️" ativo={t >= sofa - 0.05 && t < sofa + 1.0} t={t} />
          </group>
        ) : null}
      </PalcoCor>

      {hud ? <HUD v={caixa} /> : null}

      {/* câmbio sempre visível durante os ingressos */}
      {t >= c.tres - 0.45 && t < T3 ? (
        <div style={{ position: "absolute", top: 722, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: "#ffffff", background: "rgba(14,18,24,0.75)", padding: "8px 26px", borderRadius: 999 }}>CÂMBIO 19/11 · US$ 1 = R$ 5,93</div>
        </div>
      ) : null}

      {/* cards: nunca dois ao mesmo tempo (cada um sai antes de o próximo entrar) */}
      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={topoEm(k.de)} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      <Carimbo t={t} de={c.dez + 2.1} ate={T2 - 0.3} txt="DÁ?" top={topoEm(c.dez) + 250} />
      <Carimbo t={t} de={c.estourou - 0.1} ate={T4 - 0.1} txt="ESTOUROU!" top={topoEm(c.estourou) + 250} />
      <Carimbo t={t} de={c.cabe - 0.1} ate={T5 - 0.3} txt="CABE!" cor="#2a9a5a" top={topoEm(c.cabe) + 250} />
      <Carimbo t={t} de={c.porra - 0.35} ate={T6 - 0.05} txt="FALTA R$ 1.912" top={topoEm(c.porra) + 250} />
      <Carimbo t={t} de={c.golpe - 0.1} ate={T7 - 0.1} txt="GOLPE!" top={300} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Flash at={c.porra} cor="#ff3b30" max={0.22} />
      <Grain />
    </AbsoluteFill>
  );
};
