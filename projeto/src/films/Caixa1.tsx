import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Modelo, precarregar } from "../lib/kenney";
import {
  BLOCO,
  CardNumero,
  Cofre,
  Cofrinho,
  corBloco,
  Calendario,
  GloboSorteio,
  Laco,
  NotasVoando,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  Piramide,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { Flash, Grain, PalavraGrande, Selo, useMola } from "../lib/ui";

// PESO NO BOLSO · CAIXA DO BOLSO 1/3 · "28 seguidores = R$ 280 (de mentirinha). Meta: 50. Você decide."
// Duas "besteiras" explicadas (pirâmide e Mega-Sena), duas opções sérias (poupança e Tesouro Selic) e a escada de
// aquisições futuras (100 → 1.000 → 10 mil seguidores = o carro zero do carro1). Dados: docs/dossies/caixa1.md.
// Série de no máximo 3 partes. É SIMULAÇÃO: o selo fica na tela o vídeo inteiro.
precarregar(["carros/sedan"]);

/** Seguidores no dia (a voz fala "vinte e oito"; se mudar, regrave a voz). */
export const SEGUIDORES = 28;

const A: V3 = [0, 0, 0]; // a caixa
const O: V3 = [20, 0, 0]; // grade 2×2 de opções
const E: V3 = [40, 0, 0]; // escada de aquisições
const DESTAQUE = /vinte|oito|dez|duzentos|noventa|seguir|cinquenta|quinhentos|Faltam|jogos|ridícula|marca|mentirinha|você|pirâmide|novecentos|some|tudo|Mega|quarenta|milhão|poupança|trezentos|Tesouro|imposto|cem|mil|carro|PIRÂMIDE|MEGA|POUPANÇA|TESOURO|segue/i;
const OPC = [
  { nome: "PIRÂMIDE", x: -1.05, z: -1.1, aro: "#ff6a5a" },
  { nome: "MEGA", x: 1.05, z: -1.1, aro: "#7dffb0" },
  { nome: "POUPANÇA", x: -1.05, z: 1.0, aro: "#ff9bb8" },
  { nome: "TESOURO", x: 1.05, z: 1.0, aro: "#ffc94a" },
];
const DEGRAUS = [
  { x: -1.15, alt: 0.3, seg: "50 seguidores", valor: "R$ 500" },
  { x: 0, alt: 0.6, seg: "100 seguidores", valor: "R$ 1.000" },
  { x: 1.15, alt: 0.9, seg: "10 mil seguidores", valor: "R$ 100 mil" },
];
const META = 50;

/**
 * CONTADOR DE SALDO + barra da meta, fixo abaixo da legenda (padrão "contador de saldo" das referências).
 * O valor rola de um número a outro e muda de cor: verde = "no papel", vermelho = perdeu, dourado = meta.
 */
const Painel: React.FC<{ valor: number; rotulo: string; cor: string; fantasma: number }> = ({ valor, rotulo, cor, fantasma }) => {
  const k = SEGUIDORES / META;
  const kf = (SEGUIDORES + 1) / META;
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1490, fontFamily: FONT, color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12, textShadow: "0 3px 10px rgba(0,0,0,0.45)" }}>
        <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "0.04em", opacity: 0.92 }}>{rotulo}</span>
        <span style={{ fontSize: 66, fontWeight: 800, letterSpacing: "-0.03em", color: cor, WebkitTextStroke: "6px rgba(10,14,12,0.85)", paintOrder: "stroke fill" }}>
          R$ {fmtR(valor)}
        </span>
      </div>
      <div style={{ height: 32, borderRadius: 16, background: "rgba(10,14,12,0.55)", overflow: "hidden", position: "relative", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${kf * 100}%`, background: C.destaque, opacity: 0.45 * fantasma }} />
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${k * 100}%`, background: C.destaque, borderRadius: 16 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 23, fontWeight: 800, color: "#fff", textShadow: "0 0 6px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.8)" }}>
          {SEGUIDORES}/{META} seguidores · meta R$ {META * 10}{fantasma > 0.5 ? " · você é o próximo?" : ""}
        </div>
      </div>
    </div>
  );
};
const fmtR = (v: number) => Math.round(v).toLocaleString("pt-BR");

