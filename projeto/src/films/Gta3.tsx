import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, precarregar } from "../lib/kenney";
import {
  BLOCO,
  CaixaJogo,
  Calendario,
  CardNumero,
  Cofre,
  ConsoleAntigo,
  ConsoleNovo,
  Controle,
  corBloco,
  NotasVoando,
  PalcoCor,
  Pedestal,
  Placa,
  Relogio,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · gta3 · "Quanto custa jogar GTA 6 no Brasil" (753 h de salário mínimo; o juro que pagaria o jogo).
// Dados: docs/dossies/gta3.md. Formato inspirado na estrutura do Reel do GTA 6 do @ludificando.br (só a estrutura).
// Consoles, controle e caixa são peças genéricas em código, sem marca. Termina na pergunta (loop, sem cartão branco).
precarregar(["personagens/character-male-a"]);

const A: V3 = [0, 0, 0]; // gancho: 753 horas
const G: V3 = [20, 0, 0]; // jogo × consoles
const S: V3 = [40, 0, 0]; // a soma em salários
const T_: V3 = [60, 0, 0]; // o juro no Tesouro
const JOGADOR = "personagens/character-male-a";
const DESTAQUE = /GTA|setecentas|horas|porra|console|quatrocentos|PS4|PS5|Xbox|cinco|quinhentos|três|noventa|semana|Tesouro|seiscentos|juro|troco|custa|Black|parcelado/i;

/** Pilha de notas de 1 salário mínimo (bloco verde com cinta), `k` 0..1 cresce. */
const Salario: React.FC<{ p: V3; k: number; alt?: number }> = ({ p: pos, k, alt = 0.5 }) => {
  if (k <= 0.01) return null;
  const h = alt * k;
  return (
    <group position={pos}>
      <B s={[0.42, h, 0.24]} p={[0, h / 2, 0]} cor="#5fae5a" />
      <B s={[0.43, Math.min(h, 0.06), 0.25]} p={[0, h * 0.55, 0]} cor="#f2efe8" />
    </group>
  );
};

export const Gta3: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.jogo - 0.4; // "O jogo custa..."
  const T2 = c.somando - 0.2; // "Somando tudo"
  const T3 = c.conta - 0.9; // "E tem uma conta..."
  const T4 = c.deixar - 0.6; // "Não é pra deixar..."

  const K: Key[] = [
    [0, [A[0] + 0.2, 2.2, 7.0], [A[0], 0.9, 0], 34],
    [T1, [A[0], 2.1, 6.5], [A[0], 0.9, 0], 34],
    [T1, [G[0] - 1.7, 1.9, 6.0], [G[0] - 1.7, 0.6, 0], 34],
    [c.ps4 - 0.3, [G[0] - 1.7, 1.9, 6.0], [G[0] - 1.7, 0.6, 0], 34],
    [c.ps4 + 0.2, [G[0], 4.0, 14.2], [G[0], 0.55, 0], 34],
    [c.disco - 0.3, [G[0], 4.0, 14.2], [G[0], 0.55, 0], 34],
    [c.disco + 0.2, [G[0] + 1.7, 1.9, 6.0], [G[0] + 1.7, 0.7, 0], 34],
    [T2, [G[0] + 1.7, 1.9, 6.0], [G[0] + 1.7, 0.7, 0], 34],
    [T2, [S[0], 2.6, 8.8], [S[0], 0.5, 0], 34],
    [T3, [S[0], 2.7, 9.2], [S[0], 0.5, 0], 34],
    [T3, [T_[0], 2.4, 8.2], [T_[0], 0.8, 0], 34],
    [T4, [T_[0], 2.5, 8.6], [T_[0], 0.8, 0], 34],
    [T4, [A[0] + 0.2, 2.2, 7.0], [A[0], 0.9, 0], 34],
    [c.comenta - 0.2, [A[0], 2.6, 8.6], [A[0], 0.9, 0], 34],
    [c.fim + 2, [A[0], 2.6, 8.6], [A[0], 0.9, 0], 34],
  ];
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.roxo], [T1, BLOCO.verde], [c.ps4 - 0.1, BLOCO.marinho], [c.disco - 0.1, BLOCO.vermelho], [T2, BLOCO.terra], [T3, BLOCO.marinho], [T4, BLOCO.roxo]], 0.25);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  const naA = t < T1 || t >= T4 - 0.05;
  const naG = t >= T1 - 0.05 && t < T2;
  const naS = t >= T2 - 0.05 && t < T3;
  const naT = t >= T3 - 0.05 && t < T4;
  const votacao = t >= c.comenta - 0.2;

  // gancho
  if (t < T1 && t >= c.console - 0.2) add({ p: [A[0] + 0.85, 1.3, 0.2], s: mola(c.console - 0.2, 260, 11), txt: "o console", cor: C.alerta, tinta: "#fff", tam: 0.9 });
  // somatório
  if (naS && t >= c.tres - 0.2) [0, 1, 2, 3].forEach((i) => add({ p: [S[0] - 1.05 + i * 0.6, i < 3 ? 1.0 : 0.72, 0], s: mola(c.tres - 0.2 + i * 0.12, 240, 12), txt: i < 3 ? "1 salário" : "½", cor: "#ffffff", tam: 0.62 }));
  if (naS && t >= c.semana - 0.3) add({ p: [S[0] + 0.9, 1.0, 1.4], s: mola(c.semana - 0.3, 240, 12), txt: "só o jogo: ~61 h", cor: C.destaque, tam: 0.8 });
  // tesouro
  if (naT && t >= c.troco - 0.3) add({ p: [T_[0] + 0.9, 0.35, 0.8], s: mola(c.troco - 0.3, 240, 12), txt: "sobra ~R$ 175", cor: C.destaque, tam: 0.82 });

  const salK = (i: number) => p(t, c.tres - 0.1 + i * 0.25, 0.5);

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor}>
        {naA ? (
          <group position={A}>
            <Pedestal raio={0.95} aro={votacao ? "#ffc94a" : "#b58cff"} />
            <Ator url={JOGADOR} p={[-0.2, TOPO_PEDESTAL, 0.15]} rotY={0.25} altura={0.9} t={t} acoes={[{ de: 0, anim: "holding-both" }, { de: c.porra - 0.1, anim: "emote-no" }, { de: c.comenta, anim: "interact-right" }]} />
            <Controle p={[-0.13, TOPO_PEDESTAL + 0.42, 0.42]} rot={[-0.6, 0.25, 0]} s={0.6} />
            <ConsoleNovo p={[0.55, TOPO_PEDESTAL, -0.15]} s={0.75 * mola(c.console - 0.25, 220, 10)} liga={p(t, c.console, 0.4)} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Relogio key={i} p={[[-0.75, -0.45, -0.8, 0.8, 0.5][i], [1.25, 1.7, 2.05, 1.35, 1.95][i], -0.7]} s={0.7 * mola(0.1 + i * 0.12, 220, 12)} t={t} vel={8 + i} />
            ))}
            {votacao ? (
              <>
                <Placa p={[-0.95, 1.55, 0.3]} txt="COMPREI" cor="#2fbf71" k={p(t, c.comenta, 0.6, (x) => x)} larg={0.6} />
                <Placa p={[0, 1.85, 0.3]} txt="BLACK FRIDAY" cor="#1d1d1d" k={p(t, c.comenta + 0.25, 0.6, (x) => x)} larg={0.8} />
                <Placa p={[0.95, 1.55, 0.3]} txt="PARCELADO" cor="#d6453a" k={p(t, c.comenta + 0.5, 0.6, (x) => x)} larg={0.66} />
              </>
            ) : null}
          </group>
        ) : null}

        {naG ? (
          <group position={G}>
            <Pedestal p={[-1.7, 0, 0]} raio={0.55} aro="#7dffb0" />
            <CaixaJogo p={[-1.7, TOPO_PEDESTAL, 0]} s={0.9 * mola(T1 + 0.05, 220, 12)} />
            <Placa p={[-1.7, 1.25, 0.1]} txt="R$ 449,90" cor="#2fbf71" k={p(t, c.jogo + 0.3, 0.6, (x) => x)} larg={0.62} />
            <Pedestal p={[0, 0, 0]} raio={0.55} aro="#ff6a5a" acende={t >= c.ps4 - 0.2 ? 1 : 0.2} />
            <ConsoleAntigo p={[0, TOPO_PEDESTAL, 0]} s={0.7 * mola(c.ps4 - 0.3, 220, 12)} />
            {t >= c.ps4 ? <B s={[0.55, 0.06, 0.06]} p={[0, TOPO_PEDESTAL + 0.35, 0.1]} r={[0, 0, 0.78 * mola(c.ps4, 260, 10)]} cor="#e23b2e" /> : null}
            {t >= c.ps4 ? <B s={[0.55, 0.06, 0.06]} p={[0, TOPO_PEDESTAL + 0.35, 0.1]} r={[0, 0, -0.78 * mola(c.ps4, 260, 10)]} cor="#e23b2e" /> : null}
            <Placa p={[0, 1.05, 0.1]} txt="NÃO RODA" cor="#d6453a" k={p(t, c.ps4 + 0.1, 0.6, (x) => x)} larg={0.6} />
            <Pedestal p={[1.7, 0, 0]} raio={0.55} aro="#5aa9ff" acende={t >= c.ps5 - 0.2 ? 1 : 0.2} />
            <ConsoleNovo p={[1.7, TOPO_PEDESTAL, 0]} s={0.7 * mola(c.ps5 - 0.3, 220, 12)} liga={p(t, c.ps5, 0.4)} />
            <Placa p={[1.7, 1.35, 0.1]} txt={t >= c.disco - 0.2 ? "R$ 5.099,90" : "SÓ NO NOVO"} cor={t >= c.disco - 0.2 ? "#d6453a" : "#2fbf71"} k={p(t, c.ps5 + 0.1, 0.6, (x) => x)} larg={0.66} />
          </group>
        ) : null}

        {naS ? (
          <group position={S}>
            <Pedestal raio={1.25} aro="#ffc94a" />
            {[0, 1, 2].map((i) => (
              <Salario key={i} p={[-1.05 + i * 0.6, TOPO_PEDESTAL, 0]} k={salK(i)} />
            ))}
            <Salario p={[0.75, TOPO_PEDESTAL, 0]} k={salK(3)} alt={0.22} />
            <Calendario p={[-0.85, 0, 1.45]} rotY={0.3} s={0.6 * mola(c.noventa - 0.3, 220, 12)} mes="TRABALHO" dia="94" ano="DIAS" />
            <CaixaJogo p={[0.75, 0, 1.45]} rotY={-0.3} s={0.7 * mola(c.sozinho - 0.2, 220, 12)} />
            <Relogio p={[1.15, 0.45, 1.4]} rotY={-0.3} s={0.6 * mola(c.sozinho, 220, 12)} t={t} vel={10} />
          </group>
        ) : null}

        {naT ? (
          <group position={T_}>
            <Pedestal raio={0.9} aro="#ffc94a" />
            <Cofre p={[0, TOPO_PEDESTAL, 0]} abre={p(t, c.tesouro, 0.8)} />
            <NotasVoando de={[0, TOPO_PEDESTAL + 0.5, 0.4]} k={p(t, c.seiscentos - 0.2, 2.0, (x) => x)} n={14} alcance={1.4} />
            {t >= c.juro + 0.2 ? <CaixaJogo p={[lerp(0, 0.75, p(t, c.juro + 0.2, 0.8)), TOPO_PEDESTAL + lerp(0.2, 0, p(t, c.juro + 0.2, 0.8)), 0.6]} rotY={-0.3} s={0.75 * mola(c.juro + 0.2, 200, 12)} /> : null}
          </group>
        ) : null}
      </PalcoCor>

      <TelaSegura itens={rot} cam={cam} />

      {/* topo: um número grande por vez */}
      <CardNumero t={t} de={-0.6} ate={c.motivo - 0.3} titulo="PRA JOGAR GTA 6 · SALÁRIO MÍNIMO" valor="753 horas" />
      <CardNumero t={t} de={c.motivo - 0.1} ate={T1 - 0.2} titulo="O MOTIVO?" valor="o console" cor={C.alerta} tinta="#ffffff" />
      <CardNumero t={t} de={c.jogo} ate={c.ps4 - 0.3} titulo="GTA 6 · EDIÇÃO PADRÃO" valor="R$ 449,90" />
      <CardNumero t={t} de={c.ps4 - 0.1} ate={c.disco - 0.3} titulo="NO CONSOLE ANTIGO" valor="não roda" cor={C.alerta} tinta="#ffffff" />
      <CardNumero t={t} de={c.disco - 0.1} ate={T2 - 0.2} titulo="CONSOLE NOVO COM DISCO · DESDE ABR/2026" valor="R$ 5.099,90" />
      <CardNumero t={t} de={T2 + 0.1} ate={c.tres - 0.3} titulo="JOGO + CONSOLE" valor="R$ 5.549,80" cor={C.destaque} />
      <CardNumero t={t} de={c.tres - 0.1} ate={c.noventa - 0.3} titulo="SALÁRIO MÍNIMO: R$ 1.621" valor="3,4 salários" />
      <CardNumero t={t} de={c.noventa - 0.1} ate={T3 - 0.2} titulo="DIAS DE 8 HORAS" valor="≈ 94 dias" />
      <CardNumero t={t} de={c.tesouro} ate={c.juro - 0.3} titulo="R$ 5.549,80 NO TESOURO SELIC · 12 MESES" valor="≈ + R$ 625" cor={C.destaque} />
      <CardNumero t={t} de={c.juro - 0.1} ate={T4 - 0.2} titulo="SE AS TAXAS FICAREM" valor="o juro paga 1 GTA" />
      <CardNumero t={t} de={T4 + 0.1} ate={c.comenta - 0.3} titulo="NÃO É PRA DEIXAR DE JOGAR" valor="é pra saber quanto custa" />
      <CardNumero t={t} de={c.comenta - 0.1} ate={99} titulo="COMENTA" valor="COMPREI · BLACK FRIDAY · PARCELADO" />

      <PalavraGrande destaque={DESTAQUE} />
      {[T1, T2, T3, T4].map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
