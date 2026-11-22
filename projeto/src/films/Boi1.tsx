import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Modelo, precarregar } from "../lib/kenney";
import { Calendario, Carimbo, CardNumero, corBloco, Navio, PalcoCor, Pedestal, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · boi1 · "A arroba do boi bateu recorde: picanha ou frango no Natal?"
// Dados: docs/dossies/boi1.md. Varejo SEM número (só "costuma"): o IPCA-15 de novembro sai ~25/11 (parte 2).
precarregar(["natureza/tree_oak", "natureza/fence_simple", "natureza/grass_large"]);

const H0: V3 = [0, 0, 0];
const BA: V3 = [25, 0, 0];
const MP: V3 = [50, 0, 0];
const GR: V3 = [75, 0, 0];
const PA: V3 = [100, 0, 0];
const CA: V3 = [125, 0, 0];
const CH: V3 = [150, 0, 0];
const DESTAQUE = /boi|reais|você|arroba|trezentos|recorde|Cepea|Paulo|quatrocentos|Bahia|vinte|menos|dólar|China|disputado|mercado|churrasco|fim|porra|pasto|açougue|picanha|frango|Natal|manda|assador/i;

/** Boi miniatura (blocos): corpo, cabeça com chifres, pernas, rabo. Comprimento ~0.9 com s=1, frente +x. */
const Boi: React.FC<{ p: V3; rotY?: number; s?: number; cor?: string; t?: number }> = ({ p: pos, rotY = 0, s = 1, cor = "#f1ece2", t = 0 }) => {
  if (s <= 0.002) return null;
  const pasta = Math.sin(t * 2) * 0.05;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.62, 0.34, 0.34]} p={[0, 0.5, 0]} cor={cor} />
      <B s={[0.2, 0.12, 0.3]} p={[0.18, 0.7, 0]} cor={cor} />
      {/* manchas */}
      <B s={[0.18, 0.2, 0.345]} p={[-0.12, 0.52, 0]} cor="#3a2a22" />
      {/* cabeça */}
      <group position={[0.36, 0.62 + pasta, 0]}>
        <B s={[0.2, 0.2, 0.22]} p={[0.04, 0, 0]} cor={cor} />
        <B s={[0.08, 0.1, 0.16]} p={[0.17, -0.05, 0]} cor="#e8b7a8" />
        {[-1, 1].map((i) => (
          <group key={i}>
            <B s={[0.04, 0.04, 0.1]} p={[0.02, 0.12, i * 0.13]} r={[i * 0.5, 0, 0]} cor="#e9dcc0" />
            <B s={[0.03, 0.02, 0.02]} p={[0.141, 0.03, i * 0.06]} cor="#1d1d1d" />
            <B s={[0.05, 0.03, 0.08]} p={[-0.04, 0.06, i * 0.14]} cor="#3a2a22" />
          </group>
        ))}
      </group>
      {/* pernas */}
      {[-0.22, 0.22].map((x) =>
        [-0.11, 0.11].map((z) => (
          <group key={`${x}${z}`}>
            <B s={[0.08, 0.32, 0.08]} p={[x, 0.17, z]} cor={cor} />
            <B s={[0.09, 0.05, 0.09]} p={[x, 0.025, z]} cor="#2a2422" />
          </group>
        )),
      )}
      <B s={[0.03, 0.26, 0.03]} p={[-0.33, 0.46, 0]} r={[0, 0, -0.25 + Math.sin(t * 3) * 0.2]} cor="#3a2a22" />
    </group>
  );
};

