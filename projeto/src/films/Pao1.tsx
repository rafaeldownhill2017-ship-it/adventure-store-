import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, Modelo, precarregar } from "../lib/kenney";
import { Balcao, BLOCO, CardNumero, Cofre, corBloco, Moinho, Navio, NotasVoando, PalcoCor, Paozinho, Pedestal, PilhaMoedas, SacaTrigo, SacoPao, TOPO_PEDESTAL } from "../lib/objetos";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · pao1 · "O pão dos seus filhos" (dólar → trigo → pão). Dados: docs/dossies/pao1.md.
// Não promete percentual de aumento: "pode chegar no balcão". Blocos: noite → terra → vermelho → marinho → roxo → verde.
precarregar(["personagens/character-male-a", "comercial/building-a"]);

const A: V3 = [0, 0, 0]; // padaria de madrugada
const TR: V3 = [20, 0, 0]; // trigo e navio
const D: V3 = [40, 0, 0]; // cofre de dólares
const CH: V3 = [60, 0, 0]; // corrente moinho → padaria → balcão
const R: V3 = [80, 0, 0]; // o pão não muda
const PAI = "personagens/character-male-a";
const DESTAQUE = /dólar|trigo|safra|nove|trinta|cinco|noventa|abril|moinho|padaria|balcão|tamanho|render|pânico|pãozinho/i;
const MARCA_PNB = { nome: "Peso no Bolso", linha: "O dinheiro do dia a dia, explicado com fonte.", cta: "Segue o Peso no Bolso" };
const ELOS = [
  { x: -2.1, nome: "MOINHO", moedas: 4 },
  { x: 0, nome: "PADARIA", moedas: 8 },
  { x: 2.1, nome: "BALCÃO", moedas: 12 },
];

