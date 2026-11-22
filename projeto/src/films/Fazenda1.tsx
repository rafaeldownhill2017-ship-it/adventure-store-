import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, NotasVoando, PalcoCor, Pedestal, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { clamp01, ease, hash, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Bandeira, Picape } from "./Picape1";

// PESO NO BOLSO · fazenda1 · "5 milhões de dólares: virar fazendeiro nos EUA ou no Brasil?"
// História em 1ª pessoa ("imagina que você"), com caixa que zera e lavoura que enche (formato "caixa").
// Dados: docs/dossies/fazenda1.md (USDA 2026, Scot Consultoria set/2026, Conab/USDA mai/2026). Médias nacionais.
precarregar(["carros/tractor", "carros/truck", "natureza/tree_oak", "natureza/tree_default", "personagens/character-male-a"]);

const PR: V3 = [0, 0, 0]; // prêmio + encruzilhada
const US: V3 = [30, 0, 0]; // fazenda nos EUA
const BR: V3 = [60, 0, 0]; // fazenda no Brasil
const LD: V3 = [90, 0, 0]; // lado a lado (chuva + colheita)
const FI: V3 = [120, 0, 0]; // fecho
const DESTAQUE = /cinco|milhões|dólares|fazendeiro|Estados|Unidos|Brasil|picape|contrato|quinze|trezentos|volta|fita|quarenta|seis|setecentos|dobro|chuva|soja|três|colheita|mil|porra|média|Comenta|vídeos|faturar|link|bio/i;

const TILE = 0.1;
const GAP = 0.006;

/** Lavoura em grade: `n` lotes visíveis (de `total`), cada um passando de capim → terra → soja crescendo. */
const Lavoura: React.FC<{ p: V3; cols: number; total: number; n: number; soja: number; seed?: number; cerca?: boolean }> = ({ p: pos, cols, total, n, soja, seed = 0, cerca = true }) => {
  const rows = Math.ceil(total / cols);
  const W = cols * (TILE + GAP);
  const D = rows * (TILE + GAP);
  const lotes = [];
  const maxD = cols + rows;
  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / cols);
    const cc = i % cols;
    // onda diagonal: começa no canto de baixo à direita e varre até o de cima à esquerda
    const ordem = ((cols - 1 - cc) + (rows - 1 - r)) / maxD; // 0..1
    const k = clamp01((n / total) * 1.25 * maxD - ordem * maxD);
    if (k <= 0) continue;
    const x = -W / 2 + cc * (TILE + GAP) + TILE / 2;
    const z = -D / 2 + r * (TILE + GAP) + TILE / 2;
    const pop = ease.back(k);
    const cresce = clamp01(soja * 1.2 - hash(i + seed) * 0.2);
    const corTerra = cresce > 0.05 ? "#6b4a2e" : "#8a5a34";
    lotes.push(
      <group key={i} position={[x, 0, z]} scale={[pop, 1, pop]}>
        <B s={[TILE, 0.02 + 0.01 * k, TILE]} p={[0, 0.01, 0]} cor={corTerra} rough={0.95} />
        {cresce > 0.02
          ? [-0.025, 0.025].map((dx) => <B key={dx} s={[0.018, 0.05 * cresce, TILE * 0.85]} p={[dx, 0.02 + 0.025 * cresce, 0]} cor={cresce > 0.85 ? "#3f8f2f" : "#5fb04a"} />)
          : null}
      </group>,
    );
  }
  return (
    <group position={pos}>
      <B s={[W + 0.2, 0.01, D + 0.2]} p={[0, 0.005, 0]} cor="#7cbf5a" rough={1} />
      {lotes}
      {cerca
        ? [
            [0, -D / 2 - 0.08, W + 0.16, 0.02],
            [0, D / 2 + 0.08, W + 0.16, 0.02],
          ].map(([x, z, w, d], i) => <B key={i} s={[w, 0.06, d]} p={[x, 0.04, z]} cor="#e8e2d6" />)
        : null}
    </group>
  );
};

/** Estrada cinza com faixa tracejada (ao longo de x se `eixo`="x"). */
const Estrada: React.FC<{ p: V3; len: number; eixo?: "x" | "z" }> = ({ p: pos, len, eixo = "x" }) => (
  <group position={pos} rotation={[0, eixo === "z" ? Math.PI / 2 : 0, 0]}>
    <B s={[len, 0.012, 0.2]} p={[0, 0.006, 0]} cor="#8a9099" rough={0.95} />
    {Array.from({ length: Math.floor(len / 0.2) }, (_, i) => (
      <B key={i} s={[0.09, 0.014, 0.012]} p={[-len / 2 + 0.1 + i * 0.2, 0.008, 0]} cor="#f2efe8" />
    ))}
  </group>
);

