import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { MUNDO, StageMundo } from "../lib/StageMundo";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, Selo, mat, useMola } from "../lib/ui";

// CASO MASTER · PARTE 2/3 · "A venda que o Banco Central barrou".
// Dados e fontes: docs/dossies/master2.md. Ninguém é chamado de culpado: só fatos públicos com data.
precarregar([
  "moveis/table",
  "moveis/desk",
  "moveis/cardboardBoxClosed",
  "comercial/building-k",
  "comercial/building-c",
  "comercial/building-a",
  "carros/sedan",
  "personagens/character-male-a",
  "personagens/character-male-b",
  "personagens/character-male-d",
  "personagens/character-female-d",
  "natureza/tree_oak",
  "natureza/tree_detailed",
]);

const A: V3 = [0, 0, 0]; // a mesa com o contrato (gancho)
const BX: V3 = [40, 0, 0]; // o anúncio do BRB e o prazo do BC
const CX: V3 = [80, 0, 0]; // a corrida de obstáculos
const DX: V3 = [-40, 0, 0]; // o carimbo do Banco Central
const EX: V3 = [0, 0, -40]; // a virada: carteiras, PF, indenização

const DESTAQUE = /^(bilhões|público|assinatura|venda|BRB|cinquenta|prazo|caixa|corrida|Justiça|trava|Cade|Câmara|catorze|carimbo|setembro|não|escapou|carteiras|problemas|afasta|Polícia|prende|indenização)$/i;

/** Maços de dinheiro (blocos verdes com cinta). */
const Dinheiro: React.FC<{ p: V3; n: number }> = ({ p: pos, n }) => (
  <group position={pos}>
    {Array.from({ length: n }, (_, j) => (
      <group key={j} position={[(j % 2) * 0.17 - 0.085, 0.03 + Math.floor(j / 2) * 0.06, 0]}>
        <B s={[0.16, 0.05, 0.1]} cor={j % 2 ? "#3f9a5b" : "#4fae69"} />
        <B s={[0.035, 0.055, 0.105]} cor="#e9e2b8" />
      </group>
    ))}
  </group>
);

/** Relógio de prazo: mostrador e ponteiro que gira rápido. */
const Relogio: React.FC<{ p: V3; s: number; t: number }> = ({ p: pos, s, t }) => (
  <group position={pos} scale={Math.max(0.001, s)}>
    <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={mat("#ffffff", 0.4)}>
      <cylinderGeometry args={[0.32, 0.32, 0.06, 32]} />
    </mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.01]} material={mat(C.alerta, 0.5)}>
      <cylinderGeometry args={[0.36, 0.36, 0.05, 32]} />
    </mesh>
    <group position={[0, 0, 0.04]} rotation={[0, 0, -t * 4]}>
      <B s={[0.025, 0.26, 0.02]} p={[0, 0.11, 0]} cor="#1b1f22" />
    </group>
    <B s={[0.03, 0.16, 0.02]} p={[0.06, 0.04, 0.04]} r={[0, 0, -1.1]} cor="#1b1f22" />
    <B s={[0.04, 0.5, 0.04]} p={[0, -0.6, -0.03]} cor="#6b6f75" />
  </group>
);

/** Barreira de pista (obstáculo). */
const Barreira: React.FC<{ p: V3; cor: string; cai: number }> = ({ p: pos, cor, cai }) => (
  <group position={pos}>
    <B s={[0.04, 0.32, 0.04]} p={[0, 0.16, -0.22]} cor="#5b6066" />
    <B s={[0.04, 0.32, 0.04]} p={[0, 0.16, 0.22]} cor="#5b6066" />
    <group position={[0, 0.3, 0]} rotation={[0, 0, -cai * 1.45]}>
      <B s={[0.06, 0.08, 0.5]} cor={cor} />
    </group>
  </group>
);

const MARCA_SERIE = { nome: "Caso Master", linha: "Do começo ao fim, com fonte.", cta: "Siga para ver a Parte 3" };