/** Balança de boi: plataforma com grade + mostrador redondo com ponteiro (k 0..1). */
const BalancaBoi: React.FC<{ p: V3; s?: number; k: number; children?: React.ReactNode }> = ({ p: pos, s = 1, k, children }) => (
  <group position={pos} scale={s}>
    <B s={[1.1, 0.1, 0.6]} p={[0, 0.05, 0]} cor="#5a636e" />
    <B s={[1.04, 0.02, 0.54]} p={[0, 0.105, 0]} cor="#7a838e" />
    {[-0.5, 0.5].map((x) => (
      <B key={x} s={[0.04, 0.4, 0.6]} p={[x, 0.3, 0]} cor="#8a5a34" />
    ))}
    <group position={[0, 0.11, 0]}>{children}</group>
    {/* mostrador */}
    <group position={[0.8, 0, -0.1]} scale={1.05}>
      <B s={[0.05, 0.9, 0.05]} p={[0, 0.45, 0]} cor="#2a2f3a" />
      <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.06, 32]} />
        <meshStandardMaterial color="#2a2f3a" />
      </mesh>
      <mesh position={[0, 1.05, 0.032]}>
        <circleGeometry args={[0.23, 32]} />
        <meshStandardMaterial color="#f6f3ec" />
      </mesh>
      <PlanoTexto linhas={[["R$/@", 1, "#4a4f5c"]]} fundo={null} tam={[0.16, 0.05]} p={[0, 0.96, 0.036]} px={[300, 90]} />
      {([["300", -1.0], ["350", 0], ["400", 1.0]] as const).map(([v, a]) => (
        <PlanoTexto key={v} linhas={[[v, 1, v === "400" ? "#c8262c" : "#1d2230"]]} fundo={null} tam={[0.12, 0.05]} p={[Math.sin(a) * 0.15, 1.05 + Math.cos(a) * 0.15, 0.036]} px={[200, 90]} />
      ))}
      <group position={[0, 1.05, 0.04]} rotation={[0, 0, lerp(1.4, -0.9, ease.out(clamp01(k)))]}>
        <B s={[0.02, 0.2, 0.01]} p={[0, 0.09, 0]} cor="#c8262c" />
      </group>
      <mesh position={[0, 1.05, 0.045]}>
        <circleGeometry args={[0.02, 12]} />
        <meshStandardMaterial color="#1d1d1d" />
      </mesh>
    </group>
  </group>
);

/** Barra 3D com rótulo em baixo e valor em cima. */
const Barra: React.FC<{ p: V3; alt: number; k: number; cor: string; rot: string; val?: string }> = ({ p: pos, alt, k, cor, rot, val }) => {
  const h = Math.max(0.001, alt * ease.out(clamp01(k)));
  return (
    <group position={pos}>
      <B s={[0.42, h, 0.42]} p={[0, h / 2, 0]} cor={cor} />
      <PlanoTexto linhas={[[rot, 1, "#ffffff"]]} fundo="#1d2230" tam={[0.5, 0.13]} p={[0, 0.08, 0.215]} px={[420, 110]} />
      {val && k > 0.9 ? <PlanoTexto linhas={[[val, 1, "#14211d"]]} fundo="#ffcf3a" tam={[0.5, 0.14]} p={[0, h + 0.12, 0.1]} px={[420, 118]} /> : null}
    </group>
  );
};

