import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import {
  BLOCO,
  CardNumero,
  Cofre,
  Cofrinho,
  corBloco,
  Calendario,
  Mala,
  NotasVoando,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { p, useT, useTimeline } from "../lib/time";
import { Fecho, Flash, Grain, PalavraGrande, Selo, useMola } from "../lib/ui";

// PESO NO BOLSO · CAIXA DO BOLSO 1/3 · "Cada seguidor vale R$ 10 (de mentirinha) e você decide".
// Série de no máximo 3 partes: 1) votação  2) um mês depois: quanto rendeu  3) fechamento (3 meses).
// Taxas e ressalvas: docs/dossies/caixa1.md. É SIMULAÇÃO: o selo fica na tela o vídeo inteiro.
//
// >>> ANTES DO RENDER: troque SEGUIDORES pelo número real do perfil no dia (a voz não fala o número). <<<
export const SEGUIDORES: number | null = 28; // perfil @pesonobolso em 20/11/2026 (print do usuário)
const POR_SEGUIDOR = 10;

const fmt = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
const A: V3 = [0, 0, 0]; // a caixa
const O: V3 = [20, 0, 0]; // as três opções
const X: V3 = [40, 0, 0]; // exemplo com R$ 1.000
const DESTAQUE = /dez|mentirinha|caixa|você|poupança|oito|tesouro|onze|imposto|torrar|zera|mil|POUPANÇA|TESOURO|TORRAR|novo/i;
const MARCA_PNB = { nome: "Peso no Bolso", linha: "O dinheiro do dia a dia, explicado com fonte.", cta: "Comenta o seu voto" };
const OPC = [
  { x: -2.1, nome: "POUPANÇA", taxa: "≈ 8% ao ano", aro: "#ff9bb8" },
  { x: 0, nome: "TESOURO SELIC", taxa: "≈ 11% ao ano (líquido)", aro: "#ffc94a" },
  { x: 2.1, nome: "TORRAR", taxa: "R$ 0", aro: "#ff6a5a" },
];

export const Caixa1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.decide - 0.7; // "Agora quem decide..."
  const T2 = c.ideia - 0.5; // "Pra ter ideia..."
  const T3 = c.comenta - 0.3; // votação
  const opc = [c.um, c.dois, c.tres];
  const saldo = SEGUIDORES === null ? null : SEGUIDORES * POR_SEGUIDOR;
  const saldoTxt = saldo === null ? "R$ ???" : `R$ ${fmt(saldo)}`;
  const seguTxt = SEGUIDORES === null ? "Nº DE SEGUIDORES × R$ 10" : `${fmt(SEGUIDORES)} SEGUIDORES × R$ 10`;

  const ABRE = Math.min(c.zera + 1.2, T2 - 0.05);
  const K: Key[] = [
    [0, [A[0], 2.2, 7.4], [A[0], 0.8, 0], 34],
    [T1, [A[0], 2.4, 8.0], [A[0], 0.8, 0], 34],
    [T1, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [opc[0] - 0.4, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [opc[0], [O[0] - 2.1, 1.9, 6.4], [O[0] - 2.1, 0.6, 0], 34],
    [opc[1] - 0.4, [O[0] - 2.1, 1.9, 6.4], [O[0] - 2.1, 0.6, 0], 34],
    [opc[1], [O[0], 1.9, 6.4], [O[0], 0.6, 0], 34],
    [opc[2] - 0.4, [O[0], 1.9, 6.4], [O[0], 0.6, 0], 34],
    [opc[2], [O[0] + 2.1, 1.9, 6.4], [O[0] + 2.1, 0.6, 0], 34],
    [ABRE - 0.6, [O[0] + 2.1, 1.9, 6.4], [O[0] + 2.1, 0.6, 0], 34],
    [ABRE, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [T2, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [T2, [X[0], 2.6, 9.2], [X[0], 0.6, 0], 34],
    [T3, [X[0], 2.6, 9.4], [X[0], 0.6, 0], 34],
    [T3, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [c.novo - 0.3, [O[0], 4.0, 17.0], [O[0], 0.5, 0], 34],
    [c.novo, [A[0], 2.2, 7.4], [A[0], 0.8, 0], 34],
    [FECHO, [A[0], 2.1, 7.0], [A[0], 0.8, 0], 34],
  ];
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.verde], [T1, BLOCO.marinho], [T2, BLOCO.terra], [T3, BLOCO.roxo], [c.novo, BLOCO.verde]], 0.25);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  const naA = t < T1 || t >= c.novo - 0.05;
  const naO = (t >= T1 - 0.05 && t < T2) || (t >= T3 - 0.05 && t < c.novo);
  const naX = t >= T2 - 0.05 && t < T3;
  const votacao = t >= T3 - 0.05;

  if (t < T1 && t >= c.mentirinha - 0.3) add({ p: [A[0] - 0.6, 0.75, 1.1], s: mola(c.mentirinha - 0.3, 240, 12), txt: "simulação", cor: "#ffffff", tam: 0.85 });
  if (naO) OPC.forEach((o, i) => { if (votacao || t >= opc[i] - 0.3 || t < opc[0] - 0.4) add({ p: [O[0] + o.x, 1.5, 0], s: mola(votacao ? T3 + i * 0.12 : Math.min(opc[i] - 0.3, T1 + 0.2 + i * 0.12), 240, 12), txt: o.nome, cor: votacao ? C.destaque : "#ffffff", tam: 0.9 }); });
  if (naX) {
    add({ p: [X[0] - 0.9, 1.35, 0], s: mola(c.mil, 240, 12), txt: "R$ 1.080", cor: "#ffffff", tam: 0.9 });
    add({ p: [X[0] + 0.9, 1.6, 0], s: mola(c.tesouro2 - 0.1, 240, 12), txt: "R$ 1.112", cor: C.destaque, tam: 0.9 });
  }

  const torra = p(t, c.zera - 0.3, 1.8, (x) => x);
  const cresce = (t0: number) => p(t, t0, 1.4, (x) => x);

  return (
    <AbsoluteFill style={{ background: cor }}>
      {t < FECHO + 0.6 ? (
        <PalcoCor cam={cam} cor={cor}>
          {naA ? (
            <group position={A}>
              <Pedestal raio={0.9} aro="#ffc94a" acende={p(t, 0.2, 0.6)} />
              <Cofre p={[0, TOPO_PEDESTAL, 0]} abre={p(t, c.caixa - 0.2, 1.0)} />
              <NotasVoando de={[0, TOPO_PEDESTAL + 0.5, 0.4]} k={p(t, c.caixa, 2.2, (x) => x)} n={16} alcance={1.6} />
              <Cofrinho p={[0.8, 0, 1.0]} rotY={-0.5} s={0.45} moeda={p(t, c.novo + 0.4, 0.8, (x) => x)} balanca={p(t, c.novo + 1.1, 0.5, (x) => x)} />
            </group>
          ) : null}

          {naO ? (
            <group position={O}>
              {OPC.map((o, i) => (
                <group key={o.nome} position={[o.x, 0, 0]}>
                  <Pedestal raio={0.75} aro={o.aro} acende={votacao || t >= opc[i] - 0.2 ? 1 : 0.2} />
                  {i === 0 ? <Cofrinho p={[-0.1, TOPO_PEDESTAL, 0]} s={0.8} rotY={0.3} /> : null}
                  {i === 1 ? <Calendario p={[-0.15, TOPO_PEDESTAL, -0.05]} s={0.6} rotY={0.2} mes="TESOURO" dia="12" ano="MESES" /> : null}
                  {i === 2 ? <Mala p={[-0.1, TOPO_PEDESTAL, 0]} s={0.7} rotY={-0.3} /> : null}
                  {i < 2 ? <PilhaMoedas p={[0.42, TOPO_PEDESTAL, 0.3]} k={votacao ? 1 : cresce(opc[i] + 0.3)} max={i === 0 ? 8 : 11} s={0.55} /> : null}
                  {i === 2 && !votacao ? <NotasVoando de={[0.1, TOPO_PEDESTAL + 0.6, 0]} k={torra} n={14} alcance={2.0} /> : null}
                </group>
              ))}
            </group>
          ) : null}

          {naX ? (
            <group position={X}>
              <Pedestal p={[-0.9, 0, 0]} raio={0.6} aro="#ff9bb8" />
              <PilhaMoedas p={[-0.9, TOPO_PEDESTAL, 0]} k={cresce(c.mil - 0.2)} max={13} s={0.8} />
              <Pedestal p={[0.9, 0, 0]} raio={0.6} aro="#ffc94a" />
              <PilhaMoedas p={[0.9, TOPO_PEDESTAL, 0]} k={cresce(c.tesouro2 - 0.2)} max={18} s={0.8} />
            </group>
          ) : null}
        </PalcoCor>
      ) : null}

      {t < FECHO ? <TelaSegura itens={rot} cam={cam} /> : null}
      {t < FECHO ? <Selo txt="SIMULAÇÃO · CAIXA DO BOLSO 1/3" /> : null}

      <CardNumero t={t} de={c.dez - 0.2} ate={T1 - 0.2} titulo={seguTxt} valor={saldoTxt} />
      {OPC.map((o, i) => (
        <CardNumero key={o.nome} t={t} de={opc[i] + 0.1} ate={(i < 2 ? opc[i + 1] : ABRE) - 0.35} titulo={o.nome} valor={o.taxa} cor={i === 2 ? C.alerta : "#ffffff"} tinta={i === 2 ? "#ffffff" : C.ink} />
      ))}
      <CardNumero t={t} de={T2 + 0.1} ate={T3 - 0.2} titulo="EXEMPLO · 12 MESES, SE AS TAXAS FICAREM" valor="R$ 1.000" />
      <CardNumero t={t} de={c.comenta - 0.1} ate={c.novo - 0.3} titulo="COMENTA O SEU VOTO" valor="POUPANÇA · TESOURO · TORRAR" />
      <CardNumero t={t} de={c.novo} ate={FECHO - 0.2} titulo="CADA SEGUIDOR NOVO" valor="+ R$ 10 NA CAIXA" cor={C.destaque} />

      <PalavraGrande ate={FECHO - 0.3} destaque={DESTAQUE} />
      {[T1, T2, T3, c.novo].map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Fecho at={FECHO} marca={MARCA_PNB} />
      <Grain />
    </AbsoluteFill>
  );
};
