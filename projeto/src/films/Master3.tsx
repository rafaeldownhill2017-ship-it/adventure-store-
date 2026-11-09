import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, Modelo, precarregar } from "../lib/kenney";
import { MUNDO, StageMundo } from "../lib/StageMundo";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, Selo, useMola } from "../lib/ui";

// CASO MASTER · PARTE 3/3 · "O homem por trás do banco".
// Dados e fontes: docs/dossies/master3.md. Ele é investigado/indiciado, SEM denúncia nem condenação: o vídeo diz isso na tela.
precarregar([
  "comercial/building-c",
  "comercial/building-a",
  "moveis/chairDesk",
  "moveis/table",
  "carros/sedan",
  "personagens/character-male-a",
  "personagens/character-male-b",
  "personagens/character-male-d",
  "personagens/character-male-f",
  "personagens/character-female-d",
  "natureza/tree_oak",
  "natureza/tree_detailed",
]);

const PESSOAS = ["male-a", "female-d", "male-b", "male-d", "male-f"].map((n) => `personagens/character-${n}`);
const VORCARO = "personagens/character-male-f"; // boneco genérico; não é retrato de ninguém

const A: V3 = [0, 0, 0]; // o aeroporto (gancho)
const BX: V3 = [40, 0, 0]; // quem é: do Máxima ao Master
const CX: V3 = [80, 0, 0]; // a prisão e a Justiça
const DX: V3 = [-40, 0, 0]; // quem tinha mais de R$ 250 mil: a fila e o leilão

const DESTAQUE = /^(Dezessete|noite|Guarulhos|jatinho|Dubai|Polícia|decolagem|Vorcaro|Máxima|Master|lucro|bilhão|fuga|nega|solto|Supremo|indiciado|denúncia|condenação|limite|fila|leilão)$/i;

/** Jatinho executivo feito de caixas. */
const Jatinho: React.FC<{ p: V3 }> = ({ p: pos }) => (
  <group position={pos}>
    <B s={[1.25, 0.2, 0.22]} p={[0, 0.3, 0]} cor="#f4f6f8" rough={0.35} />
    <B s={[0.22, 0.16, 0.18]} p={[0.7, 0.29, 0]} cor="#e9edf1" rough={0.35} />
    <B s={[0.18, 0.06, 0.2]} p={[0.62, 0.36, 0]} cor="#2b3a4a" />
    {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
      <B key={i} s={[0.07, 0.05, 0.225]} p={[x + 0.1, 0.33, 0]} cor="#2b3a4a" />
    ))}
    <B s={[0.32, 0.03, 1.15]} p={[0.0, 0.25, 0]} cor="#dfe4ea" rough={0.4} />
    <B s={[0.2, 0.3, 0.03]} p={[-0.58, 0.5, 0]} cor="#dfe4ea" />
    <B s={[0.14, 0.03, 0.42]} p={[-0.6, 0.62, 0]} cor="#dfe4ea" />
    {[-0.2, 0.2].map((z, i) => (
      <B key={i} s={[0.24, 0.1, 0.1]} p={[-0.38, 0.38, z]} cor="#9aa3ad" />
    ))}
    {[
      [0.5, 0],
      [-0.1, 0.2],
      [-0.1, -0.2],
    ].map(([x, z], i) => (
      <B key={i} s={[0.04, 0.2, 0.04]} p={[x, 0.1, z]} cor="#3a3f45" />
    ))}
  </group>
);

/** Pista com faixas. */
const Pista: React.FC = () => (
  <>
    <B s={[4.4, 0.02, 1.1]} p={[0, 0.01, 0.1]} cor="#5d6268" />
    {[-1.6, -0.8, 0, 0.8, 1.6].map((x, i) => (
      <B key={i} s={[0.4, 0.025, 0.05]} p={[x, 0.02, 0.1]} cor="#f4f4f0" />
    ))}
  </>
);

/** Placa do banco que troca de nome (o texto vai no rótulo preso a ela). */
const Letreiro: React.FC<{ p: V3; cor: string }> = ({ p: pos, cor }) => (
  <group position={pos}>
    <B s={[0.9, 0.22, 0.05]} p={[0, 0, 0]} cor={cor} />
    <B s={[0.05, 0.4, 0.05]} p={[-0.38, -0.3, 0]} cor="#4a4f55" />
    <B s={[0.05, 0.4, 0.05]} p={[0.38, -0.3, 0]} cor="#4a4f55" />
  </group>
);

const MARCA_SERIE = { nome: "Caso Master", linha: "Do começo ao fim, com fonte.", cta: "Comente o próximo caso" };