export const Master2: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.marco - 0.4; // mesa → BRB
  const T2 = c.corrida - 0.4; // BRB → corrida
  const T3 = c.carimbo - 0.4; // corrida → carimbo
  const T4 = c.escapou - 0.5; // carimbo → virada

  const K: Key[] = [
    [0, [A[0], 2.6, 7.0], [A[0], 0.5, 0], 33],
    [T1, [A[0], 2.4, 6.6], [A[0], 0.5, 0], 33],
    [T1, [BX[0], 2.4, 8.4], [BX[0], 0.8, -0.3], 33],
    [T2, [BX[0] + 0.2, 2.5, 7.8], [BX[0] + 0.2, 0.8, -0.3], 33],
    [T2, [CX[0], 3.6, 9.6], [CX[0], 0.35, 0], 33],
    [T3, [CX[0] + 0.4, 3.6, 9.2], [CX[0] + 0.4, 0.35, 0], 33],
    [T3, [DX[0], 2.3, 6.6], [DX[0], 0.55, 0], 33],
    [c.nao - 0.15, [DX[0], 2.1, 5.6], [DX[0], 0.55, 0], 33],
    [T4, [DX[0], 2.1, 5.4], [DX[0], 0.55, 0], 33],
    [T4, [EX[0], 2.6, EX[2] + 8.6], [EX[0], 0.7, EX[2] - 0.3], 33],
    [c.policia - 0.6, [EX[0] - 0.2, 2.7, EX[2] + 8.8], [EX[0] - 0.2, 0.7, EX[2] - 0.3], 33],
    [FECHO, [EX[0] - 0.3, 3.4, EX[2] + 10.2], [EX[0] - 0.3, 0.6, EX[2] - 0.3], 33],
  ];
  const cam = camPorKeys(t, K);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  // ---------------- A · a mesa: R$ 2 bi + contrato + caneta parada (gancho)
  const naA = t < T1;
  const caneta = Math.sin(t * 3) * 0.02;
  if (naA) {
    add({ p: [A[0] + 0.45, 0.75, 0], s: mola(0.3, 220, 13), tipo: "card", titulo: "EM CIMA DA MESA", txt: "R$ 2 bi", cor: C.destaque, tam: 0.85 });
    if (t >= c.publico - 0.2) add({ p: [A[0] - 0.75, 1.0, -0.4], s: mola(c.publico - 0.2, 240, 12), txt: "banco público", cor: "#ffffff", tam: 0.85 });
    if (t >= c.publico - 0.2) add({ p: [A[0] + 0.75, 1.0, -0.4], s: mola(c.publico, 240, 12), txt: "Banco Master", cor: "#ffffff", tam: 0.85 });
    if (t >= c.assinatura - 0.2) add({ p: [A[0] - 0.1, 0.25, 0.55], s: mola(c.assinatura - 0.2, 220, 12), txt: "falta 1 assinatura", cor: C.alerta, tinta: "#fff", tam: 0.85 });
    if (t >= c.parte - 0.2) add({ p: [A[0], 1.65, -0.6], s: mola(c.parte - 0.2, 220, 13), tipo: "card", titulo: "PARTE 1: A FILA", txt: "agora, a venda", cor: "#ffffff", tam: 0.66 });
  }

  // ---------------- B · o anúncio do BRB e o prazo do BC
  const naB = t >= T1 - 0.05 && t < T2;
  if (naB) {
    add({ p: [BX[0] - 0.3, 2.0, -1.5], s: mola(T1 + 0.15, 220, 13), txt: "BRB · banco público do DF", cor: "#ffffff", tam: 0.82 });
    add({ p: [BX[0] - 0.6, 1.0, 0.3], s: mola(c.marco + 0.2, 220, 13), tipo: "card", titulo: "FATO RELEVANTE", txt: "28/03/2025", cor: "#ffffff", tam: 0.7 });
    if (t >= c.cinquenta - 0.2) add({ p: [BX[0] - 0.5, 0.3, 0.9], s: mola(c.cinquenta - 0.2, 220, 13), tipo: "card", titulo: "COMPRA DE", txt: "58% do Master", cor: C.destaque, tam: 0.72 });
    if (t >= c.prazo - 0.2) add({ p: [BX[0] + 0.85, 1.75, 0.3], s: mola(c.prazo - 0.2, 240, 12), txt: "prazo do Banco Central", cor: C.alerta, tinta: "#fff", tam: 0.78 });
    if (t >= c.caixa - 0.3) add({ p: [BX[0] + 0.7, 0.2, 1.0], s: mola(c.caixa - 0.3, 240, 12), txt: "falta dinheiro em caixa", cor: "#ffffff", tam: 0.78 });
  }

  // ---------------- C · a corrida de obstáculos
  const naC = t >= T2 - 0.05 && t < T3;
  const xs = [-1.2, 0, 1.2];
  const corre = p(t, T2 + 0.2, T3 - T2 - 0.3, (x) => x);
  const xRunner = lerp(-1.6, 1.55, corre);
  if (naC) {
    if (t >= c.justica - 0.2) add({ p: [CX[0] + xs[0], 0.75, 0], s: mola(c.justica - 0.2, 240, 12), tipo: "card", titulo: "JUSTIÇA", txt: "trava", cor: C.alerta, tinta: "#fff", tam: 0.62 });
    if (t >= c.cade - 0.2) add({ p: [CX[0] + xs[1], 0.75, 0], s: mola(c.cade - 0.2, 240, 12), tipo: "card", titulo: "CADE", txt: "aprova", cor: C.ok, tinta: "#fff", tam: 0.62 });
    if (t >= c.catorze - 0.3) add({ p: [CX[0] + xs[2], 0.75, 0], s: mola(c.catorze - 0.3, 240, 12), tipo: "card", titulo: "CÂMARA DO DF", txt: "14 × 7", cor: C.ok, tinta: "#fff", tam: 0.62 });
  }

  // ---------------- D · o carimbo
  const naD = t >= T3 - 0.05 && t < T4;
  const desce = p(t, c.nao - 0.25, 0.22, ease.in);
  const sobe = p(t, c.nao + 0.25, 0.4);
  const yCarimbo = lerp(0.95, 0.47, desce) + sobe * 0.35;
  const marca = t >= c.nao - 0.03;
  if (naD) {
    add({ p: [DX[0], 1.35, -0.5], s: mola(T3 + 0.15, 220, 13), txt: "o carimbo final", cor: "#ffffff", tam: 0.85 });
    if (t >= c.setembro - 0.3) add({ p: [DX[0] - 0.55, 0.95, 0.2], s: mola(c.setembro - 0.3, 220, 13), tipo: "card", titulo: "BANCO CENTRAL", txt: "03/09/2025", cor: "#ffffff", tam: 0.7 });
    if (marca) add({ p: [DX[0] + 0.1, 0.25, 0.45], s: mola(c.nao - 0.03, 260, 10), tipo: "card", titulo: "COMPRA", txt: "NEGADA", cor: C.alerta, tinta: "#fff", tam: 0.95 });
  }

  // ---------------- E · a virada
  const naE = t >= T4 - 0.05;
  const carro = p(t, c.policia - 0.7, 1.3, ease.inOut);
  if (naE && t < c.mande - 0.35) {
    add({ p: [EX[0], 1.9, EX[2] - 1.5], s: mola(T4 + 0.15, 220, 13), txt: "BRB", cor: "#ffffff", tam: 0.95 });
    if (t >= c.carteiras - 0.2) add({ p: [EX[0] + 0.7, 0.8, EX[2] + 0.2], s: mola(c.carteiras - 0.2, 220, 13), tipo: "card", titulo: "JÁ COMPRADAS", txt: "carteiras de crédito", cor: "#ffffff", tam: 0.62 });
    if (t >= c.problemas - 0.2) add({ p: [EX[0] - 0.6, 0.35, EX[2] + 0.7], s: mola(c.problemas - 0.2, 240, 12), txt: "problemas apontados pelo BC", cor: C.alerta, tinta: "#fff", tam: 0.72 });
    if (t >= c.novembro - 0.2 && t < c.distrito - 0.2) add({ p: [EX[0] - 0.7, 1.35, EX[2] - 0.2], s: mola(c.novembro - 0.2, 220, 13), tipo: "card", titulo: "NOV/2025", txt: "presidente afastado", cor: "#ffffff", tam: 0.62 });
    if (t >= c.policia - 0.1 && t < c.distrito - 0.2) add({ p: [EX[0] - 1.1, 0.5, EX[2] + 1.4], s: mola(c.policia - 0.1, 240, 12), txt: "PF · ex-presidente preso · abr/2026", cor: "#1f3b7a", tinta: "#fff", tam: 0.7 });
    if (t >= c.distrito - 0.2) add({ p: [EX[0] + 0.2, 1.35, EX[2] + 0.2], s: mola(c.distrito - 0.2, 200, 13), tipo: "card", titulo: "DF PEDE DE INDENIZAÇÃO", txt: "R$ 2,2 bi", cor: C.destaque, tam: 0.85 });
  }

  return (
    <AbsoluteFill style={{ background: MUNDO.ceu }}>
      {t < FECHO + 0.6 ? (
        <StageMundo cam={cam} miniatura={0.3}>
          {naA ? (
            <group position={A}>
              <Modelo url="moveis/table" alvo={{ comp: 1.3 }} />
              <B s={[0.36, 0.006, 0.48]} p={[-0.1, 0.405, 0.05]} r={[0, 0.12, 0]} cor="#fbfaf5" />
              {[0, 1, 2, 3, 4].map((i) => (
                <B key={i} s={[0.26, 0.007, 0.012]} p={[-0.1, 0.409, -0.12 + i * 0.05]} r={[0, 0.12, 0]} cor="#c9c6bb" />
              ))}
              <B s={[0.22, 0.008, 0.008]} p={[-0.07, 0.41, 0.22]} r={[0, 0.12, 0]} cor="#1b1f22" />
              <group position={[0.02, 0.52 + caneta, 0.2]} rotation={[0.2, 0.4, 0.9]}>
                <mesh castShadow material={mat("#1f3b7a", 0.4)}>
                  <cylinderGeometry args={[0.012, 0.012, 0.2, 10]} />
                </mesh>
              </group>
              <Dinheiro p={[0.4, 0.4, -0.05]} n={8} />
              <Boneco url="personagens/character-male-d" p={[-0.82, 0, 0.12]} rotY={Math.PI / 2 - 0.2} altura={0.56} anim={t >= c.assinatura ? "emote-yes" : "idle"} tAnim={t} />
              <Boneco url="personagens/character-male-a" p={[0.82, 0, 0.12]} rotY={-Math.PI / 2 + 0.2} altura={0.56} anim="idle" tAnim={t + 0.5} />
            </group>
          ) : null}

          {naB ? (
            <group position={BX}>
              <Modelo url="comercial/building-k" p={[-0.3, 0, -1.6]} alvo={{ largura: 1.4 }} />
              <Relogio p={[0.85, 1.05, 0.2]} s={mola(c.prazo - 0.4, 200, 12)} t={t} />
              <Boneco url="personagens/character-male-d" p={[-0.2, 0, 0.5]} rotY={0.2} altura={0.56} anim={t >= c.cinquenta ? "emote-yes" : "idle"} tAnim={t} />
              <Modelo url="natureza/tree_oak" p={[-1.15, 0, -1.9]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}

          {naC ? (
            <group position={CX}>
              <B s={[4.6, 0.02, 0.7]} p={[0, 0.01, 0]} cor="#c97b52" />
              {[-0.36, 0.36].map((z, i) => (
                <B key={i} s={[4.6, 0.025, 0.03]} p={[0, 0.02, z]} cor="#ffffff" />
              ))}
              <Barreira p={[xs[0], 0, 0]} cor={C.alerta} cai={0} />
              <Barreira p={[xs[1], 0, 0]} cor={C.ok} cai={p(t, c.cade - 0.1, 0.4)} />
              <Barreira p={[xs[2], 0, 0]} cor={C.ok} cai={p(t, c.catorze - 0.2, 0.4)} />
              <Boneco url="personagens/character-male-d" p={[xRunner, 0, 0]} rotY={Math.PI / 2} altura={0.5} anim={corre > 0 && corre < 1 ? "walk" : "idle"} tAnim={t * 1.4} />
              <Modelo url="natureza/tree_detailed" p={[1.15, 0, -1.9]} alvo={{ altura: 1.0 }} />
              <Modelo url="natureza/tree_oak" p={[-1.15, 0, -1.9]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}

          {naD ? (
            <group position={DX}>
              <Modelo url="moveis/desk" alvo={{ comp: 1.0 }} />
              <B s={[0.3, 0.006, 0.4]} p={[0, 0.44, 0.05]} cor="#fbfaf5" />
              {marca ? <B s={[0.2, 0.003, 0.1]} p={[0, 0.446, 0.08]} cor={C.alerta} /> : null}
              <group position={[0, yCarimbo, 0.08]}>
                <B s={[0.16, 0.05, 0.1]} p={[0, 0, 0]} cor="#7a1f1a" />
                <B s={[0.05, 0.14, 0.05]} p={[0, 0.09, 0]} cor="#3a2b22" />
                <mesh position={[0, 0.19, 0]} castShadow material={mat("#3a2b22", 0.5)}>
                  <sphereGeometry args={[0.05, 12, 10]} />
                </mesh>
              </group>
              <Boneco url="personagens/character-female-d" p={[0, 0, -0.55]} altura={0.56} anim={t >= c.nao ? "emote-no" : "idle"} tAnim={t} />
            </group>
          ) : null}

          {naE ? (
            <group position={EX}>
              <Modelo url="comercial/building-a" p={[0, 0, -1.6]} alvo={{ largura: 1.5 }} />
              {[
                [0.35, 0, -0.35],
                [0.65, 0, -0.25],
                [0.5, 0.22, -0.3],
                [0.9, 0, -0.1],
              ].map((b, i) => (
                <Modelo key={i} url="moveis/cardboardBoxClosed" p={b as V3} alvo={{ comp: 0.26 }} s={Math.min(1, mola(c.carteiras - 0.4 + i * 0.12, 220, 13))} />
              ))}
              <Boneco url="personagens/character-male-b" p={[-0.5, 0, 0.1]} altura={0.56} anim={t >= c.problemas ? "emote-no" : "idle"} tAnim={t} />
              {carro > 0.001 ? <Modelo url="carros/sedan" p={[lerp(-3.4, -1.0, carro), 0, 1.0]} rotY={Math.PI / 2} alvo={{ comp: 0.8 }} tinta="#5b7fd6" /> : null}
              <Modelo url="natureza/tree_detailed" p={[1.05, 0, -2.1]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}
        </StageMundo>
      ) : null}

      <TelaSegura itens={rot} cam={cam} />
      <PalavraGrande ate={c.mande - 0.35} destaque={DESTAQUE} />

      {t >= c.mande - 0.35 && t < FECHO ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 300, textAlign: "center", transform: `scale(${mola(c.mande - 0.35, 200, 13)})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 76, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#ffffff", WebkitTextStroke: "9px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
            Mande para quem acha que banco público é <span style={{ color: C.destaque }}>sempre seguro</span>
          </div>
          {t >= c.comenta - 0.2 ? (
            <div style={{ marginTop: 40, opacity: p(t, c.comenta - 0.2, 0.3), fontFamily: FONT, fontWeight: 800, fontSize: 50, lineHeight: 1.15, color: "#ffffff", WebkitTextStroke: "7px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
              Parte 3: quem tinha mais de <span style={{ color: C.destaque, whiteSpace: "nowrap" }}>R$ 250 mil</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {t < FECHO ? <Selo txt="CASO MASTER · PARTE 2/3" /> : null}
      {t >= 0.3 && t < FECHO ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 600, color: "rgba(20,30,25,0.66)" }}>
          Fontes: Banco Central, imprensa · investigados, sem condenação · 08/11/2026
        </div>
      ) : null}

      {[T1, T2, T3, T4].map((x, i) => (
        <Flash key={i} at={x} max={0.35} />
      ))}
      <Flash at={c.nao - 0.03} max={0.4} cor={C.alerta} dur={0.35} />
      <Fecho at={FECHO} marca={MARCA_SERIE} />
      <Grain />
    </AbsoluteFill>
  );
};
