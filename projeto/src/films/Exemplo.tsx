import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { MUNDO, StageMundo } from "../lib/StageMundo";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// FILME DE EXEMPLO · "A ligação que ninguém atendeu" (clínica, valores ilustrativos).
// Mostra o formato inteiro: gancho com objeto + ação + número, três "estações" num mundo contínuo,
// rótulos presos aos objetos (TelaSegura), uma palavra por vez (PalavraGrande), virada irônica e fecho.
// COPIE ESTE ARQUIVO para criar o seu: troque os cenários, os rótulos e as marcações (cues).
precarregar([
  "comercial/building-a",
  "comercial/building-e",
  "moveis/desk",
  "moveis/chairDesk",
  "moveis/computerScreen",
  "personagens/character-male-a",
  "personagens/character-female-d",
  "personagens/character-male-b",
  "natureza/tree_oak",
  "natureza/tree_detailed",
]);

const A: V3 = [0, 0, 0]; // estação 1: a clínica (gancho)
const BX: V3 = [40, 0, 0]; // estação 2: a recepção
const CX: V3 = [80, 0, 0]; // estação 3: a clínica da esquina
const DESTAQUE = /anúncio|telefone|ninguém|recepção|caixa|próximo|esquina|parabéns|processo|atende|tempo|retorna/i;

/** Telefone de mesa de brinquedo; `toca` faz tremer e acende a luz. */
const Telefone: React.FC<{ p: V3; toca: number; t: number }> = ({ p: pos, toca, t }) => {
  const treme = toca > 0 ? Math.sin(t * 60) * 0.012 * toca : 0;
  return (
    <group position={[pos[0] + treme, pos[1], pos[2]]}>
      <B s={[0.16, 0.05, 0.2]} p={[0, 0.025, 0]} cor="#2b3430" />
      <B s={[0.14, 0.035, 0.05]} p={[0, 0.07, 0.04]} cor="#3a4640" r={[0, 0, 0.12]} />
      <B s={[0.03, 0.02, 0.03]} p={[0.05, 0.055, -0.05]} cor={toca > 0 && Math.floor(t * 4) % 2 === 0 ? C.alerta : "#55615b"} />
    </group>
  );
};

const Mesa: React.FC<{ p: V3; rotY?: number }> = ({ p: pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]}>
    <Modelo url="moveis/desk" alvo={{ comp: 0.8 }} />
  </group>
);