export const Master3: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.parte - 0.4; // aeroporto → quem é
  const T2 = c.ai - 0.4; // quem é → prisão e Justiça
  const T3 = c.quem - 0.4; // Justiça → fila e leilão

  const K: Key[] = [
    [0, [A[0] + 0.3, 2.6, 8.4], [A[0] + 0.3, 0.45, 0], 33],
    [c.policia - 0.5, [A[0] + 0.1, 2.4, 7.6], [A[0] + 0.1, 0.45, 0], 33],
    [T1, [A[0], 2.6, 8.0], [A[0], 0.45, 0], 33],
    [T1, [BX[0], 2.2, 7.6], [BX[0], 0.7, -0.3], 33],
    [c.dezoito - 0.3, [BX[0], 2.3, 7.8], [BX[0], 0.7, -0.3], 33],
    [T2, [BX[0] + 0.3, 2.5, 8.6], [BX[0] + 0.3, 0.7, -0.3], 33],
    [T2, [CX[0], 2.4, 8.2], [CX[0], 0.75, -0.3], 33],
    [T3, [CX[0], 2.5, 8.6], [CX[0], 0.75, -0.3], 33],
    [T3, [DX[0], 3.3, 9.8], [DX[0], 0.35, 0], 33],
    [c.vende - 0.4, [DX[0] + 0.2, 3.3, 9.8], [DX[0] + 0.2, 0.35, 0], 33],
    [FECHO, [DX[0] + 0.4, 3.6, 10.4], [DX[0] + 0.4, 0.35, 0], 33],
  ];
  const cam = camPorKeys(t, K);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  // ---------------- A · o aeroporto (gancho: hora + jatinho + PF)
  const naA = t < T1;
  const anda = p(t, 0.3, c.policia - 0.6, (x) => x);
  const carro = p(t, c.policia - 0.6, 1.2, ease.inOut);
  if (naA) {
    add({ p: [A[0] - 0.9, 1.2, -0.3], s: mola(0.3, 220, 13), tipo: "card", titulo: "17/11/2025", txt: "22h", cor: "#ffffff", tam: 0.8 });
    add({ p: [A[0] + 0.6, 0.95, 0.1], s: mola(c.aeroporto - 0.2, 220, 13), txt: "Aeroporto de Guarulhos", cor: "#ffffff", tam: 0.8 });
    if (t >= c.dubai - 0.2) add({ p: [A[0] + 0.9, 0.2, 0.5], s: mola(c.dubai - 0.2, 240, 12), txt: "destino: Dubai", cor: C.destaque, tam: 0.8 });
    if (t >= c.policia - 0.2) add({ p: [A[0] - 0.8, 0.25, 1.3], s: mola(c.policia - 0.2, 240, 12), txt: "Polícia Federal", cor: "#1f3b7a", tinta: "#fff", tam: 0.82 });
  }

  // ---------------- B · quem é: do Máxima ao Master, lucro de R$ 1 bi
  const naB = t >= T1 - 0.05 && t < T2;
  const virouMaster = t >= c.master - 0.1;
  const pilha = p(t, c.lucro - 0.3, 1.2, ease.out);
  if (naB) {
    add({ p: [BX[0] - 0.55, 1.35, 0.4], s: mola(c.daniel - 0.2, 220, 13), tipo: "card", titulo: "EX-CONTROLADOR", txt: "Daniel Vorcaro", cor: "#ffffff", tam: 0.72 });
    if (t >= c.mineiro - 0.2) add({ p: [BX[0] - 0.6, 0.2, 0.8], s: mola(c.mineiro - 0.2, 240, 12), txt: "Belo Horizonte (MG)", cor: "#ffffff", tam: 0.78 });
    if (t >= c.dezoito - 0.3) add({ p: [BX[0] + 0.55, 1.15, -0.6], s: mola(c.dezoito - 0.3, 260, 12), txt: virouMaster ? "Banco Master" : "Banco Máxima · 2018", cor: virouMaster ? C.destaque : "#ffffff", tam: 0.8 });
    if (t >= c.lucro - 0.2) add({ p: [BX[0] + 0.85, 0.45, 0.5], s: mola(c.lucro - 0.2, 220, 13), tipo: "card", titulo: "LUCRO EM 2024", txt: "R$ 1 bi", cor: C.destaque, tam: 0.78 });
  }

  // ---------------- C · a prisão e a Justiça
  const naC = t >= T2 - 0.05 && t < T3;
  const sai = p(t, c.solto - 0.3, 1.0, ease.inOut);
  const volta = p(t, c.supremo - 0.3, 1.0, ease.inOut);
  const xBoneco = lerp(0, 0.9, sai) - 0.9 * volta;
  if (naC) {
    if (t >= c.fuga - 0.3) add({ p: [CX[0] - 0.75, 1.45, 0.3], s: mola(c.fuga - 0.3, 240, 12), txt: "PF: risco de fuga", cor: "#1f3b7a", tinta: "#fff", tam: 0.78 });
    if (t >= c.defesa - 0.2) add({ p: [CX[0] + 0.7, 1.0, 0.4], s: mola(c.defesa - 0.2, 240, 12), txt: "defesa nega irregularidades", cor: "#ffffff", tam: 0.74 });
    if (t >= c.solto - 0.2 && t < c.marco - 0.2) add({ p: [CX[0] + 0.9, 0.2, 0.8], s: mola(c.solto - 0.2, 240, 12), txt: "solto pelo TRF-1", cor: C.ok, tinta: "#fff", tam: 0.78 });
    if (t >= c.marco - 0.2 && t < c.indiciado - 0.2) add({ p: [CX[0] + 0.2, 0.2, 0.8], s: mola(c.marco - 0.2, 220, 13), tipo: "card", titulo: "MAR/2026 · STF", txt: "nova prisão", cor: C.alerta, tinta: "#fff", tam: 0.7 });
    if (t >= c.indiciado - 0.2) add({ p: [CX[0] - 0.2, 0.15, 0.8], s: mola(c.indiciado - 0.2, 220, 13), tipo: "card", titulo: "POLÍCIA FEDERAL", txt: "indiciado", cor: "#ffffff", tam: 0.7 });
    if (t >= c.denuncia - 0.3) add({ p: [CX[0] + 0.3, 2.05, -1.4], s: mola(c.denuncia - 0.3, 220, 13), txt: "sem denúncia · sem condenação", cor: C.destaque, tam: 0.8 });
  }

  // ---------------- D · quem tinha mais de R$ 250 mil: a fila da liquidação e o leilão
  const naD = t >= T3 - 0.05;
  const fila = Array.from({ length: 12 }, (_, i) => ({ i, x: -1.2 + i * 0.215, z: 0.15 + Math.sin(i * 1.7) * 0.06 }));
  if (naD && t < c.mande - 0.35) {
    add({ p: [DX[0] - 1.2, 0.9, -0.2], s: mola(T3 + 0.2, 220, 13), tipo: "card", titulo: "FGC", txt: "até R$ 250 mil", cor: C.ok, tinta: "#fff", tam: 0.66 });
    if (t >= c.limite - 0.2) add({ p: [DX[0] + 1.15, 0.85, 0.15], s: mola(c.limite - 0.2, 220, 13), tipo: "card", titulo: "ACIMA DO LIMITE", txt: "fim da fila", cor: C.alerta, tinta: "#fff", tam: 0.66 });
    if (t >= c.fila - 0.2) add({ p: [DX[0], 0.15, 1.2], s: mola(c.fila - 0.2, 240, 12), txt: "fila da liquidação · pode levar anos", cor: "#ffffff", tam: 0.74 });
    if (t >= c.cadeiras - 0.3) add({ p: [DX[0] + 0.1, 1.45, -1.3], s: mola(c.cadeiras - 0.3, 220, 13), tipo: "card", titulo: "LEILÃO · 09/11/2026", txt: "445 lotes", cor: C.destaque, tam: 0.72 });
  }

  return (
    <AbsoluteFill style={{ background: MUNDO.ceu }}>
      {t < FECHO + 0.6 ? (
        <StageMundo cam={cam} miniatura={0.3} luz={naA ? 1.6 : 2.7} ceu={naA ? "#8fb6d6" : MUNDO.ceu}>
          {naA ? (
            <group position={A}>
              <Pista />
              <Jatinho p={[0.55, 0, -0.05]} />
              <Ator url={VORCARO} p={[lerp(-0.75, -0.15, anda), 0, 0.15]} rotY={lerp(Math.PI / 2, Math.PI * 0.85, p(t, c.policia, 0.4))} altura={0.5} t={t} acoes={[{ de: 0, anim: "walk" }, { de: c.policia - 0.6, anim: "idle" }]} />
              {carro > 0.001 ? <Modelo url="carros/sedan" p={[lerp(-3.3, -0.85, carro), 0, 0.85]} rotY={Math.PI / 2} alvo={{ comp: 0.8 }} tinta="#5b7fd6" /> : null}
              <Modelo url="natureza/tree_oak" p={[-0.85, 0, -2.2]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}

          {naB ? (
            <group position={BX}>
              <Modelo url="comercial/building-a" p={[0.25, 0, -1.7]} alvo={{ largura: 1.1 }} />
              <Letreiro p={[0.3, 0.62, -0.6]} cor={virouMaster ? C.destaque : "#c9c6bb"} />
              <B s={[0.5, 0.12, 0.5]} p={[-0.55, 0.06, 0.2]} cor="#e8e2d0" />
              <Ator url={VORCARO} p={[-0.55, 0.12, 0.2]} rotY={0.25} altura={0.56} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.maxima, anim: "interact-right" }, { de: c.master - 0.1, anim: "emote-yes" }, { de: c.lucro + 0.6, anim: "jump" }]} />
              {pilha > 0.01
                ? Array.from({ length: Math.round(pilha * 8) }, (_, j) => (
                    <group key={j} position={[0.85 + (j % 2) * 0.17, 0.03 + Math.floor(j / 2) * 0.06, 0.3]}>
                      <B s={[0.16, 0.05, 0.1]} cor={j % 2 ? "#3f9a5b" : "#4fae69"} />
                      <B s={[0.035, 0.055, 0.105]} cor="#e9e2b8" />
                    </group>
                  ))
                : null}
              <Modelo url="natureza/tree_detailed" p={[-1.2, 0, -1.8]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}

          {naC ? (
            <group position={CX}>
              <Modelo url="comercial/building-c" p={[0, 0, -1.6]} alvo={{ largura: 1.5 }} />
              <Ator url={VORCARO} p={[xBoneco, 0, 0.1]} rotY={sai > 0.02 && sai < 0.98 ? Math.PI / 2 : volta > 0.02 && volta < 0.98 ? -Math.PI / 2 : 0} altura={0.56} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.solto - 0.3, anim: "walk" }, { de: c.solto + 0.7, anim: "idle" }, { de: c.supremo - 0.3, anim: "walk" }, { de: c.supremo + 0.7, anim: "idle" }]} />
              <Modelo url="natureza/tree_oak" p={[1.15, 0, -1.9]} alvo={{ altura: 1.0 }} />
            </group>
          ) : null}

          {naD ? (
            <group position={DX}>
              <B s={[0.06, 0.5, 0.06]} p={[-1.42, 0.25, 0.15]} cor={C.ok} />
              {fila.map(({ i, x, z }) => (
                <Ator key={i} url={PESSOAS[i % PESSOAS.length]} p={[x, 0, z]} rotY={-Math.PI / 2} altura={0.46} t={t} fase={i * 0.3} entra={i >= 9 ? c.limite - 0.3 + (i - 9) * 0.15 : undefined} acoes={[{ de: -1, anim: "idle" }, ...(i >= 9 ? [{ de: c.limite + 0.4, anim: "emote-no", vezes: 2 }] : [{ de: c.quem + 0.3 + (i % 3) * 0.2, anim: i % 2 ? "emote-yes" : "interact-right" }]), { de: c.cadeiras + (i % 4) * 0.15, anim: "jump" }]} />
              ))}
              {t >= c.limite - 0.3
                ? [9, 10, 11].map((i) => <B key={i} s={[0.18, 0.02, 0.18]} p={[-1.2 + i * 0.215, 0.012, 0.15]} cor={C.alerta} />)
                : null}
              {t >= c.vende - 0.4 ? (
                <group position={[0.1, 0, -1.3]} scale={Math.min(1, mola(c.vende - 0.4, 200, 13))}>
                  <Modelo url="moveis/table" alvo={{ comp: 0.8 }} />
                  {[-0.5, 0.5].map((x, i) => (
                    <Modelo key={i} url="moveis/chairDesk" p={[x, 0, 0.2]} rotY={Math.PI} alvo={{ altura: 0.42 }} />
                  ))}
                </group>
              ) : null}
            </group>
          ) : null}
        </StageMundo>
      ) : null}

      <TelaSegura itens={rot} cam={cam} />
      <PalavraGrande ate={c.mande - 0.35} destaque={DESTAQUE} />

      {t >= c.mande - 0.35 && t < FECHO ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 300, textAlign: "center", transform: `scale(${mola(c.mande - 0.35, 200, 13)})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 74, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#ffffff", WebkitTextStroke: "9px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
            Mande para quem investe sem saber quem é o <span style={{ color: C.destaque }}>dono do banco</span>
          </div>
          {t >= c.comenta - 0.2 ? (
            <div style={{ marginTop: 40, opacity: p(t, c.comenta - 0.2, 0.3), fontFamily: FONT, fontWeight: 800, fontSize: 52, lineHeight: 1.15, color: "#ffffff", WebkitTextStroke: "7px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
              Qual caso você quer na <span style={{ color: C.destaque, whiteSpace: "nowrap" }}>próxima série?</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {t < FECHO ? <Selo txt="CASO MASTER · PARTE 3/3" /> : null}
      {t >= 0.3 && t < FECHO ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 600, color: "rgba(20,30,25,0.66)" }}>
          Fontes: imprensa e STF · investigado, sem denúncia nem condenação · 09/11/2026
        </div>
      ) : null}

      {[T1, T2, T3].map((x, i) => (
        <Flash key={i} at={x} max={0.35} />
      ))}
      <Flash at={c.policia - 0.05} max={0.3} cor="#5b7fd6" dur={0.35} />
      <Fecho at={FECHO} marca={MARCA_SERIE} />
      <Grain />
    </AbsoluteFill>
  );
};