export const Caixa1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0; // sem cartão branco: o vídeo termina no cofre e volta ao gancho (loop)
  const T1 = c.decide - 0.7; // "E quem decide..."
  const T2 = c.cresce - 1.3; // "E quanto mais a caixa cresce"
  const T3 = c.comenta - 0.3; // votação
  const T4 = c.segue - 0.3; // volta à caixa
  const ini = [c.um, c.dois, c.tres, c.quatro]; // início de cada opção
  const fim = [c.dois, c.tres, c.quatro, T2]; // fim de cada opção

  const WIDE: [V3, V3] = [[O[0], 5.6, 11.8], [O[0], 0.3, -0.05]];
  const close = (i: number): [V3, V3] => [[O[0] + OPC[i].x, 2.0, OPC[i].z + 5.4], [O[0] + OPC[i].x, 0.65, OPC[i].z]];
  const K: Key[] = [
    [0, [A[0], 2.2, 7.4], [A[0], 0.8, 0], 34],
    [T1, [A[0], 2.4, 8.0], [A[0], 0.8, 0], 34],
    [T1, ...WIDE, 34],
    [ini[0] - 0.3, ...WIDE, 34],
  ];
  OPC.forEach((_, i) => {
    K.push([ini[i] + 0.15, ...close(i), 34]);
    K.push([Math.max(ini[i] + 0.2, fim[i] - 0.35), ...close(i), 34]);
  });
  K.push(
    [T2, ...close(3), 34],
    [T2, [E[0], 3.0, 10.8], [E[0], 0.75, 0], 34],
    [T3, [E[0], 3.1, 11.2], [E[0], 0.75, 0], 34],
    [T3, ...WIDE, 34],
    [T4, ...WIDE, 34],
    [T4, [A[0], 2.2, 7.4], [A[0], 0.8, 0], 34],
    [FECHO, [A[0], 2.1, 7.0], [A[0], 0.8, 0], 34],
  );
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.verde], [T1, BLOCO.marinho], [T2, BLOCO.terra], [T3, BLOCO.roxo], [T4, BLOCO.verde]], 0.25);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  const naA = t < T1 || t >= T4 - 0.05;
  const naO = (t >= T1 - 0.05 && t < T2) || (t >= T3 - 0.05 && t < T4);
  const naE = t >= T2 - 0.05 && t < T3;
  const votacao = t >= T3 - 0.05;
  const desaba = p(t, c.some - 0.1, 1.4, (x) => x);
  // ---------------- contador de saldo
  const CX = SEGUIDORES * 10;
  const rola = (t0: number, dur: number, a: number, b: number) => lerp(a, b, p(t, t0, dur, ease.out));
  let saldo = rola(0.3, 2.6, 0, CX);
  let rotulo = "CAIXA DO BOLSO";
  let corSaldo = "#ffffff";
  if (t >= c.papel - 0.1 && t < c.some - 0.1) [saldo, rotulo, corSaldo] = [rola(c.papel, 2.4, CX, 879), "PIRÂMIDE · NO PAPEL", "#7dffb0"];
  else if (t >= c.some - 0.1 && t < c.dois - 0.2) [saldo, rotulo, corSaldo] = [rola(c.some - 0.1, 0.7, 879, 0), "PIRÂMIDE · NA VIDA REAL", "#ff6a5a"];
  else if (t >= c.dois - 0.2 && t < c.tres - 0.2) rotulo = "MEGA · 46 JOGOS DE R$ 6";
  else if (t >= c.tres - 0.2 && t < c.quatro - 0.2) [saldo, rotulo, corSaldo] = [rola(c.poupanca + 0.3, 1.6, CX, 302), "POUPANÇA · EM 12 MESES", "#7dffb0"];
  else if (t >= c.quatro - 0.2 && t < T2) [saldo, rotulo, corSaldo] = [rola(c.tesouro + 0.3, 1.6, CX, 311), "TESOURO · 12 MESES, LÍQUIDO", "#7dffb0"];
  else if (t >= T2 && t < T3) {
    const m = t < c.cem - 0.3 ? rola(T2 + 0.3, 1.0, CX, 500) : t < c.dezmil - 0.3 ? rola(c.cem - 0.3, 1.0, 500, 1000) : rola(c.dezmil - 0.3, 1.4, 1000, 100000);
    [saldo, rotulo, corSaldo] = [m, "META DA CAIXA", C.destaque];
  }
  // nos closes só aparece a opção da vez (as da frente tapavam as de trás); no plano aberto, todas
  const aberto = votacao || t < ini[0] - 0.3;
  const vez = ini.findIndex((a, i) => t >= a - 0.3 && t < fim[i]);
  const ve = (i: number) => aberto || i === vez;

  // ---------------- caixa
  if (t < T1 && t >= c.mentirinha - 0.3) add({ p: [A[0] - 0.6, 0.75, 1.1], s: mola(c.mentirinha - 0.3, 240, 12), txt: "simulação", cor: "#ffffff", tam: 0.85 });
  // ---------------- grade
  if (naO)
    OPC.forEach((o, i) => {
      const mostra = ve(i);
      if (mostra) add({ p: [O[0] + o.x, 1.45, o.z], s: mola(votacao ? T3 + i * 0.1 : Math.min(ini[i] - 0.3, T1 + 0.2 + i * 0.1), 240, 12), txt: o.nome, cor: votacao ? C.destaque : "#ffffff", tam: 0.85 });
    });
  if (naO && !votacao && t >= c.some + 0.4 && t < fim[0]) add({ p: [O[0] + OPC[0].x, 0.25, OPC[0].z + 0.9], s: mola(c.some + 0.4, 240, 12), txt: "pirâmide é crime (Lei 1.521/51)", cor: "#ffffff", tinta: C.alerta, tam: 0.72 });
  if (naO && !votacao && t >= c.mega && t < fim[1]) add({ p: [O[0] + OPC[1].x, 0.25, OPC[1].z + 0.9], s: mola(c.mega, 240, 12), txt: "jogo é para maiores de 18", cor: "#ffffff", tam: 0.7 });
  if (t >= c.segue + 0.5) add({ p: [A[0] - 0.55, 1.35, 0.3], s: mola(c.segue + 0.5, 240, 12), txt: "ep. 2 em 30 dias: o resultado", cor: "#ffffff", tam: 0.8 });
  // ---------------- escada
  if (naE)
    DEGRAUS.forEach((d, i) => {
      const t0 = [T2 + 0.4, c.cem, c.dezmil][i] - 0.3;
      if (t >= t0) add({ p: [E[0] + d.x, d.alt + 1.05, 0], s: mola(t0, 240, 12), txt: `${d.seg} = ${d.valor}`, cor: i === 2 ? C.destaque : "#ffffff", tam: 0.66 });
    });

  return (
    <AbsoluteFill style={{ background: cor }}>
      {true ? (
        <PalcoCor cam={cam} cor={cor}>
          {naA ? (
            <group position={A}>
              <Pedestal raio={0.9} aro="#ffc94a" acende={p(t, 0.2, 0.6)} />
              <Cofre p={[0, TOPO_PEDESTAL, 0]} abre={p(t, 0.25, 0.7)} />
              <NotasVoando de={[0, TOPO_PEDESTAL + 0.5, 0.4]} k={p(t, 0.35, 2.6, (x) => x)} n={22} alcance={1.8} />
              <Cofrinho p={[0.62, 0, 1.15]} rotY={-0.5} s={0.42} moeda={p(t, c.segue + 0.4, 0.8, (x) => x)} balanca={p(t, c.segue + 1.1, 0.5, (x) => x)} />
            </group>
          ) : null}

          {naO ? (
            <group position={O}>
              {OPC.map((o, i) => !ve(i) ? null : (
                <group key={o.nome} position={[o.x, 0, o.z]}>
                  <Pedestal raio={0.6} aro={o.aro} acende={votacao || t >= ini[i] - 0.2 ? 1 : 0.2} />
                  {i === 0 ? <Piramide p={[0, TOPO_PEDESTAL, 0]} s={0.75} desaba={votacao ? 1 : desaba} /> : null}
                  {i === 0 && !votacao ? <NotasVoando de={[0, TOPO_PEDESTAL + 0.4, 0]} k={p(t, c.some, 1.6, (x) => x)} n={12} alcance={1.6} /> : null}
                  {i === 1 ? <GloboSorteio p={[0, TOPO_PEDESTAL, 0]} s={0.9} t={t} /> : null}
                  {i === 2 ? <Cofrinho p={[-0.1, TOPO_PEDESTAL, 0]} s={0.7} rotY={0.3} /> : null}
                  {i === 3 ? <Calendario p={[-0.12, TOPO_PEDESTAL, -0.05]} s={0.55} rotY={0.2} mes="TESOURO" dia="12" ano="MESES" /> : null}
                  {i >= 2 ? <PilhaMoedas p={[0.35, TOPO_PEDESTAL, 0.25]} k={votacao ? 1 : p(t, ini[i] + 0.6, 1.4, (x) => x)} max={i === 2 ? 8 : 10} s={0.5} /> : null}
                </group>
              ))}
            </group>
          ) : null}

          {naE ? (
            <group position={E}>
              {DEGRAUS.map((d, i) => {
                const t0 = [T2 + 0.4, c.cem, c.dezmil][i] - 0.3;
                const s = mola(t0, 200, 13);
                return (
                  <group key={d.seg} position={[d.x, 0, 0]}>
                    <Pedestal raio={0.55} alt={d.alt} aro={i === 2 ? "#ffc94a" : "#7dd3ff"} acende={t >= t0 ? 1 : 0.15} />
                    {i === 0 ? <PilhaMoedas p={[0, d.alt, 0]} k={s > 0.01 ? 1 : 0} max={6} s={0.6 * Math.min(1, s)} /> : null}
                    {i === 1 ? <Cofre p={[0, d.alt, 0]} s={0.45 * s} abre={p(t, t0 + 0.4, 0.8)} /> : null}
                    {i === 2 && t >= c.carro - 0.3 ? (
                      <>
                        <Modelo url="carros/sedan" p={[0, d.alt, 0]} rotY={-0.6} alvo={{ comp: 0.95 }} s={mola(c.carro - 0.3, 200, 13)} tinta="#ffffff" />
                        <Laco p={[0, d.alt + 0.5, 0]} rotY={-0.6} s={0.45} cor="#ffc94a" k={p(t, c.carro, 0.5, (x) => x)} />
                      </>
                    ) : null}
                  </group>
                );
              })}
            </group>
          ) : null}
        </PalcoCor>
      ) : null}

      <TelaSegura itens={rot} cam={cam} />
      <Selo txt="SIMULAÇÃO · CAIXA DO BOLSO 1/3" />

      {/* caixa */}
      <CardNumero t={t} de={-0.6} ate={c.dez - 0.3} titulo="ESTE PERFIL HOJE" valor={`${SEGUIDORES} seguidores`} />
      <CardNumero t={t} de={c.dez - 0.1} ate={c.seguir - 0.3} titulo={`${SEGUIDORES} × R$ 10`} valor={`R$ ${SEGUIDORES * 10}`} cor={C.destaque} />
      <CardNumero t={t} de={c.seguir - 0.1} ate={c.meta - 0.3} titulo="SE VOCÊ SEGUIR AGORA" antes={`R$ ${SEGUIDORES * 10}`} valor={`R$ ${(SEGUIDORES + 1) * 10}`} />
      <CardNumero t={t} de={c.meta - 0.1} ate={c.faltam - 0.3} titulo="PRIMEIRA META" valor={`${META} = R$ ${META * 10}`} cor={C.destaque} />
      <CardNumero t={t} de={c.faltam - 0.1} ate={T1 - 0.2} titulo="FALTAM" valor={`${META - SEGUIDORES} seguidores`} />
      {/* pirâmide */}
      <CardNumero t={t} de={c.piramide - 0.1} ate={c.papel - 0.3} titulo="A PROMESSA" valor="10% ao mês" cor={C.alerta} tinta="#ffffff" />
      <CardNumero t={t} de={c.papel - 0.1} ate={c.some - 0.3} titulo="NO PAPEL, EM 12 MESES" antes="R$ 280" valor="R$ 879" />
      <CardNumero t={t} de={c.some - 0.1} ate={fim[0] - 0.35} titulo="NA VIDA REAL" valor="R$ 0" cor={C.alerta} tinta="#ffffff" />
      {/* mega */}
      <CardNumero t={t} de={c.quarenta - 0.2} ate={c.novo - 0.3} titulo="R$ 280 ÷ R$ 6 POR JOGO" valor="46 jogos" />
      <CardNumero t={t} de={c.novo - 0.1} ate={c.ridicula - 0.3} titulo="CADA SEGUIDOR NOVO" valor="+ quase 2 jogos" cor={C.destaque} />
      <CardNumero t={t} de={c.ridicula - 0.1} ate={fim[1] - 0.35} titulo="CHANCE COM 46 JOGOS" valor="1 em 1,09 milhão" />
      {/* poupança e tesouro */}
      <CardNumero t={t} de={c.poupanca} ate={fim[2] - 0.35} titulo="POUPANÇA · 12 MESES" antes="R$ 280" valor="≈ R$ 302" />
      <CardNumero t={t} de={c.tesouro} ate={T2 - 0.3} titulo="TESOURO SELIC · 12 MESES, LÍQUIDO" antes="R$ 280" valor="≈ R$ 311" />
      {/* escada */}
      <CardNumero t={t} de={T2 + 0.2} ate={T3 - 0.2} titulo="A CAIXA CRESCE COM VOCÊ" valor="compra e investe mais" />
      {/* votação e fecho */}
      <CardNumero t={t} de={c.comenta - 0.1} ate={c.marca - 0.3} titulo="COMENTA O SEU VOTO" valor="PIRÂMIDE · MEGA · POUPANÇA · TESOURO" />
      <CardNumero t={t} de={c.marca - 0.1} ate={T4 - 0.2} titulo="E MARCA" valor="quem ia escolher a pirâmide" />
      <CardNumero t={t} de={c.segue} ate={99} titulo="SEGUE PRA VER A CAIXA CRESCER" valor="+ R$ 10 por seguidor" cor={C.destaque} />
      <Painel valor={saldo} rotulo={rotulo} cor={corSaldo} fantasma={t >= c.seguir - 0.1 && t < T1 ? 0.5 + 0.5 * Math.sin(t * 8) : t >= T4 ? 1 : 0} />

      <PalavraGrande destaque={DESTAQUE} />
      {[T1, T2, T3, T4].map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
