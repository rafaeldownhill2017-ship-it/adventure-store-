import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, Modelo, precarregar } from "../lib/kenney";
import {
  BLOCO,
  BombaCombustivel,
  Calendario,
  Carimbo,
  CardNumero,
  Carregador,
  Cigarro,
  corBloco,
  Fabrica,
  Garrafa,
  Laco,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · carro1 · "O primeiro carro zero da família" (Imposto Seletivo em carro novo).
// Dados e ressalvas: docs/dossies/carro1.md. Valores = SIMULAÇÃO (carro ~100 cv, sem outros ajustes), marcada na tela.
// Blocos de cor: garagem (quente) → vermelho (imposto do pecado) → marinho (a conta) → verde (a troca pelo IPI) → garagem.
precarregar(["carros/sedan", "personagens/character-male-a", "personagens/character-male-d"]);

const G: V3 = [0, 0, 0]; // garagem
const V: V3 = [20, 0, 0]; // imposto do pecado
const P: V3 = [40, 0, 0]; // três pedestais
const F: V3 = [60, 0, 0]; // fábrica e a troca IPI → Seletivo
const PAI = "personagens/character-male-a";
const FILHO = "personagens/character-male-d";
const DESTAQUE = /zero|pecado|cigarro|bebida|elétrico|flex|gasolina|dobro|IPI|fábrica|família|congresso/i;
const MARCA_PNB = { nome: "Peso no Bolso", linha: "O dinheiro do dia a dia, explicado com fonte.", cta: "Segue o Peso no Bolso" };

const PED = [
  { x: -2.1, nome: "ELÉTRICO", pct: "5,2%", valor: "≈ R$ 5,2 mil", moedas: 5, aro: "#7dffb0", tinta: "#bfe6ff" },
  { x: 0, nome: "FLEX", pct: "7,6%", valor: "≈ R$ 7,6 mil", moedas: 8, aro: "#9be36b", tinta: "#c9f2c4" },
  { x: 2.1, nome: "SÓ GASOLINA", pct: "15,5%", valor: "≈ R$ 15,5 mil", moedas: 16, aro: "#ff6a5a", tinta: "#ffc4bc" },
];

/** Garagem de luz quente: piso, duas paredes, prateleira e lâmpada pendurada. */
const Garagem: React.FC<{ t: number }> = ({ t }) => (
  <group>
    <B s={[4.2, 0.02, 3.2]} p={[0, 0.01, -0.2]} cor="#8a7660" />
    <B s={[4.2, 2.2, 0.1]} p={[0, 1.1, -1.8]} cor="#c9a27a" />
    <B s={[0.1, 2.2, 3.2]} p={[-2.1, 1.1, -0.2]} cor="#b48c66" />
    <B s={[1.1, 0.06, 0.32]} p={[-1.3, 1.1, -1.62]} cor="#7a5a3e" />
    <B s={[0.3, 0.24, 0.26]} p={[-1.55, 1.25, -1.62]} cor="#d6453a" />
    <B s={[0.22, 0.3, 0.22]} p={[-1.15, 1.28, -1.62]} cor="#3f6fd6" />
    <B s={[0.012, 0.5, 0.012]} p={[0.2, 1.95, -0.3]} cor="#2a2f3a" />
    <mesh position={[0.2, 1.68, -0.3]}>
      <sphereGeometry args={[0.07, 16, 12]} />
      <meshStandardMaterial color="#ffe2a8" emissive="#ffc46b" emissiveIntensity={2 + Math.sin(t * 2) * 0.1} toneMapped={false} />
    </mesh>
  </group>
);

export const Carro1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.pois - 0.3; // garagem → imposto do pecado
  const T2 = c.bora - 0.3; // → a conta nos pedestais
  const T3 = c.parte - 0.3; // → a troca pelo IPI
  const T4 = c.comenta - 0.3; // → volta à garagem

  const K: Key[] = [
    [0, [G[0] + 0.6, 2.4, 8.6], [G[0] - 0.1, 0.6, 0], 34],
    [T1, [G[0] + 0.2, 2.2, 7.8], [G[0] - 0.1, 0.6, 0], 34],
    [T1, [V[0], 2.8, 10.2], [V[0], 0.6, 0], 34],
    [T2, [V[0], 2.7, 9.8], [V[0], 0.6, 0], 34],
    [T2, [P[0], 4.0, 17.0], [P[0], 0.5, 0], 34],
    [c.eletrico - 0.5, [P[0], 4.0, 17.0], [P[0], 0.5, 0], 34],
    [c.eletrico - 0.1, [P[0] - 2.1, 1.9, 6.4], [P[0] - 2.1, 0.6, 0], 34],
    [c.flex - 0.5, [P[0] - 2.1, 1.9, 6.4], [P[0] - 2.1, 0.6, 0], 34],
    [c.flex - 0.1, [P[0], 1.9, 6.4], [P[0], 0.6, 0], 34],
    [c.gasolina - 0.5, [P[0], 1.9, 6.4], [P[0], 0.6, 0], 34],
    [c.gasolina - 0.1, [P[0] + 2.1, 1.9, 6.4], [P[0] + 2.1, 0.6, 0], 34],
    [c.dobro - 0.4, [P[0] + 2.1, 1.9, 6.4], [P[0] + 2.1, 0.6, 0], 34],
    [c.dobro + 0.3, [P[0], 4.0, 17.4], [P[0], 0.5, 0], 34],
    [T3, [P[0], 4.0, 17.4], [P[0], 0.5, 0], 34],
    [T3, [F[0], 2.6, 10.4], [F[0], 0.6, -0.3], 34],
    [c.fabrica - 0.3, [F[0], 2.6, 10.4], [F[0], 0.6, -0.3], 34],
    [T4, [F[0] + 0.2, 2.3, 9.6], [F[0] + 0.3, 0.6, 0], 34],
    [T4, [G[0] + 0.6, 2.4, 8.6], [G[0] - 0.1, 0.6, 0], 34],
    [FECHO, [G[0] + 0.3, 2.2, 8.0], [G[0] - 0.1, 0.6, 0], 34],
  ];
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.garagem], [T1, BLOCO.vermelho], [T2, BLOCO.marinho], [T3, BLOCO.verde], [T4, BLOCO.garagem]], 0.25);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  const naG = t < T1 || t >= T4 - 0.05;
  const naV = t >= T1 - 0.05 && t < T2;
  const naP = t >= T2 - 0.05 && t < T3;
  const naF = t >= T3 - 0.05 && t < T4;

  // ---------------- garagem (gancho e pergunta final)
  if (t < T1) {
    if (t >= c.zero - 0.3) add({ p: [G[0] + 0.3, 1.5, 0], s: mola(c.zero - 0.3, 220, 13), tipo: "card", titulo: "A FAMÍLIA CONQUISTOU", txt: "O PRIMEIRO ZERO", cor: "#ffffff", tam: 0.72 });
  }

  // ---------------- imposto do pecado
  if (naV) {
    if (t >= c.congresso - 0.2) add({ p: [V[0] - 1.1, 1.25, -0.3], s: mola(c.congresso - 0.2, 240, 12), txt: "se o Congresso aprovar", cor: "#ffffff", tam: 0.8 });
  }

  // ---------------- a conta: três pedestais
  const ativo = t < c.flex - 0.3 ? 0 : t < c.gasolina - 0.3 ? 1 : 2;
  const visao = t >= c.dobro + 0.1 || t < c.eletrico - 0.3;
  if (naP && visao && t >= c.dobro) PED.forEach((d, i) => add({ p: [P[0] + d.x, 1.55, 0], s: mola(c.dobro + 0.1 + i * 0.12, 240, 12), txt: d.pct, cor: i === 2 ? C.alerta : "#ffffff", tinta: i === 2 ? "#fff" : C.ink, tam: 0.9 }));

  // ---------------- a troca pelo IPI
  const swap = t >= c.ipi + 0.35;
  const sai = p(t, c.fabrica - 0.2, 1.4, ease.inOut);
  if (naF) {
    add({ p: [F[0] + 0.3, 1.1, -0.4], s: mola(c.parte + 0.3, 240, 12), txt: swap ? "ENTRA O SELETIVO" : "SAI O IPI", cor: swap ? C.destaque : "#ffffff", tam: 0.82 });
    if (t >= c.fabrica - 0.2) add({ p: [F[0] + lerp(0.5, 0.2, sai), 0.3, lerp(0.2, 1.4, sai)], s: mola(c.fabrica, 240, 12), txt: "cobra na fábrica · carro zero", cor: "#ffffff", tam: 0.78 });
  }

  return (
    <AbsoluteFill style={{ background: cor }}>
      {t < FECHO + 0.6 ? (
        <PalcoCor cam={cam} cor={cor} quente={naG}>
          {naG ? (
            <group position={G}>
              <Garagem t={t} />
              <Modelo url="carros/sedan" p={[0.45, 0, -0.2]} rotY={-0.55} alvo={{ comp: 1.9 }} tinta="#ffffff" />
              <Laco p={[0.45, 0.98, -0.2]} rotY={-0.55} s={0.8} cor="#ffc94a" k={p(t, c.pai + 0.2, 0.6, (x) => x)} />
              <Ator url={PAI} p={[-0.75, 0, 0.9]} rotY={0.5} altura={0.95} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.zero - 0.2, anim: "emote-yes" }, { de: c.comenta, anim: "interact-right" }]} />
              <Ator url={FILHO} p={[-0.3, 0, 1.25]} rotY={0.2} altura={0.6} t={t} fase={0.4} acoes={[{ de: 0, anim: "idle" }, { de: c.cheiro, anim: "jump" }, { de: c.comenta + 0.2, anim: "jump" }]} />
            </group>
          ) : null}

          {naV ? (
            <group position={V}>
              <Pedestal p={[0, 0, 0]} raio={1.0} aro="#ffc94a" acende={p(t, T1 + 0.1, 0.5)} />
              <Modelo url="carros/sedan" p={[0, TOPO_PEDESTAL, 0]} rotY={-0.5} alvo={{ comp: 1.6 }} tinta="#ffffff" />
              <Calendario p={[-0.95, 0, -0.75]} rotY={0.35} s={0.75 * mola(c.fevereiro - 0.2, 200, 13)} mes="FEV" dia="2" ano="2027" />
              <Pedestal p={[-0.85, 0, 1.45]} raio={0.45} aro="#ff6a5a" s={mola(c.cigarro - 0.2, 220, 13)} />
              <Cigarro p={[-0.85, TOPO_PEDESTAL, 1.45]} rotY={0.4} s={0.6 * mola(c.cigarro - 0.1, 220, 13)} t={t} />
              <Pedestal p={[0.85, 0, 1.45]} raio={0.45} aro="#ff6a5a" s={mola(c.bebida - 0.2, 220, 13)} />
              <Garrafa p={[0.85, TOPO_PEDESTAL, 1.45]} tipo="cerveja" s={0.7 * mola(c.bebida - 0.1, 220, 13)} texto="CERVEJA" />
            </group>
          ) : null}

          {naP ? (
            <group position={P}>
              {PED.map((d, i) => {
                const cresce = p(t, [c.eletrico, c.flex, c.gasolina][i] + 0.1, 1.6, (x) => x);
                return (
                  <group key={d.nome} position={[d.x, 0, 0]}>
                    <Pedestal raio={0.7} aro={d.aro} acende={visao || ativo === i ? 1 : 0.15} />
                    <Modelo url="carros/sedan" p={[-0.1, TOPO_PEDESTAL, 0.05]} rotY={-0.6} alvo={{ comp: 1.0 }} tinta={d.tinta} />
                    {i === 0 ? (
                      <Carregador p={[0.3, TOPO_PEDESTAL, -0.42]} s={0.55} liga={p(t, c.eletrico, 0.4)} />
                    ) : (
                      <BombaCombustivel p={[0.3, TOPO_PEDESTAL, -0.42]} s={0.52} cor={i === 1 ? "#2f9f5b" : "#d6453a"} rotulo={i === 1 ? "FLEX" : "GASOLINA"} />
                    )}
                    <PilhaMoedas p={[0.42, TOPO_PEDESTAL, 0.32]} k={cresce} max={d.moedas} s={0.55} />
                  </group>
                );
              })}
            </group>
          ) : null}

          {naF ? (
            <group position={F}>
              <Fabrica p={[0, 0, -1.0]} s={1.2} t={t} />
              <Modelo url="carros/sedan" p={[lerp(0.55, 0.2, sai), 0, lerp(-0.4, 1.2, sai)]} rotY={lerp(0, -0.6, sai)} alvo={{ comp: 1.1 }} tinta="#ffffff" />
              {sai > 0.5 ? <Laco cor="#ffc94a" p={[lerp(0.55, 0.2, sai), 0.5, lerp(-0.4, 1.2, sai)]} rotY={-0.6} s={0.45} k={p(t, c.fabrica + 0.6, 0.5, (x) => x)} /> : null}
            </group>
          ) : null}
        </PalcoCor>
      ) : null}

      {t < FECHO ? <TelaSegura itens={rot} cam={cam} /> : null}

      {/* camada de topo: números grandes e carimbo */}
      <Carimbo t={t} de={c.pecado - 0.1} ate={T2 - 0.2} txt="IMPOSTO DO PECADO" top={250} />
      <CardNumero t={t} de={c.cem - 0.2} ate={c.eletrico - 0.3} titulo="CARRO SAINDO DA FÁBRICA" valor="R$ 100 mil" />
      {PED.map((d, i) => (
        <CardNumero key={d.nome} t={t} de={[c.eletrico, c.flex, c.gasolina][i] - 0.1} ate={[c.flex, c.gasolina, c.dobro][i] - 0.35} titulo={`SIMULAÇÃO ~100 CV · ${d.nome}`} valor={d.valor} cor={i === 2 ? C.alerta : "#ffffff"} tinta={i === 2 ? "#ffffff" : C.ink} />
      ))}
      <CardNumero t={t} de={c.dobro - 0.1} ate={T3 - 0.2} titulo="SÓ GASOLINA × FLEX" valor="O DOBRO" cor={C.destaque} />
      <CardNumero t={t} de={c.ipi - 0.1} ate={T4 - 0.2} titulo="TROCA DE IMPOSTO" antes="IPI" valor="SELETIVO" />
      <CardNumero t={t} de={c.comenta - 0.1} ate={FECHO - 0.2} titulo="COMENTA AQUI" valor="Qual foi o 1º carro?" />

      <PalavraGrande ate={FECHO - 0.3} destaque={DESTAQUE} />
      {[T1, T2, T3, T4].map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Fecho at={FECHO} marca={MARCA_PNB} />
      <Grain />
    </AbsoluteFill>
  );
};