/** Churrasqueira com espeto girando; `troca` 0..1 transforma a picanha em frango. */
const Churrasqueira: React.FC<{ p: V3; s?: number; t: number; troca: number }> = ({ p: pos, s = 1, t, troca }) => {
  const kp = 1 - ease.inOut(clamp01(troca));
  const kf = ease.back(clamp01((troca - 0.4) / 0.6));
  return (
    <group position={pos} scale={s}>
      <B s={[1.1, 0.5, 0.5]} p={[0, 0.45, 0]} cor="#7a3a2a" />
      <B s={[1.0, 0.04, 0.42]} p={[0, 0.72, 0]} cor="#2a1a14" />
      {[-0.42, -0.14, 0.14, 0.42].map((x, i) => (
        <mesh key={x} position={[x, 0.75, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.34]} />
          <meshStandardMaterial color="#ff6a1a" emissive="#ff4a0a" emissiveIntensity={0.8 + 0.5 * Math.sin(t * 7 + i)} toneMapped={false} />
        </mesh>
      ))}
      {[-0.5, 0.5].map((x) => (
        <B key={x} s={[0.04, 0.5, 0.04]} p={[x, 0.95, 0]} cor="#4a4f5c" />
      ))}
      <group position={[0, 1.15, 0]} rotation={[t * 1.5, 0, 0]}>
        <B s={[1.2, 0.025, 0.025]} cor="#c9ced6" />
        {kp > 0.01 ? (
          <group scale={kp}>
            <mesh scale={[1, 0.6, 0.8]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.17, 0.17, 0.5, 20, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color="#a0302a" roughness={0.7} />
            </mesh>
            <mesh scale={[1, 0.62, 0.82]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.172, 0.172, 0.5, 20, 1, true, Math.PI * 0.05, Math.PI * 0.35]} />
              <meshStandardMaterial color="#f2e6c8" roughness={0.8} side={2} />
            </mesh>
            {[-0.15, 0, 0.15].map((x) => (
              <B key={x} s={[0.025, 0.005, 0.27]} p={[x, 0.105, 0]} cor="#3a1a14" />
            ))}
          </group>
        ) : null}
        {kf > 0.01 ? (
          <group scale={kf}>
            <mesh scale={[1.25, 0.85, 0.95]}>
              <sphereGeometry args={[0.18, 18, 14]} />
              <meshStandardMaterial color="#c97a2a" roughness={0.55} />
            </mesh>
            {[-1, 1].map((i) => (
              <group key={i} position={[0.2, 0.0, i * 0.09]} rotation={[0, 0, -0.7]}>
                <mesh scale={[0.6, 1, 0.6]}>
                  <sphereGeometry args={[0.09, 12, 10]} />
                  <meshStandardMaterial color="#c97a2a" roughness={0.55} />
                </mesh>
                <B s={[0.03, 0.12, 0.03]} p={[0, 0.12, 0]} cor="#f2ead8" />
              </group>
            ))}
          </group>
        ) : null}
      </group>
    </group>
  );
};