export const Pao1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.safra - 1.0; // "Esse ano, a safra..."
  const T2 = c.importado - 0.6; // "E trigo importado..."
  const T3 = c.moinho - 1.0; // "Esse dólar entra no moinho"
  const T4 = c.continua - 0.6; // "O pão continua..."
  const T5 = c.comenta - 0.3; // pergunta final
  const elo = [c.moinho, c.padaria, c.balcao];
  // recuo para mostrar a corrente inteira, sem passar do corte seguinte (voz rápida encurta o intervalo)
  const ABRE = Math.min(elo[2] + 1.1, T4 - 0.05);
  const SEGURA = Math.min(elo[2] + 0.4, ABRE - 0.35);

  const K: Key[] = [
    [0, [A[0] + 0.3, 2.3, 8.2], [A[0], 0.7, 0], 34],
    [T1, [A[0] + 0.15, 2.1, 7.4], [A[0], 0.7, 0], 34],
    [T1, [TR[0], 3.0, 11.2], [TR[0], 0.5, 0], 34],
    [T2, [TR[0] + 0.1, 2.9, 10.6], [TR[0] + 0.1, 0.5, 0], 34],
    [T2, [D[0], 2.4, 8.4], [D[0], 0.8, 0], 34],
    [T3, [D[0], 2.6, 9.2], [D[0], 0.9, 0], 34],
    [T3, [CH[0] - 2.1, 1.9, 6.6], [CH[0] - 2.1, 0.6, 0], 34],
    [elo[0] + 0.2, [CH[0] - 2.1, 1.9, 6.6], [CH[0] - 2.1, 0.6, 0], 34],
    [elo[1] - 0.1, [CH[0], 1.9, 6.6], [CH[0], 0.6, 0], 34],
    [elo[1] + 0.2, [CH[0], 1.9, 6.6], [CH[0], 0.6, 0], 34],
    [elo[2] - 0.1, [CH[0] + 2.1, 1.9, 6.6], [CH[0] + 2.1, 0.6, 0], 34],
    [SEGURA, [CH[0] + 2.1, 1.9, 6.6], [CH[0] + 2.1, 0.6, 0], 34],
    [ABRE, [CH[0], 4.0, 17.4], [CH[0], 0.5, 0], 34],
    [T4, [CH[0], 4.0, 17.4], [CH[0], 0.5, 0], 34],
    [T4, [R[0], 2.6, 9.8], [R[0], 0.6, 0], 34],
    [T5, [R[0], 2.7, 10.2], [R[0], 0.6, 0], 34],
    [T5, [A[0] + 0.3, 2.3, 8.2], [A[0], 0.7, 0], 34],
    [FECHO, [A[0] + 0.15, 2.2, 7.8], [A[0], 0.7, 0], 34],
  ];
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.noite], [T1, BLOCO.terra], [T2, BLOCO.vermelho], [T3, BLOCO.marinho], [T4, BLOCO.roxo], [T5, BLOCO.verde]], 0.25);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  const naA = t < T1 || t >= T5 - 0.05;
  const naTR = t >= T1 - 0.05 && t < T2;
  const naD = t >= T2 - 0.05 && t < T3;
  const naCH = t >= T3 - 0.05 && t < T4;
  const naR = t >= T4 - 0.05 && t < T5;

  // ---------------- padaria de madrugada
  if (t < T1) {
    add({ p: [A[0] - 0.4, 1.7, 0], s: mola(0.3, 220, 13), tipo: "card", titulo: "TODO DIA", txt: "6h da manhã", cor: "#ffffff", tam: 0.72 });
    if (t >= c.saquinho - 0.3) add({ p: [A[0] + 0.15, 0.95, 0.6], s: mola(c.saquinho - 0.3, 240, 12), txt: "tem dólar aqui dentro", cor: C.destaque, tam: 0.8 });
  }
  // ---------------- trigo
  if (naTR) {
    if (t >= c.safra - 0.2) add({ p: [TR[0] - 0.8, 1.2, 0.6], s: mola(c.safra - 0.2, 240, 12), txt: "safra daqui: −33%", cor: "#ffffff", tinta: C.alerta, tam: 0.82 });
    if (t >= c.trinta - 0.3) add({ p: [TR[0] + 0.45, 0.9, -0.5], s: mola(c.trinta - 0.3, 240, 12), txt: "maior em 30 anos", cor: C.destaque, tam: 0.82 });
  }
  // ---------------- dólar
  if (naD && t >= c.abril - 0.3) add({ p: [D[0], 1.85, 0], s: mola(c.abril - 0.3, 240, 12), txt: "maior desde abr/2025", cor: C.destaque, tam: 0.85 });
  // ---------------- corrente
  if (naCH) ELOS.forEach((e, i) => { if (t >= elo[i] - 0.25) add({ p: [CH[0] + e.x, 1.6, 0], s: mola(elo[i] - 0.25, 240, 12), txt: e.nome, cor: i === 2 ? C.destaque : "#ffffff", tam: 0.85 }); });
  // ---------------- o pão não muda
  const encolhe = p(t, c.render - 0.2, 1.4, ease.inOut);
  if (naR) {
    if (t >= c.tamanho - 0.4) add({ p: [R[0] - 0.8, 1.15, 0], s: mola(c.tamanho - 0.4, 240, 12), txt: "pão: mesmo tamanho", cor: "#ffffff", tam: 0.78 });
    if (t >= c.render - 0.4) add({ p: [R[0] + 0.8, 1.15, 0], s: mola(c.render - 0.4, 240, 12), txt: "dinheiro: rende menos", cor: C.destaque, tam: 0.78 });
  }

  const nNotas = Math.round(lerp(10, 5, encolhe));

  return (
    <AbsoluteFill style={{ background: cor }}>
      {t < FECHO + 0.6 ? (
        <PalcoCor cam={cam} cor={cor} quente={naA}>
          {naA ? (
            <group position={A}>
              <B s={[3.6, 0.02, 2.6]} p={[0, 0.01, -0.3]} cor="#2c3550" />
              <Modelo url="comercial/building-a" p={[0.2, 0, -2.0]} alvo={{ largura: 1.15 }} />
              <Balcao p={[0.45, 0, -0.35]} s={0.8} />
              <Ator url={PAI} p={[-0.4, 0, 0.5]} rotY={0.35} altura={0.9} t={t} acoes={[{ de: 0, anim: "walk" }, { de: 1.6, anim: "idle" }, { de: c.filhos, anim: "emote-yes" }, { de: c.comenta, anim: "interact-right" }]} />
              <SacoPao p={[-0.05, 0, 0.8]} s={0.6} rotY={-0.3} />
            </group>
          ) : null}

          {naTR ? (
            <group position={TR}>
              <Pedestal p={[-0.8, 0, 0.6]} raio={0.5} aro="#ffc94a" />
              <SacaTrigo p={[-0.8, TOPO_PEDESTAL, 0.6]} s={0.75} rotulo="TRIGO" />
              <B s={[3.2, 0.02, 1.4]} p={[0.6, 0.01, -0.5]} cor="#3f7fb6" />
              <Navio p={[0.45, 0.02, -0.55]} rotY={-0.55} s={lerp(0.5, 0.8, mola(c.nove - 0.3, 160, 14))} t={t} />
            </group>
          ) : null}

          {naD ? (
            <group position={D}>
              <Pedestal raio={0.85} aro="#ffc94a" acende={p(t, T2 + 0.1, 0.5)} />
              <Cofre p={[0, TOPO_PEDESTAL, 0]} abre={p(t, c.importado + 0.3, 1.0)} />
              <NotasVoando de={[0, TOPO_PEDESTAL + 0.5, 0.4]} k={p(t, c.cinco - 0.2, 2.8, (x) => x)} n={22} />
            </group>
          ) : null}

          {naCH ? (
            <group position={CH}>
              {ELOS.map((e, i) => (
                <group key={e.nome} position={[e.x, 0, 0]}>
                  <Pedestal raio={0.75} aro={i === 2 ? "#ffc94a" : "#7dd3ff"} acende={t >= elo[i] - 0.2 ? 1 : 0.15} />
                  {i === 0 ? <Moinho p={[-0.15, TOPO_PEDESTAL, -0.1]} s={0.85} t={t} /> : null}
                  {i === 1 ? <Modelo url="comercial/building-a" p={[-0.15, TOPO_PEDESTAL, -0.1]} alvo={{ largura: 0.6 }} /> : null}
                  {i === 2 ? <Balcao p={[-0.1, TOPO_PEDESTAL, -0.1]} s={0.75} /> : null}
                  <PilhaMoedas p={[0.45, TOPO_PEDESTAL, 0.35]} k={p(t, elo[i], 1.2, (x) => x)} max={e.moedas} s={0.55} />
                </group>
              ))}
            </group>
          ) : null}

          {naR ? (
            <group position={R}>
              <Pedestal p={[-0.8, 0, 0]} raio={0.6} aro="#ffc94a" />
              <Paozinho p={[-0.8, TOPO_PEDESTAL, 0]} rotY={0.4} s={1.5} />
              <Pedestal p={[0.8, 0, 0]} raio={0.6} aro="#ff6a5a" />
              {Array.from({ length: nNotas }, (_, i) => (
                <group key={i} position={[0.8, TOPO_PEDESTAL + 0.03 + i * 0.045, 0]} rotation={[0, (i % 3) * 0.12 - 0.12, 0]}>
                  <B s={[0.62, 0.035, 0.3]} cor={i % 2 ? "#5fae5a" : "#6dbb5e"} />
                </group>
              ))}
            </group>
          ) : null}
        </PalcoCor>
      ) : null}

      {t < FECHO ? <TelaSegura itens={rot} cam={cam} /> : null}

      <CardNumero t={t} de={c.nove - 0.2} ate={T2 - 0.2} titulo="TRIGO IMPORTADO · 2026/27" valor="+ de 9 mi t" />
      <CardNumero t={t} de={c.cinco - 0.2} ate={T3 - 0.2} titulo="DÓLAR · 19/11/2026" valor="R$ 5,93" />
      <CardNumero t={t} de={c.panico - 0.3} ate={T5 - 0.2} titulo="NÃO É PÂNICO" valor="É FICAR DE OLHO" />
      <CardNumero t={t} de={c.comenta - 0.1} ate={FECHO - 0.2} titulo="COMENTA AQUI" valor="Quanto tá o pãozinho?" />

      <PalavraGrande ate={FECHO - 0.3} destaque={DESTAQUE} />
      {[T1, T2, T3, T4, T5].map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Fecho at={FECHO} marca={MARCA_PNB} />
      <Grain />
    </AbsoluteFill>
  );
};
