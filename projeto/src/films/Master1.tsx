import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, Modelo, precarregar } from "../lib/kenney";
import { MUNDO, StageMundo } from "../lib/StageMundo";
import { TelaSegura, type Rotulo } from "../lib/telaSegura";
import { ease, hash, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Fecho, Flash, Grain, PalavraGrande, Selo, mat, useMola } from "../lib/ui";

// CASO MASTER · PARTE 1/3 · "Como um banco chegou a 800 mil credores".
// Dados e fontes: docs/dossies/master1.md. Nada aqui afirma culpa: só fatos públicos com data.
precarregar([
  "comercial/building-c",
  "comercial/building-h",
  "comercial/building-a",
  "comercial/building-e",
  "comercial/building-k",
  "comercial/detail-awning-wide",
  "moveis/table",
  "moveis/laptop",
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

const A: V3 = [0, 0, 0]; // a agência com a placa (gancho) e a fila
const BX: V3 = [40, 0, 0]; // a vitrine e o selo do FGC
const CX: V3 = [80, 0, 0]; // corretoras e multidão
const DX: V3 = [-40, 0, 0]; // o Banco Central fecha a porta
const EX: V3 = [0, 0, -40]; // quem paga: a pilha do FGC e os outros bancos

const DESTAQUE = /^(placa|CDI|fila|Master|vitrine|selo|FGC|corretoras|multidão|oitocentos|novembro|fecha|Liquidação|Polícia|paga|quarenta|bilhões|resgate|bancos|segurou|conta|sistema)$/i;

/** Placa de rua em pé (o texto fica no rótulo preso a ela). */
const Placa: React.FC<{ p: V3; s: number }> = ({ p: pos, s }) => (
  <group position={pos} scale={[1, Math.max(0.001, s), 1]}>
    <B s={[0.05, 0.75, 0.05]} p={[-0.28, 0.375, 0]} cor="#4a4f55" />
    <B s={[0.05, 0.75, 0.05]} p={[0.28, 0.375, 0]} cor="#4a4f55" />
    <B s={[0.8, 0.42, 0.05]} p={[0, 0.88, 0]} cor={C.destaque} />
    <B s={[0.7, 0.32, 0.052]} p={[0, 0.88, 0.002]} cor="#fff6cf" />
  </group>
);

/** Selo dourado (losango) que "acalma" quem passa. */
const SeloFGC: React.FC<{ p: V3; s: number; t: number }> = ({ p: pos, s, t }) => (
  <group position={pos} scale={Math.max(0.001, s)} rotation={[0, Math.sin(t * 1.4) * 0.12, 0]}>
    <B s={[0.5, 0.5, 0.08]} r={[0, 0, Math.PI / 4]} cor="#d9a520" rough={0.35} />
    <B s={[0.38, 0.38, 0.1]} r={[0, 0, Math.PI / 4]} cor="#f3c94a" rough={0.3} />
    <B s={[0.05, 0.42, 0.05]} p={[0, -0.55, -0.02]} cor="#6b6f75" />
  </group>
);

/** Fita de interdição listrada, em X, na frente da porta. */
const Fita: React.FC<{ p: V3; k: number }> = ({ p: pos, k }) => {
  if (k <= 0.001) return null;
  const y = lerp(1.6, 0, ease.out(k));
  return (
    <group position={[pos[0], pos[1] + y, pos[2]]}>
      {[0.32, -0.32].map((rz, j) => (
        <group key={j} position={[0, 0.4, 0.02 * j]} rotation={[0, 0, rz]}>
          {Array.from({ length: 8 }, (_, i) => (
            <B key={i} s={[0.15, 0.07, 0.02]} p={[-0.525 + i * 0.15, 0, 0]} cor={i % 2 ? "#ffffff" : C.alerta} />
          ))}
        </group>
      ))}
    </group>
  );
};

/** Pilha de dinheiro: colunas de maços verdes que sobem com k (0..1). */
const Pilha: React.FC<{ k: number }> = ({ k }) => {
  const cols: React.ReactNode[] = [];
  let n = 0;
  for (let ix = -1; ix <= 1; ix++)
    for (let iz = -1; iz <= 1; iz++) {
      const alturaMax = 6 + Math.round(hash(n++) * 4);
      const h = Math.floor(alturaMax * Math.min(1, Math.max(0, k * 1.15 - hash(n) * 0.15)));
      for (let j = 0; j < h; j++)
        cols.push(
          <group key={`${ix}-${iz}-${j}`} position={[ix * 0.34, 0.045 + j * 0.09, iz * 0.22]}>
            <B s={[0.32, 0.08, 0.2]} cor={j % 2 ? "#3f9a5b" : "#4fae69"} />
            <B s={[0.07, 0.085, 0.205]} cor="#e9e2b8" />
          </group>,
        );
    }
  return <>{cols}</>;
};

/** Moeda (cilindro baixo) com material em cache. */
const Moeda: React.FC<{ p: V3 }> = ({ p: pos }) => (
  <mesh position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow material={mat("#f0c23b", 0.35)}>
    <cylinderGeometry args={[0.07, 0.07, 0.025, 14]} />
  </mesh>
);

const MARCA_SERIE = { nome: "Caso Master", linha: "Do começo ao fim, com fonte.", cta: "Siga para ver a Parte 2" };

export const Master1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const FECHO = c.fim + 1.0;
  const T1 = c.vitrine - 0.45; // agência → vitrine
  const T2 = c.corretoras - 0.45; // vitrine → multidão
  const T3 = c.ate - 0.35; // multidão → Banco Central
  const T4 = c.agora - 0.4; // Banco Central → quem paga

  const K: Key[] = [
    [0, [A[0] + 0.2, 2.3, 8.4], [A[0] + 0.3, 0.75, 0], 33],
    [c.fila, [A[0] + 0.2, 2.3, 8.4], [A[0] + 0.3, 0.75, 0], 33],
    [T1, [A[0] + 0.7, 3.0, 10.6], [A[0] + 0.6, 0.6, 0.3], 33],
    [T1, [BX[0], 2.3, 8.2], [BX[0], 0.8, -0.3], 33],
    [T2, [BX[0], 2.4, 7.6], [BX[0], 0.8, -0.3], 33],
    [T2, [CX[0], 3.0, 8.2], [CX[0], 0.5, -0.2], 33],
    [c.multidao - 0.2, [CX[0], 3.0, 8.2], [CX[0], 0.5, -0.2], 33],
    [T3, [CX[0], 5.6, 13.2], [CX[0], 0.35, 0], 33],
    [T3, [DX[0], 2.4, 8.8], [DX[0], 0.75, -0.3], 33],
    [c.policia - 0.7, [DX[0] - 0.2, 2.5, 8.6], [DX[0] - 0.2, 0.75, -0.2], 33],
    [T4, [DX[0] - 0.5, 2.9, 9.8], [DX[0] - 0.5, 0.6, 0], 33],
    [T4, [EX[0], 2.6, EX[2] + 7.4], [EX[0], 0.35, EX[2]], 33],
    [c.onde - 0.2, [EX[0], 2.7, EX[2] + 7.8], [EX[0], 0.45, EX[2]], 33],
    [c.contribuicoes + 0.6, [EX[0], 5.4, EX[2] + 13.0], [EX[0], 0.8, EX[2] - 1.5], 33],
    [FECHO, [EX[0], 5.7, EX[2] + 13.4], [EX[0], 0.8, EX[2] - 1.5], 33],
  ];
  const cam = camPorKeys(t, K);
  const rot: Rotulo[] = [];
  const add = (r: Rotulo) => rot.push(r);

  // ---------------- estação A · a placa e a fila (gancho: objeto + ação + número)
  const naA = t < T1;
  if (naA) {
    add({ p: [A[0] + 0.95, 1.25, 0.6], s: mola(0.35, 220, 13), tipo: "card", titulo: "CDB RENDENDO", txt: "até 140% do CDI", cor: C.destaque, tam: 0.78 });
    if (t >= c.master - 0.2) add({ p: [A[0] - 0.2, 1.95, -1.6], s: mola(c.master - 0.2, 220, 13), txt: "Banco Master", cor: "#ffffff", tam: 0.95 });
    if (t >= c.descobrir - 0.2 && t < c.master - 0.2) add({ p: [A[0] - 0.2, 1.95, -1.6], s: mola(c.descobrir - 0.2, 220, 12), tipo: "card", titulo: "NO FINAL", txt: "quem pagou a conta?", cor: C.alerta, tinta: "#fff", tam: 0.72 });
  }

  // ---------------- estação B · a vitrine e o selo do FGC
  const naB = t >= T1 - 0.05 && t < T2;
  if (naB) {
    add({ p: [BX[0] - 0.2, 1.9, -1.4], s: mola(T1 + 0.15, 220, 13), txt: "a vitrine", cor: "#ffffff", tam: 0.9 });
    if (t >= c.vitrine + 0.4) add({ p: [BX[0] - 0.7, 0.75, 0.4], s: mola(c.vitrine + 0.4, 240, 12), txt: "acima do mercado", cor: C.destaque, tam: 0.85 });
    if (t >= c.fgc - 0.2) add({ p: [BX[0] + 0.75, 1.55, 0.5], s: mola(c.fgc - 0.2, 220, 13), tipo: "card", titulo: "GARANTIDO PELO", txt: "FGC", cor: "#f3c94a", tam: 0.8 });
    if (t >= c.duzentos - 0.2) add({ p: [BX[0] + 0.5, 0.25, 1.3], s: mola(c.duzentos - 0.2, 220, 13), tipo: "card", titulo: "LIMITE POR CPF/CNPJ", txt: "R$ 250 mil", cor: "#ffffff", tam: 0.72 });
  }

  // ---------------- estação C · corretoras e a multidão
  const naC = t >= T2 - 0.05 && t < T3;
  const multidao = Array.from({ length: 20 }, (_, i) => {
    const col = i % 5;
    const lin = Math.floor(i / 5);
    const t0 = i < 4 ? T2 - 0.2 : c.corretoras + 0.6 + (i - 4) * 0.17;
    return { i, x: -1.25 + col * 0.62 + (hash(i) - 0.5) * 0.18, z: -0.55 + lin * 0.55 + (hash(i + 9) - 0.5) * 0.15, t0 };
  });
  if (naC) {
    add({ p: [CX[0], 1.25, -1.7], s: mola(c.corretoras - 0.1, 220, 13), txt: "corretoras", cor: "#ffffff", tam: 0.9 });
    if (t >= c.multidao - 0.1) add({ p: [CX[0] - 0.9, 0.8, 0.5], s: mola(c.multidao - 0.1, 240, 12), txt: "a fila virou multidão", cor: C.destaque, tam: 0.8 });
    if (t >= c.oitocentos - 0.2) add({ p: [CX[0] + 0.3, 1.7, 0], s: mola(c.oitocentos - 0.2, 200, 13), tipo: "card", titulo: "CREDORES (FGC)", txt: "≈ 800 mil", cor: "#ffffff", tam: 0.9 });
    if (t >= c.conhece - 0.2) add({ p: [CX[0], 0.1, 1.4], s: mola(c.conhece - 0.2, 220, 12), tipo: "card", titulo: "COMENTA", txt: "você conhece alguém?", cor: C.destaque, tam: 0.66 });
  }

  // ---------------- estação D · o Banco Central fecha a porta
  const naD = t >= T3 - 0.05 && t < T4;
  const fita = p(t, c.fecha - 0.15, 0.55);
  const carro = p(t, c.policia - 0.7, 1.3, ease.inOut);
  if (naD) {
    add({ p: [DX[0], 2.0, -1.6], s: mola(T3 + 0.15, 220, 13), txt: "Banco Master", cor: "#ffffff", tam: 0.9 });
    if (t >= c.novembro - 0.4) add({ p: [DX[0] - 0.75, 1.3, 0.4], s: mola(c.novembro - 0.4, 220, 13), tipo: "card", titulo: "BANCO CENTRAL", txt: "18/11/2025", cor: "#ffffff", tam: 0.78 });
    if (t >= c.liquidacao - 0.15) add({ p: [DX[0] + 0.3, 0.55, 0.6], s: mola(c.liquidacao - 0.15, 220, 13), txt: "liquidação extrajudicial", cor: C.alerta, tinta: "#fff", tam: 0.8 });
    if (t >= c.policia - 0.1) add({ p: [DX[0] - 0.9, 0.55, 1.4], s: mola(c.policia - 0.1, 240, 12), txt: "Polícia Federal · mesmo dia", cor: "#1f3b7a", tinta: "#fff", tam: 0.78 });
  }

  // ---------------- estação E · quem paga
  const naE = t >= T4 - 0.05;
  const pilha = 0.4 + 0.6 * p(t, c.paga - 0.2, c.resgate - c.paga + 0.6, ease.inOut);
  const fluxo = t >= c.onde ? (t - c.onde) : -1;
  if (naE && t < c.mande - 0.35) {
    if (t < c.ouSeja) add({ p: [EX[0], 1.25, EX[2] - 0.2], s: mola(T4 + 0.2, 220, 13), txt: "FGC", cor: "#f3c94a", tam: 1.0 });
    if (t >= c.quarenta - 0.2 && t < c.ouSeja) add({ p: [EX[0] + 0.85, 0.85, EX[2] + 0.4], s: mola(c.quarenta - 0.2, 200, 13), tipo: "card", titulo: "ESTIMATIVA DO FGC", txt: "≈ R$ 40,6 bi", cor: "#ffffff", tam: 0.82 });
    if (t >= c.resgate - 0.2 && t < c.onde) add({ p: [EX[0] - 0.7, 0.35, EX[2] + 0.9], s: mola(c.resgate - 0.2, 240, 12), txt: "maior resgate do fundo", cor: C.destaque, tam: 0.8 });
    if (t >= c.contribuicoes - 0.2 && t < c.ouSeja) add({ p: [EX[0], 1.25, EX[2] - 3.0], s: mola(c.contribuicoes - 0.2, 220, 13), txt: "contribuições dos bancos", cor: "#ffffff", tam: 0.85 });
    if (t >= c.segurou - 0.2) add({ p: [EX[0], 1.6, EX[2] - 0.5], s: mola(c.segurou - 0.2, 200, 13), tipo: "card", titulo: "O SELO", txt: "segurou a fila", cor: "#f3c94a", tam: 0.8 });
    if (t >= c.conta - 0.2) add({ p: [EX[0], 0.2, EX[2] + 1.2], s: mola(c.conta - 0.2, 200, 13), tipo: "card", titulo: "A CONTA", txt: "foi para o sistema", cor: C.alerta, tinta: "#fff", tam: 0.78 });
  }

  const bancosE: V3[] = [
    [-1.8, 0, -3],
    [-0.6, 0, -3.3],
    [0.6, 0, -3.3],
    [1.8, 0, -3],
  ];

  return (
    <AbsoluteFill style={{ background: MUNDO.ceu }}>
      {t < FECHO + 0.6 ? (
        <StageMundo cam={cam} miniatura={0.3}>
          {naA ? (
            <group position={A}>
              <Modelo url="comercial/building-c" p={[-0.2, 0, -1.6]} alvo={{ largura: 1.5 }} />
              <Placa p={[0.95, 0, 0.55]} s={p(t, 0.05, 0.4, ease.back)} />
              {Array.from({ length: 7 }, (_, i) => {
                const chega = i === 0 ? -1 : c.fila - 0.6 + (i - 1) * 0.35;
                const k = p(t, chega, 0.55, ease.out);
                const alvo: V3 = [-0.15 + i * 0.24, 0, -0.55 + i * 0.36];
                return (
                  <Ator
                    key={i}
                    url={PESSOAS[i % PESSOAS.length]}
                    p={[alvo[0] + (1 - k) * 0.7, 0, alvo[2] + (1 - k) * 0.6]}
                    rotY={i === 0 ? lerp(Math.PI + 0.55, Math.PI * 2 + 0.25, p(t, c.cdi, 0.35) - p(t, c.descobrir + 0.6, 0.4)) : Math.PI + 0.55}
                    altura={0.56}
                    t={t}
                    entra={i === 0 ? undefined : chega}
                    fase={i * 0.37}
                    acoes={
                      i === 0
                        ? [{ de: 0, anim: "idle" }, { de: c.placa - 0.1, anim: "emote-yes" }, { de: c.cdi + 0.3, anim: "jump" }, { de: c.descobrir, anim: "interact-right" }]
                        : [{ de: chega, anim: "sprint" }, { de: chega + 0.5, anim: "idle" }, { de: chega + 0.7 + hash(i) * 0.6, anim: i % 2 ? "emote-yes" : "jump" }]
                    }
                  />
                );
              })}
              <Modelo url="natureza/tree_oak" p={[-1.7, 0, -1.0]} alvo={{ altura: 1.2 }} />
              <Modelo url="natureza/tree_detailed" p={[1.45, 0, -2.0]} alvo={{ altura: 1.1 }} />
            </group>
          ) : null}

          {naB ? (
            <group position={BX}>
              <Modelo url="comercial/building-h" p={[-0.2, 0, -1.5]} alvo={{ largura: 1.6 }} />
              <SeloFGC p={[0.75, 0.75, 0.3]} s={mola(c.selo - 0.3, 200, 12)} t={t} />
              <Ator url={PESSOAS[1]} p={[-0.45, 0, 0.5]} rotY={Math.PI * 0.85} altura={0.56} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.vitrine, anim: "interact-right" }, { de: c.fgc - 0.1, anim: "jump" }, { de: c.duzentos + 1.2, anim: "emote-yes", vezes: 2 }]} />
              <Ator url={PESSOAS[3]} p={[0.05, 0, 0.75]} rotY={Math.PI * 1.1} altura={0.56} t={t} fase={0.6} acoes={[{ de: 0, anim: "idle" }, { de: c.selo, anim: "emote-yes" }, { de: c.duzentos - 0.1, anim: "jump" }, { de: c.duzentos + 1.6, anim: "interact-left" }]} />
              <Modelo url="natureza/tree_oak" p={[-1.9, 0, -1.2]} alvo={{ altura: 1.2 }} />
            </group>
          ) : null}

          {naC ? (
            <group position={CX}>
              {[-1.0, 0, 1.0].map((x, i) => (
                <group key={i} position={[x, 0, -1.4]}>
                  <Modelo url="moveis/table" alvo={{ comp: 0.6 }} />
                  <Modelo url="moveis/laptop" p={[0, 0.3, 0]} rotY={0} alvo={{ comp: 0.2 }} />
                </group>
              ))}
              {multidao.map(({ i, x, z, t0 }) => (
                <Ator
                  key={i}
                  url={PESSOAS[i % PESSOAS.length]}
                  p={[x, 0, z]}
                  rotY={(hash(i + 3) - 0.5) * 0.8}
                  altura={0.5}
                  t={t}
                  entra={t0}
                  fase={hash(i) * 1.3}
                  acoes={[
                    { de: -1, anim: "idle" },
                    { de: c.oitocentos - 0.1 + hash(i + 7) * 0.35, anim: "jump" },
                    { de: c.conhece + hash(i + 2) * 0.8, anim: hash(i + 5) > 0.5 ? "emote-yes" : "interact-right" },
                  ]}
                />
              ))}
            </group>
          ) : null}

          {naD ? (
            <group position={DX}>
              <Modelo url="comercial/building-c" p={[0, 0, -1.6]} alvo={{ largura: 1.5 }} />
              <Fita p={[0, 0.05, 0.05]} k={fita} />
              <Ator url={PESSOAS[0]} p={[-0.75, 0, 0.7]} rotY={Math.PI} altura={0.56} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.fecha - 0.05, anim: "emote-no", vezes: 2 }, { de: c.policia, anim: "crouch" }]} />
              <Ator url={PESSOAS[4]} p={[0.75, 0, 0.8]} rotY={Math.PI} altura={0.56} t={t} fase={0.4} acoes={[{ de: 0, anim: "idle" }, { de: c.liquidacao - 0.05, anim: "emote-no", vezes: 2 }, { de: c.policia + 0.3, anim: "interact-left" }]} />
              {carro > 0.001 ? <Modelo url="carros/sedan" p={[lerp(-3.4, -1.0, carro), 0, 1.2]} rotY={Math.PI / 2} alvo={{ comp: 0.8 }} tinta="#5b7fd6" /> : null}
              <Modelo url="natureza/tree_detailed" p={[1.3, 0, -2.0]} alvo={{ altura: 1.1 }} />
            </group>
          ) : null}

          {naE ? (
            <group position={EX}>
              <B s={[1.3, 0.04, 0.9]} p={[0, 0.02, 0]} cor="#d8d2c2" />
              <Pilha k={pilha} />
              <Ator url={PESSOAS[2]} p={[-0.85, 0, 0.35]} rotY={0.5} altura={0.5} t={t} acoes={[{ de: -1, anim: "idle" }, { de: c.quarenta - 0.1, anim: "jump" }, { de: c.resgate, anim: "emote-yes" }, { de: c.contribuicoes, anim: "interact-right" }, { de: c.sistema - 0.1, anim: "emote-no", vezes: 2 }]} />
              {bancosE.map((b, i) => (
                <Modelo key={i} url={["comercial/building-a", "comercial/building-e", "comercial/building-k", "comercial/building-h"][i]} p={b} alvo={{ largura: 0.85 }} s={t >= c.onde - 0.4 ? Math.min(1, mola(c.onde - 0.4 + i * 0.12, 220, 14)) : 0} />
              ))}
              {fluxo >= 0
                ? bancosE.flatMap((b, i) =>
                    [0, 1, 2].map((j) => {
                      const k = ((fluxo * 0.6 + j / 3 + i * 0.11) % 1 + 1) % 1;
                      return <Moeda key={`${i}-${j}`} p={[lerp(b[0], 0, k), 0.35 + Math.sin(k * Math.PI) * 0.6, lerp(b[2] + 0.5, 0, k)]} />;
                    }),
                  )
                : null}
            </group>
          ) : null}
        </StageMundo>
      ) : null}

      <TelaSegura itens={rot} cam={cam} />
      <PalavraGrande ate={c.mande - 0.35} destaque={DESTAQUE} />

      {t >= c.mande - 0.35 && t < FECHO ? (
        <div style={{ position: "absolute", left: 70, right: 70, top: 300, textAlign: "center", transform: `scale(${mola(c.mande - 0.35, 200, 13)})` }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 80, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#ffffff", WebkitTextStroke: "9px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
            Mande para quem só olha a <span style={{ color: C.destaque }}>taxa</span>
          </div>
          {t >= c.comenta - 0.2 ? (
            <div style={{ marginTop: 40, opacity: p(t, c.comenta - 0.2, 0.3), fontFamily: FONT, fontWeight: 800, fontSize: 54, lineHeight: 1.15, color: "#ffffff", WebkitTextStroke: "7px rgba(10,14,12,0.9)", paintOrder: "stroke fill" }}>
              Parte 2: a venda que o <span style={{ color: C.destaque }}>Banco Central barrou</span>
            </div>
          ) : null}
        </div>
      ) : null}

      {t < FECHO ? <Selo txt="CASO MASTER · PARTE 1/3" /> : null}
      {t >= 0.3 && t < FECHO ? (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: FONT, fontSize: 24, fontWeight: 600, color: "rgba(20,30,25,0.66)" }}>
          Fontes: Banco Central, FGC, imprensa · consulta em 08/11/2026
        </div>
      ) : null}

      {[T1, T2, T3, T4].map((x, i) => (
        <Flash key={i} at={x} max={0.35} />
      ))}
      <Flash at={c.fecha - 0.05} max={0.3} cor={C.alerta} dur={0.35} />
      <Fecho at={FECHO} marca={MARCA_SERIE} />
      <Grain />
    </AbsoluteFill>
  );
};