/** Fileira de árvores (Kenney) para emoldurar a fazenda. */
const Arvores: React.FC<{ pontos: [number, number, number][] }> = ({ pontos }) => (
  <>
    {pontos.map(([x, z, h], i) => (
      <Modelo key={i} url={i % 2 ? "natureza/tree_default" : "natureza/tree_oak"} p={[x, 0, z]} alvo={{ altura: h }} />
    ))}
  </>
);

/** Celeiro + silos (sede da fazenda). */
const Sede: React.FC<{ p: V3; s?: number; cor?: string; rotY?: number }> = ({ p: pos, s = 1, cor = "#b8322a", rotY = 0 }) => (
  <group position={pos} scale={s} rotation={[0, rotY, 0]}>
    <B s={[0.5, 0.36, 0.42]} p={[0, 0.18, 0]} cor={cor} />
    <mesh position={[0, 0.44, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
      <boxGeometry args={[0.36, 0.36, 0.44]} />
      <meshStandardMaterial color="#3a2a22" roughness={0.8} />
    </mesh>
    <B s={[0.2, 0.22, 0.01]} p={[0, 0.11, 0.215]} cor="#f2ead8" />
    <B s={[0.02, 0.22, 0.012]} p={[0, 0.11, 0.218]} cor={cor} />
    {[0.42, 0.62].map((x, i) => (
      <group key={x} position={[x, 0, -0.05 + i * 0.04]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.09, 0.09, 0.6, 20]} />
          <meshStandardMaterial color="#c9ced6" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.63, 0]}>
          <coneGeometry args={[0.095, 0.08, 20]} />
          <meshStandardMaterial color="#9aa1ab" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Contrato com caneta que assina (k 0..1). */
const Contrato: React.FC<{ p: V3; s?: number; k: number; valor: string }> = ({ p: pos, s = 1, k, valor }) => {
  const assin = clamp01(k);
  return (
    <group position={pos} scale={s} rotation={[-1.1, 0, 0.08]}>
      <B s={[0.5, 0.66, 0.008]} cor="#fbfaf6" />
      <PlanoTexto linhas={[["CONTRATO", 1, "#1d2230"], ["TERRA AGRÍCOLA", 0.7, "#4a4f5c"], [valor, 1.1, "#c8262c"]]} fundo={null} tam={[0.44, 0.34]} p={[0, 0.12, 0.006]} px={[460, 360]} />
      <B s={[0.36 * assin, 0.012, 0.002]} p={[-0.18 + 0.18 * assin, -0.2, 0.006]} cor="#1d3c8a" />
      <group position={[-0.18 + 0.36 * assin, -0.17, 0.05]} rotation={[0.3, 0, -0.6]}>
        <B s={[0.02, 0.2, 0.02]} cor="#1d2230" />
        <B s={[0.022, 0.04, 0.022]} p={[0, -0.1, 0]} cor="#c9a24a" />
      </group>
    </group>
  );
};

/** Caminhão de grãos com pilha (k = enche). */
const Caminhao: React.FC<{ p: V3; s?: number; k: number; t: number; rotY?: number }> = ({ p: pos, s = 1, k, t, rotY = 0 }) => (
  <group position={pos} scale={s} rotation={[0, rotY, 0]}>
    <Modelo url="carros/truck" p={[0, 0, 0]} alvo={{ comp: 0.9 }} tinta="#ffd23a" />
    {k > 0.02 ? (
      <mesh position={[-0.12, 0.42, 0]} scale={[1.3, 0.55 * ease.out(clamp01(k)), 0.75]}>
        <sphereGeometry args={[0.18, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#e0b44a" roughness={0.9} />
      </mesh>
    ) : null}
  </group>
);

/** Chuva (traços caindo). */
const Chuva: React.FC<{ centro: V3; t: number; k: number }> = ({ centro, t, k }) => {
  if (k <= 0.01) return null;
  return (
    <group position={centro}>
      {Array.from({ length: 90 }, (_, i) => {
        const x = (hash(i) - 0.5) * 5;
        const z = (hash(i + 3) - 0.5) * 3;
        const y = 2.4 - ((t * 3.5 + hash(i + 9) * 2.4) % 2.4);
        return <B key={i} s={[0.006, 0.12, 0.006]} p={[x, y, z]} cor="#bfe3ff" />;
      }).slice(0, Math.round(90 * k))}
    </group>
  );
};

const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");

/** HUD de "CAIXA" (formato do jogo): dinheiro que zera + terra que enche. */
const Caixa: React.FC<{ x: number; pais: string; cor: string; dinheiro: number; terra: number; ativo: boolean; alerta?: boolean }> = ({ x, pais, cor, dinheiro, terra, ativo, alerta }) => (
  <div
    style={{
      position: "absolute",
      top: 245,
      left: x,
      width: 430,
      background: "rgba(14,18,24,0.88)",
      borderRadius: 26,
      padding: "18px 24px",
      border: `4px solid ${alerta ? "#ff5a4e" : ativo ? cor : "rgba(255,255,255,0.15)"}`,
      fontFamily: FONT,
      color: "#fff",
      opacity: ativo ? 1 : 0.55,
      boxShadow: "0 14px 40px rgba(0,0,0,0.35)",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800, letterSpacing: "0.06em" }}>
      <span style={{ color: cor }}>{pais}</span>
      <span style={{ opacity: 0.6 }}>CAIXA</span>
    </div>
    <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, whiteSpace: "nowrap", color: dinheiro < 1 ? "#ff6a5a" : "#fff" }}>US$ {fmt(dinheiro)}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color: "#9fe08a" }}>terra: {fmt(terra)} ha</div>
  </div>
);

export const Fazenda1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.primeiro - 0.3; // EUA
  const TR = c.volta - 0.2; // volta a fita
  const T2 = c.desembarca - 0.6; // Brasil
  const T3 = c.chuva - 0.6; // lado a lado: chuva/plantio
  const T4 = c.media - 0.4; // fecho

  // dinheiro e terra
  const kUS = ease.inOut(p(t, c.contrato, Math.max(0.5, c.trezentos - c.contrato + 0.6), (x) => x));
  const kREW = t >= TR && t < T2 ? 1 - clamp01((t - TR) / Math.max(0.4, T2 - TR - 0.1)) : 1; // rebobina a fazenda dos EUA
  const kBR = ease.inOut(p(t, c.quarenta, Math.max(0.5, c.setecentos - c.quarenta + 0.6), (x) => x));
  const usDin = t < TR ? 5e6 * (1 - kUS) : t < T2 ? 5e6 * (1 - kUS * kREW) : 0;
  const usTerra = t < TR ? 336 * kUS : t < T2 ? 336 * kUS * kREW : 336;
  const brDin = 5e6 * (1 - kBR);
  const brTerra = 738 * kBR;
  const soja = p(t, c.planta, Math.max(1, c.colheita - c.planta), (x) => x);
  const colhe = p(t, c.colheita + 0.3, Math.max(1, c.porra - c.colheita - 0.3), (x) => x);
  const rew = t >= TR && t < T2;

  const blocos: [number, V3, V3, V3][] = [
    [0, PR, [PR[0], 1.2, 4.6], [PR[0], 0.7, 0]],
    [T1, US, [US[0] - 0.05, 5.4, 3.9], [US[0] - 0.05, 0.0, -0.35]],
    [T2, BR, [BR[0] - 0.1, 6.8, 4.7], [BR[0] - 0.1, 0.0, -0.35]],
    [T3, LD, [LD[0], 6.6, 4.6], [LD[0], 0.0, -0.25]],
    [T4, FI, [FI[0], 1.2, 5.2], [FI[0], 0.55, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.15, pos[2] * 0.9], look, 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#2a1f4a"],
      [T1, "#9fd977"],
      [T2, "#9fd977"],
      [T3, "#8cc66a"],
      [T4, "#2f8f5b"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };
  const hud = t >= T1 + 0.2 && t < T4 - 0.3;

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={em(3) ? 1.8 : 2.4} quente={em(2)}>
        {/* PRÊMIO: cheque gigante + notas caindo + encruzilhada */}
        {em(0) ? (
          <group position={PR}>
            <Boneco url="personagens/character-male-a" p={[0, 0, 0.3]} rotY={0} altura={0.6} anim={t >= c.cinco ? "emote-yes" : "idle"} tAnim={t} s={mola(0.0, 220, 12)} />
            <group position={[0, 0.98 + Math.sin(t * 2) * 0.02, -0.1]} rotation={[0, 0, Math.sin(t * 1.5) * 0.04]} scale={mola(c.cinco - 0.3, 220, 12)}>
              <B s={[1.2, 0.5, 0.02]} cor="#fbfaf6" />
              <B s={[1.2, 0.07, 0.022]} p={[0, 0.215, 0]} cor="#2a7f4f" />
              <PlanoTexto linhas={[["VOCÊ GANHOU", 0.6, "#4a4f5c"], ["US$ 5.000.000", 1.2, "#1d2230"]]} fundo={null} tam={[1.1, 0.36]} p={[0, -0.03, 0.012]} px={[800, 260]} />
            </group>
            {Array.from({ length: 24 }, (_, i) => {
              const u = ((t - c.cinco) * 0.5 + hash(i) * 1.5) % 1.5;
              if (t < c.cinco || u < 0) return null;
              return <B key={i} s={[0.16, 0.004, 0.08]} p={[(hash(i + 2) - 0.5) * 2.2, 2.2 - u * 1.6, (hash(i + 5) - 0.5) * 1.2]} r={[u * 6, u * 4, u * 3]} cor="#6dbb5e" />;
            })}
            {t >= c.escolha - 0.4 ? (
              <group position={[0, 0, 0.6]}>
                {(
                  [
                    ["EUA", -0.55, "#3c3b6e", "US"],
                    ["BRASIL", 0.55, "#1f9a4a", "BR"],
                  ] as const
                ).map(([txt, x, corP, pais], i) => (
                  <group key={txt} position={[x, 0, 0]} scale={mola(c.escolha - 0.4 + i * 0.15, 220, 12)}>
                    <Bandeira p={[0, 0, 0]} pais={pais} s={0.7} t={t + i} />
                    <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo={corP} tam={[0.42, 0.12]} p={[0.15, 0.45, 0.02]} px={[360, 100]} />
                  </group>
                ))}
              </group>
            ) : null}
          </group>
        ) : null}

        {/* EUA: picape chega, contrato, lavoura (336 ha) — e rebobina */}
        {em(1) ? (
          <group position={US}>
            <Sede p={[-0.75, 0, -1.05]} s={0.75} cor="#b8322a" rotY={0.3} />
            <Bandeira p={[-1.0, 0, -0.45]} pais="US" s={0.6} t={t} />
            <Estrada p={[0, 0, 0.7]} len={4} />
            <Estrada p={[-1.25, 0, 0]} len={3} eixo="z" />
            <Arvores pontos={[[-0.3, -1.25, 0.35], [0.4, -1.3, 0.3], [1.15, -1.2, 0.35], [1.25, 0.2, 0.3], [-1.5, -1.1, 0.35]]} />
            {t >= c.contrato && t < c.acaba + 0.4 ? <NotasVoando de={[0.2, 1.2, -0.2]} k={p(t, c.contrato, c.acaba - c.contrato + 0.4, (x) => x)} n={16} alcance={1.0} /> : null}
            <Picape p={[lerp(-2.0, -0.55, ease.out(p(t, c.picape - 0.8, 1.4, (x) => x))), 0.012, 0.7]} rotY={0} s={0.45} roda={t * 5} cor="#2a5aa8" />
            <Lavoura p={[0.2, 0, -0.2]} cols={14} total={168} n={168 * usTerra / 336} soja={0} seed={1} />
            {t >= c.contrato - 0.4 && t < c.acaba ? <Contrato p={[-0.75, 0.6, 0.25]} s={0.65 * mola(c.contrato - 0.4, 220, 12)} k={p(t, c.contrato, 0.7)} valor="US$ 14.900 / ha" /> : null}
          </group>
        ) : null}

        {/* BRASIL: mesma compra, 738 ha */}
        {em(2) ? (
          <group position={BR}>
            <Sede p={[-1.05, 0, -1.5]} s={0.8} cor="#e8e2d6" rotY={0.3} />
            <Bandeira p={[-1.35, 0, -0.8]} pais="BR" s={0.6} t={t} />
            <Estrada p={[0, 0, 1.15]} len={5} />
            <Estrada p={[-1.6, 0, 0]} len={4} eixo="z" />
            <Arvores pontos={[[-0.4, -1.65, 0.4], [0.4, -1.7, 0.35], [1.2, -1.6, 0.4], [1.55, -0.4, 0.35], [1.55, 0.5, 0.4], [-1.9, -1.4, 0.35]]} />
            {t >= c.quarenta && t < c.setecentos + 0.4 ? <NotasVoando de={[0.15, 1.4, -0.2]} k={p(t, c.quarenta, c.setecentos - c.quarenta + 0.4, (x) => x)} n={22} alcance={1.4} /> : null}
            <Picape p={[lerp(-2.4, -0.85, ease.out(p(t, T2 + 0.1, 1.4, (x) => x))), 0.012, 1.15]} s={0.5} roda={t * 5} cor="#c8302c" />
            <Lavoura p={[0.15, 0, -0.2]} cols={21} total={369} n={369 * brTerra / 738} soja={0} seed={2} />
            {t >= c.quarenta - 0.4 && t < c.setecentos ? <Contrato p={[-1.05, 0.7, 0.5]} s={0.75 * mola(c.quarenta - 0.4, 220, 12)} k={p(t, c.quarenta, 0.7)} valor="US$ 6.770 / ha" /> : null}
          </group>
        ) : null}

        {/* LADO A LADO: chuva, soja crescendo, colheita */}
        {em(3) ? (
          <group position={LD}>
            <Chuva centro={[0, 0, 0]} t={t} k={p(t, T3 + 0.2, 0.6) * (1 - p(t, c.colheita - 0.6, 0.6))} />
            <Estrada p={[-0.14, 0, 0]} len={3} eixo="z" />
            <Estrada p={[0, 0, 0.75]} len={4} />
            <group position={[-0.72, 0, 0]} scale={0.6}>
              <Lavoura p={[0, 0, -0.2]} cols={14} total={168} n={168} soja={soja} seed={1} />
              <Bandeira p={[-0.85, 0, -0.95]} pais="US" s={0.6} t={t} />
              {[0, 1, 2].map((i) => (
                <Caminhao key={i} p={[lerp(-0.4, 0.5, colhe) - i * 0.45, 0, 0.95]} s={0.45} k={clamp01(colhe * 3 - i)} t={t} />
              ))}
            </group>
            <group position={[0.52, 0, 0]} scale={0.6}>
              <Lavoura p={[0, 0, -0.2]} cols={21} total={369} n={369} soja={soja} seed={2} />
              <Bandeira p={[1.25, 0, -1.2]} pais="BR" s={0.6} t={t} />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <Caminhao key={i} p={[lerp(-0.6, 1.0, colhe) - i * 0.33, 0, 1.12]} s={0.4} k={clamp01(colhe * 7 - i)} t={t} />
              ))}
            </group>
            {t >= c.planta - 0.2 && t < c.colheita ? <Modelo url="carros/tractor" p={[lerp(-1.1, 1.2, p(t, c.planta - 0.2, 4.0, (x) => x)), 0, 0.45]} rotY={0} alvo={{ comp: 0.3 }} /> : null}
          </group>
        ) : null}

        {/* FECHO: aqui ou lá? */}
        {em(4) ? (
          <group position={FI}>
            {(
              [
                ["US", -0.4, "#3c3b6e", "EUA · 1.200 t"],
                ["BR", 0.4, "#1f9a4a", "BRASIL · 2.730 t"],
              ] as const
            ).map(([pais, x, corP, txt], i) => (
              <group key={pais} position={[x, 0, 0]}>
                <Pedestal raio={0.33} aro={corP} acende={t >= c.aquiLa ? 1 : 0.3} s={mola(T4 + 0.1 + i * 0.12, 220, 12)} />
                <Bandeira p={[-0.12, TOPO_PEDESTAL, 0]} pais={pais} s={0.6 * mola(T4 + 0.2 + i * 0.12, 220, 12)} t={t + i} />
                <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo={corP} tam={[0.62, 0.11]} p={[0, 1.18, 0.05]} px={[560, 100]} />
              </group>
            ))}
          </group>
        ) : null}
      </PalcoCor>

      {/* HUD do jogo: caixa que zera / terra que enche */}
      {hud ? (
        <>
          <Caixa x={56} pais="EUA" cor="#7aa8ff" dinheiro={usDin} terra={usTerra} ativo={em(1) || em(3)} alerta={t >= c.acaba - 0.2 && t < TR} />
          <Caixa x={594} pais="BRASIL" cor="#5ad17a" dinheiro={t < T2 ? 5e6 : brDin} terra={t < T2 ? 0 : brTerra} ativo={em(2) || em(3)} />
        </>
      ) : null}

      {/* pílula de hectares */}
      {(em(1) && t >= c.contrato) || em(2) ? (
        <div style={{ position: "absolute", top: 1105, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ background: "#ffcf3a", color: "#14211d", fontFamily: FONT, fontWeight: 800, fontSize: 46, padding: "10px 34px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
            {fmt(em(1) ? usTerra : brTerra)} hectares
          </div>
        </div>
      ) : null}

      {/* efeito "volta a fita" */}
      {rew ? (
        <AbsoluteFill style={{ pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 3px, transparent 3px 6px)", mixBlendMode: "multiply" }}>
          <div style={{ position: "absolute", top: 560, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#ffffff", textShadow: "0 0 30px rgba(255,255,255,0.6), 6px 0 0 rgba(255,0,80,0.6), -6px 0 0 rgba(0,200,255,0.6)", opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 8)) }}>
            ◀◀ REW
          </div>
        </AbsoluteFill>
      ) : null}

      {/* cards (abaixo do HUD quando ele aparece) */}
      <CardNumero t={t} de={-0.6} ate={c.largar - 0.4} titulo="IMAGINA QUE VOCÊ GANHOU" valor="US$ 5 milhões 💸" cor={C.destaque} />
      <CardNumero t={t} de={c.largar - 0.2} ate={c.escolha - 0.4} titulo="E RESOLVE VIRAR" valor="fazendeiro 🚜" />
      <CardNumero t={t} de={c.escolha - 0.2} ate={T1 - 0.3} titulo="SÓ TEM UMA ESCOLHA" valor="EUA ou Brasil?" cor={C.destaque} />
      <CardNumero t={t} de={c.quinze - 0.2} ate={c.acaba - 0.4} top={520} titulo="EUA · HECTARE DE LAVOURA (USDA 2026)" valor="≈ US$ 14.900" />
      <CardNumero t={t} de={c.trezentos - 0.2} ate={TR - 0.2} top={520} titulo="O DINHEIRO ACABA EM" valor="336 hectares" cor="#ff5a4e" tinta="#ffffff" />
      <CardNumero t={t} de={c.quarenta - 0.2} ate={c.seis - 0.3} top={520} titulo="BRASIL · MÉDIA (SCOT CONSULTORIA)" valor="R$ 40 mil / ha" />
      <CardNumero t={t} de={c.seis - 0.1} ate={c.setecentos - 0.4} top={520} titulo="NO CÂMBIO DA SEMANA" valor="≈ US$ 6.770" />
      <CardNumero t={t} de={c.setecentos - 0.2} ate={T3 - 0.4} top={520} titulo="O MESMO DINHEIRO COMPRA" valor="738 hectares" cor={C.destaque} />
      <Carimbo t={t} de={c.dobro - 0.1} ate={T3 - 0.4} txt="MAIS QUE O DOBRO" top={760} />
      <CardNumero t={t} de={c.la - 0.2} ate={c.aqui - 0.4} top={520} titulo="EUA · SOJA (USDA, MAI/2026)" valor="3,6 t/ha" />
      <CardNumero t={t} de={c.aqui - 0.2} ate={c.colheita - 0.4} top={520} titulo="BRASIL · SOJA (CONAB, MAI/2026)" valor="3,7 t/ha" cor={C.destaque} />
      <CardNumero t={t} de={c.americano - 0.2} ate={c.brasileiro - 0.4} top={520} titulo="COLHEITA NOS EUA" valor="≈ 1.200 t" />
      <CardNumero t={t} de={c.brasileiro - 0.2} ate={c.porra - 0.3} top={520} titulo="COLHEITA NO BRASIL" valor="≈ 2.730 t" cor={C.destaque} />
      <Carimbo t={t} de={c.porra - 0.05} ate={T4 - 0.4} txt="MESMA GRANA" top={540} />
      <CardNumero t={t} de={T4 + 0.1} ate={c.aquiLa - 0.4} titulo="É MÉDIA NACIONAL" valor="terra boa custa bem mais" />
      <CardNumero t={t} de={c.aquiLa - 0.2} ate={c.aprender - 0.6} titulo="COMENTA" valor="fazendeiro aqui ou lá?" cor={C.destaque} />
      <CardNumero t={t} de={c.aprender - 0.4} ate={99} titulo="QUER FAZER VÍDEOS ASSIM?" valor="link na bio 👆" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Flash at={c.porra} cor="#ffcf3a" max={0.25} />
      <Grain />
    </AbsoluteFill>
  );
};