export const Boi1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.arroba - 0.45; // "A arroba bateu"
  const T2 = c.paulo - 0.6; // "Em São Paulo"
  const T3 = c.novembro - 0.3; // "Novembro tá quase 22%"
  const T4 = c.motivo - 0.5; // "O motivo?"
  const T5 = c.mercado - 0.5; // "E o mercado já aposta"
  const T6 = c.adivinha - 0.6; // "Agora adivinha"

  const blocos: [number, V3, V3, V3][] = [
    [0, H0, [H0[0], 1.0, 4.4], [H0[0], 0.78, 0]],
    [T1, BA, [BA[0] + 0.02, 1.1, 5.0], [BA[0] + 0.02, 0.62, 0]],
    [T2, MP, [MP[0], 1.4, 6.4], [MP[0], 0.45, 0]],
    [T3, GR, [GR[0], 1.3, 5.4], [GR[0], 0.45, 0]],
    [T4, PA, [PA[0], 1.4, 7.0], [PA[0], 0.4, 0]],
    [T5, CA, [CA[0], 1.1, 5.6], [CA[0], 0.38, 0]],
    [T6, CH, [CH[0], 1.6, 5.2], [CH[0], 0.75, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const treme = t > c.porra - 0.05 && t < c.porra + 0.7 ? Math.sin(t * 60) * 0.03 * (1 - clamp01((t - c.porra) / 0.7)) : 0;
  const cam0 = camPorKeys(t, K);
  const cam = { ...cam0, pos: [cam0.pos[0] + treme, cam0.pos[1] + treme * 0.6, cam0.pos[2]] as V3 };
  const cor = corBloco(
    t,
    [
      [0, "#3a2a22"],
      [T1, "#2f6b4a"],
      [T2, "#2f5f8f"],
      [T3, "#3a3a4a"],
      [T4, "#4f8f3a"],
      [T5, "#7a2a2e"],
      [T6, "#4a2a1a"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.4} quente={em(6)}>
        {/* GANCHO: boi no pedestal com etiqueta de preço */}
        {em(0) ? (
          <group position={H0}>
            <Pedestal raio={0.6} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.4 - 0.5, 0]}>
              <Boi p={[0, TOPO_PEDESTAL, 0]} s={1.0 * mola(0.0, 220, 12)} t={t} />
            </group>
            <group position={[-0.38, 0.62, 0.55]} rotation={[0, 0.25, Math.sin(t * 3) * 0.05]} scale={0.7 * mola(0.2, 220, 12)}>
              <PlanoTexto linhas={[[`R$ ${Math.round(lerp(120, 395, ease.out(p(t, 0.3, 2.4, (x) => x))))}`, 1, "#c8262c"]]} fundo="#fff6d8" tam={[0.62, 0.22]} px={[420, 150]} />
            </group>
          </group>
        ) : null}

        {/* BALANÇA: arroba recorde */}
        {em(1) ? (
          <group position={BA}>
            <BalancaBoi p={[-0.35, 0, 0]} k={p(t, c.trezentos - 0.3, 1.4)}>
              <Boi p={[0, 0, 0]} s={0.9} t={t} />
            </BalancaBoi>
          </group>
        ) : null}

        {/* SP R$ 400 e BA R$ 410 */}
        {em(2) ? (
          <group position={MP}>
            {(
              [
                ["SÃO PAULO", -0.45, c.paulo - 0.2, "R$ 400"],
                ["BAHIA", 0.45, c.bahia - 0.2, "R$ 410"],
              ] as const
            ).map(([nome, x, t0, val]) => (
              <group key={nome} position={[x, 0, 0]}>
                <Pedestal raio={0.42} aro="#ffcf3a" acende={p(t, t0, 0.4)} s={mola(T2 - 0.15, 260, 12)} />
                <Boi p={[0, TOPO_PEDESTAL, 0]} rotY={-0.6} s={0.62 * mola(Math.min(t0, T2), 220, 12)} t={t} />
                <PlanoTexto linhas={t >= t0 + 0.2 ? [[nome, 0.7, "#14211d"], [val, 1, "#14211d"]] : [[nome, 0.7, "#14211d"], ["?", 1, "#14211d"]]} fundo="#ffcf3a" tam={[0.56, 0.28]} p={[0, 1.08, 0.1]} px={[460, 230]} />
              </group>
            ))}
          </group>
        ) : null}

        {/* GRÁFICO: nov/2025 × nov/2026 */}
        {em(3) ? (
          <group position={GR}>
            <Barra p={[-0.42, 0, 0]} alt={0.62} k={p(t, T3 + 0.2, 0.8)} cor="#8a929e" rot="NOV/2025" />
            <Barra p={[0.42, 0, 0]} alt={0.76} k={p(t, c.vinte - 0.2, 0.9)} cor="#c8262c" rot="NOV/2026" />
          </group>
        ) : null}

        {/* PASTO: menos boi, dólar alto, China comprando */}
        {em(4) ? (
          <group position={PA}>
            <B s={[3.4, 0.01, 1.6]} p={[0, 0.005, -0.2]} cor="#5fa04a" />
            <Modelo url="natureza/fence_simple" p={[-0.9, 0, -0.6]} alvo={{ largura: 0.7 }} />
            <Modelo url="natureza/fence_simple" p={[-0.2, 0, -0.6]} alvo={{ largura: 0.7 }} />
            <Modelo url="natureza/tree_oak" p={[-1.05, 0, -0.9]} alvo={{ altura: 0.8 }} />
            <Boi p={[-0.55, 0.01, 0.0]} rotY={0.3} s={0.55} t={t} />
            {t >= c.menos - 0.2 ? <Boi p={[-0.15, 0.01, 0.25]} rotY={-0.4} s={0.55 * (1 - p(t, c.menos, 0.5) * 0.999)} t={t + 1} /> : null}
            {/* moeda de dólar inflando */}
            {t >= c.dolar - 0.3 ? (
              <group position={[0.4, 0.8, -0.4]} rotation={[0, Math.sin(t * 2) * 0.15, 0]} scale={0.4 + 0.3 * ease.back(p(t, c.dolar - 0.2, 0.6, (x) => x))}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 0.12, 32]} />
                  <meshStandardMaterial color="#5fae5a" metalness={0.3} roughness={0.4} />
                </mesh>
                <PlanoTexto linhas={[["US$", 1, "#ffffff"]]} fundo={null} tam={[0.7, 0.35]} p={[0, 0, 0.07]} px={[400, 200]} />
              </group>
            ) : null}
            {/* navio para a China */}
            {t >= c.china - 0.4 ? (
              <group position={[lerp(-0.25, 0.35, p(t, c.china - 0.3, 4.5, (x) => x)), 0, 0.7]}>
                <Navio s={0.75} t={t} />
                <PlanoTexto linhas={[["→ CHINA", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.8, 0.22]} p={[0, 0.95, 0.12]} px={[480, 132]} />
              </group>
            ) : null}
          </group>
        ) : null}

        {/* MERCADO FUTURO: calendário vira pra dezembro */}
        {em(5) ? (
          <group position={CA}>
            <Calendario p={[-0.1, 0, 0]} s={0.85 * mola(T5 + 0.1, 220, 12)} mes="DEZEMBRO" dia="R$ 400+" ano="APOSTA DO MERCADO" antes={{ mes: "NOVEMBRO", dia: "R$ 395", ano: "CEPEA 18/11" }} vira={p(t, c.quatrocentos3 - 0.5, 0.6, (x) => x)} cor="#c8262c" />
          </group>
        ) : null}

        {/* CHURRASQUEIRA: picanha → frango */}
        {em(6) ? (
          <group position={CH}>
            <Churrasqueira p={[0, 0, 0]} s={0.95 * mola(T6 + 0.1, 220, 12)} t={t} troca={p(t, c.frango - 0.3, 0.8)} />
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.pagar - 0.45} titulo="O BOI NUNCA CUSTOU TANTO" valor="em reais 🐂" cor={C.destaque} />
      <CardNumero t={t} de={c.pagar - 0.25} ate={T1 - 0.4} titulo="E QUEM VAI PAGAR" valor="é você" />
      <CardNumero t={t} de={T1 + 0.1} ate={c.cepea - 1.25} titulo="ARROBA DO BOI · CEPEA 18/11" valor="R$ 395,40" cor={C.destaque} />
      <Carimbo t={t} de={c.cepea - 1.05} ate={T2 - 0.4} txt="RECORDE" top={330} />
      <CardNumero t={t} de={c.paulo - 0.3} ate={c.bahia - 0.4} titulo="SÃO PAULO · LOTES PONTUAIS" valor="R$ 400" />
      <CardNumero t={t} de={c.bahia - 0.2} ate={T3 - 0.4} titulo="FEIRA DE SANTANA (BA) · 17/11" valor="R$ 410" cor={C.destaque} />
      <CardNumero t={t} de={T3 + 0.1} ate={T4 - 0.4} titulo="NOVEMBRO (ATÉ 13/11) × NOV/2025" valor="+21,9%" cor="#ff5a4e" tinta="#ffffff" />
      <CardNumero t={t} de={T4 + 0.1} ate={c.dolar - 0.4} titulo="MOTIVO 1" valor="menos boi pra abate" />
      <CardNumero t={t} de={c.dolar - 0.2} ate={c.china - 0.4} titulo="MOTIVO 2" valor="dólar alto" />
      <CardNumero t={t} de={c.china - 0.2} ate={c.ouSeja - 0.4} titulo="MOTIVO 3" valor="a China voltou a comprar" />
      <CardNumero t={t} de={c.ouSeja - 0.2} ate={T5 - 0.4} titulo="O BOI DAQUI" valor="disputado lá fora" cor={C.destaque} />
      <CardNumero t={t} de={T5 + 0.1} ate={T6 - 0.4} titulo="MERCADO FUTURO APOSTA" valor="acima de R$ 400" />
      <CardNumero t={t} de={T6 + 0.1} ate={c.porra - 0.3} titulo="QUANDO É O SEU CHURRASCO?" valor="no fim do ano 🔥" cor={C.destaque} />
      <Carimbo t={t} de={c.porra - 0.05} ate={c.pasto - 0.6} txt="POIS É." />
      <CardNumero t={t} de={c.pasto - 0.4} ate={c.comenta - 0.4} titulo="BOI SOBE NO PASTO" valor="carne costuma subir" />
      <CardNumero t={t} de={c.comenta - 0.2} ate={c.manda - 0.4} titulo="COMENTA" valor="picanha ou frango?" cor={C.destaque} />
      <CardNumero t={t} de={c.manda - 0.2} ate={99} titulo="MANDA PRO" valor="assador da família 🍖" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Flash at={c.porra} cor="#ff3b30" max={0.22} />
      <Grain />
    </AbsoluteFill>
  );
};