export const Exemplo: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 0.9;
  const T1 = c.caminho - 0.4; // gancho → recepção
  const T2 = c.proximo - 0.4; // recepção → clínica da esquina
  const T3 = c.defina - 0.4; // → solução

  const K: Key[] = [
    [0, [A[0], 2.5, 9.4], [A[0], 0.8, -0.3], 34],
    [T1, [A[0], 2.7, 9.8], [A[0], 0.8, -0.3], 34],
    [T1, [BX[0], 2.5, 8.6], [BX[0], 0.65, -0.3], 34],
    [T2, [BX[0], 2.6, 8.2], [BX[0], 0.65, -0.3], 34],
    [T2, [CX[0], 2.5, 8.8], [CX[0], 0.7, -0.3], 34],
    [T3, [CX[0], 2.6, 8.5], [CX[0], 0.7, -0.3], 34],
    [T3, [BX[0], 2.6, 8.6], [BX[0], 0.7, -0.3], 34],
    [FECHO, [BX[0], 2.7, 8.2], [BX[0], 0.7, -0.3], 34],
  ];
  const cam = camPorKeys(t, K);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  // ---------------- estação 1 · gancho (objeto + ação + número, sem título)
  const naA = t < T1;
  const toca = naA && t >= c.telefone - 0.3 ? 1 : 0;
  if (naA) {
    add({ p: [A[0], 2.05, -0.2], s: mola(0.5, 220, 13), tipo: "card", titulo: "ANÚNCIO", txt: "R$ 5.000", cor: "#ffffff", tam: 0.95 });
    if (t >= c.telefone - 0.3) add({ p: [A[0] + 0.5, 0.75, 0.55], s: mola(c.telefone - 0.3, 240, 12), txt: "tocando…", cor: C.destaque, tam: 0.9 });
    if (t >= c.ninguem - 0.1) add({ p: [A[0] - 0.6, 0.45, 0.8], s: mola(c.ninguem - 0.1, 240, 12), txt: "ninguém atende", cor: C.alerta, tinta: "#fff", tam: 0.95 });
  }

  // ---------------- estação 2 · recepção (o problema acontece)
  const naB = (t >= T1 - 0.05 && t < T2) || (t >= T3 && t < FECHO + 0.6);
  const faseSolucao = t >= T3;
  const linhas = !faseSolucao && t >= c.linhas - 0.3 ? 1 : 0;
  const pacAnda = p(t, c.espera - 0.2, T2 - c.espera + 0.2, ease.inOut); // paciente vai embora
  if (naB && !faseSolucao) {
    add({ p: [BX[0], 2.15, -0.4], s: mola(T1 + 0.2, 220, 13), txt: "Recepção", cor: "#ffffff", tam: 0.95 });
    if (t >= c.linhas - 0.3) add({ p: [BX[0] + 0.5, 0.75, 0.5], s: mola(c.linhas - 0.3, 240, 12), txt: "3 linhas tocando", cor: C.destaque, tam: 0.88 });
    if (t >= c.caixa - 0.2) add({ p: [BX[0] - 0.4, 0.2, 1.1], s: mola(c.caixa - 0.2, 240, 12), txt: "caixa postal", cor: C.alerta, tinta: "#fff", tam: 0.9 });
    if (t >= c.espera - 0.2) add({ p: [lerp(BX[0] + 0.9, BX[0] + 1.6, pacAnda), 1.0, 1.2], s: mola(c.espera - 0.2, 240, 12), txt: "não espera", cor: "#ffffff", tam: 0.85 });
  }
  if (naB && faseSolucao) {
    if (t < c.mande - 0.4) add({ p: [BX[0], 2.3, -0.4], s: mola(c.defina - 0.2, 220, 13), txt: "O processo", cor: "#ffffff", tam: 1.05 });
    if (t >= c.atende - 0.2) add({ p: [BX[0] - 0.55, 1.55, 0.6], s: mola(c.atende - 0.2, 240, 12), tipo: "card", titulo: "1", txt: "Quem atende?", cor: "#ffffff", tam: 0.72 });
    if (t >= c.tempo - 0.2) add({ p: [BX[0], 0.55, 1.2], s: mola(c.tempo - 0.2, 240, 12), tipo: "card", titulo: "2", txt: "Em quanto tempo?", cor: "#ffffff", tam: 0.72 });
    if (t >= c.retorna - 0.2) add({ p: [BX[0] + 0.55, 1.05, 0.6], s: mola(c.retorna - 0.2, 240, 12), tipo: "card", titulo: "3", txt: "Quem retorna?", cor: "#ffffff", tam: 0.72 });
  }

  // ---------------- estação 3 · a clínica da esquina
  const naC = t >= T2 - 0.05 && t < T3;
  const chega = p(t, T2 + 0.1, c.esquina - T2 + 0.3, ease.inOut);
  if (naC) {
    add({ p: [CX[0], 2.15, -0.4], s: mola(T2 + 0.2, 220, 13), txt: "A clínica da esquina", cor: "#ffffff", tam: 0.9 });
    if (t >= c.esquina) add({ p: [CX[0] + 0.1, 0.85, 0.7], s: mola(c.esquina, 240, 12), txt: "atende em 2 toques", cor: C.ok, tinta: "#fff", tam: 0.9 });
    if (t >= c.parabens) add({ p: [CX[0], 1.55, 0.2], s: mola(c.parabens, 200, 13), tipo: "card", titulo: "PARABÉNS", txt: "propaganda do concorrente", cor: C.destaque, tam: 0.7 });
  }

  return (
    <AbsoluteFill style={{ background: MUNDO.ceu }}>
      {t < FECHO + 0.6 ? (
        <StageMundo cam={cam} miniatura={0.3}>
          {naA ? (
            <group position={A}>
              <Modelo url="comercial/building-a" p={[0, 0, -1.7]} alvo={{ altura: 1.7 }} />
              <Mesa p={[0, 0, 0]} />
              <Telefone p={[0.12, 0.43, 0.02]} toca={toca} t={t} />
              <Modelo url="moveis/computerScreen" p={[-0.2, 0.43, -0.05]} alvo={{ comp: 0.22 }} />
              <Modelo url="moveis/chairDesk" p={[0, 0, -0.62]} rotY={Math.PI} alvo={{ altura: 0.45 }} />
              <Modelo url="natureza/tree_oak" p={[-1.9, 0, -1.4]} alvo={{ altura: 1.3 }} />
              <Modelo url="natureza/tree_detailed" p={[1.9, 0, -1.5]} alvo={{ altura: 1.2 }} />
            </group>
          ) : null}

          {naB ? (
            <group position={BX}>
              <Modelo url="comercial/building-a" p={[0, 0, -1.9]} alvo={{ altura: 1.7 }} />
              <Mesa p={[0, 0, 0]} />
              {[-0.28, 0, 0.28].map((x, i) => (
                <Telefone key={i} p={[x, 0.43, 0.02]} toca={linhas} t={t + i * 0.13} />
              ))}
              <Boneco url="personagens/character-female-d" p={[-0.5, 0, -0.55]} rotY={0.1} altura={0.56} anim={faseSolucao ? "emote-yes" : t >= c.recepcao ? "emote-no" : "idle"} tAnim={t} />
              <Boneco url="personagens/character-male-a" p={[0.5, 0, -0.55]} rotY={-0.1} altura={0.56} anim={faseSolucao ? "idle" : t >= c.linhas ? "emote-no" : "idle"} tAnim={t + 1} />
              {!faseSolucao ? (
                <Boneco
                  url="personagens/character-male-b"
                  p={[lerp(0.8, 1.1, pacAnda), 0, 1.2]}
                  rotY={pacAnda > 0.02 ? Math.PI / 2 : -0.5}
                  altura={0.56}
                  anim={pacAnda > 0.02 && pacAnda < 0.98 ? "walk" : "idle"}
                  tAnim={t}
                />
              ) : null}
              <Modelo url="natureza/tree_oak" p={[-2.0, 0, -1.5]} alvo={{ altura: 1.3 }} />
            </group>
          ) : null}

          {naC ? (
            <group position={CX}>
              <Modelo url="comercial/building-e" p={[0, 0, -1.9]} alvo={{ largura: 2.0 }} />
              <Mesa p={[0, 0, 0]} />
              <Telefone p={[0.12, 0.43, 0.02]} toca={0} t={t} />
              <Boneco url="personagens/character-female-d" p={[0, 0, -0.55]} altura={0.56} anim={t >= c.esquina ? "emote-yes" : "idle"} tAnim={t} />
              <Boneco
                url="personagens/character-male-b"
                p={[lerp(-1.2, -0.1, chega), 0, 1.0]}
                rotY={Math.PI / 2 - chega * 0.7}
                altura={0.56}
                s={Math.min(1, chega * 8)}
                anim={chega > 0.02 && chega < 0.98 ? "walk" : t >= c.parabens ? "emote-yes" : "idle"}
                tAnim={t}
              />
              <Modelo url="natureza/tree_detailed" p={[2.0, 0, -1.5]} alvo={{ altura: 1.2 }} />
            </group>
          ) : null}
        </StageMundo>
      ) : null}

      <TelaSegura itens={rot} cam={cam} />
      <PalavraGrande ate={c.mande - 0.35} destaque={DESTAQUE} />

      {t >= c.mande - 0.35 && t < FECHO ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 260, textAlign: "center", transform: `scale(${mola(c.mande - 0.35, 200, 13)})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 78, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#ffffff", WebkitTextStroke: "9px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
            Mande este vídeo para quem cuida da <span style={{ color: C.destaque }}>recepção</span>
          </div>
        </div>
      ) : null}

      {/* Nota de rodapé: exemplo ilustrativo, sem dado real. Troque por "Fonte: ... (data)" quando houver número de verdade. */}
      {t >= 0.3 && t < FECHO ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 600, color: "rgba(20,30,25,0.62)" }}>
          Exemplo ilustrativo · valores fictícios
        </div>
      ) : null}

      {[T1, T2, T3].map((x, i) => (
        <Flash key={i} at={x} max={0.35} />
      ))}
      <Flash at={c.parabens - 0.05} max={0.3} cor={C.destaque} dur={0.3} />
      <Fecho at={FECHO} />
      <Grain />
    </AbsoluteFill>
  );
};

void clamp01;
