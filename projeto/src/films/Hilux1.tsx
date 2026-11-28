import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, Pedestal, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Maco } from "./Libertadores1";
import { Bandeira, Picape } from "./Picape1";

// PESO NO BOLSO · hilux1 · "A Hilux atual com mais de R$ 40 mil de desconto antes da nova geração" (formato do boi: pedestal + etiqueta de preço).
// Dados: docs/dossies/hilux1.md. Picape genérica (sem logo Toyota). Preço de tabela R$ 314.690 (SRV 2026); R$ 269.990 = anúncio de uma loja (nov/2026).
precarregar(["personagens/character-male-a"]);

const S: V3[] = [0, 30, 60, 90, 120, 150].map((x) => [x, 0, 0] as V3);
const DESTAQUE = /Hilux|Toyota|quarenta|tabela|trezentos|catorze|anúncio|duzentos|menos|salários|mínimos|geração|Argentina|data|Esperar|comprar|Comenta|vídeos|Link|bio/i;
const brl = (v: number) => `R$ ${Math.round(v).toLocaleString("pt-BR")}`;

export const Hilux1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();

  const Tt = c.tabela - 0.4; // tabela
  const Ta = c.anuncio - 0.4; // anúncio
  const Ts = c.salarios - 0.7; // salários
  const Tn = c.geracao - 0.4; // nova geração
  const Tc = c.esperar - 0.3; // CTA
  const T = [0, Tt, Ta, Ts, Tn, Tc];
  const fim = c.fim + 3;
  const cam = (i: number, y: number, z: number, ly: number): [V3, V3] => [[S[i][0], y, z], [S[i][0], ly, 0]];
  const poses: [V3, V3][] = [cam(0, 1.0, 4.4, 0.78), cam(1, 1.0, 4.4, 0.78), cam(2, 1.3, 6.2, 0.5), cam(3, 1.2, 4.6, 0.6), cam(4, 1.0, 4.4, 0.78), cam(5, 1.4, 5.2, 0.7)];
  const K: Key[] = [];
  T.forEach((t0, i) => {
    const t1 = i < T.length - 1 ? T[i + 1] : fim;
    const [pos, look] = poses[i];
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(t, [[0, "#3a2a22"], [Tt, "#2a3a4a"], [Ta, "#2f4a6a"], [Ts, "#2f6a4a"], [Tn, "#5a4a2a"], [Tc, "#2f8f5b"]], 0.25);
  const em = (i: number) => t >= T[i] - 0.05 && t < (i < T.length - 1 ? T[i + 1] : 1e9);
  const g = (t0: number, d = 1.0) => ease.out(p(t, t0, d));

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: c.quarenta - 0.3, titulo: "HILUX 2026 · ANTES DA NOVA GERAÇÃO", valor: "olha o desconto 👇", cor: C.destaque },
    { de: c.quarenta - 0.2, ate: Tt - 0.2, titulo: "DESCONTO NA HILUX ATUAL (REPORTAGEM)", valor: "> R$ 40 mil", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: Tt + 0.1, ate: c.trezentos - 0.3, titulo: "HILUX SRV 2026 · TABELA", valor: "preço oficial" },
    { de: c.trezentos - 0.2, ate: Ta - 0.2, titulo: "TABELA OFICIAL · SRV 2026", valor: "R$ 314.690", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: Ta + 0.1, ate: c.duzentos - 0.3, titulo: "ANÚNCIO DE NOVEMBRO · À VISTA", valor: "uma loja", cor: C.destaque },
    { de: c.duzentos - 0.2, ate: c.menos - 0.3, titulo: "ANÚNCIO À VISTA", valor: "R$ 269.990", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.menos - 0.2, ate: Ts - 0.2, titulo: "DIFERENÇA", valor: "R$ 44.700", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: Ts + 0.1, ate: Tn - 0.2, titulo: "R$ 44.700 EM SALÁRIOS MÍNIMOS (R$ 1.621)", valor: "≈ 27,6", cor: C.destaque },
    { de: Tn + 0.1, ate: c.dois - 0.3, titulo: "NOVA GERAÇÃO", valor: "feita na Argentina", cor: C.destaque },
    { de: c.dois - 0.2, ate: Tc - 0.2, titulo: "PREÇO E DATA NO BRASIL", valor: "ainda não confirmados" },
    { de: Tc + 0.1, ate: c.comenta + 1.2, titulo: "ESPERAR OU COMPRAR?", valor: "comenta 👇", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  const Placa: React.FC<{ nome: string; val: string; x?: number }> = ({ nome, val, x = 0 }) => (
    <PlanoTexto linhas={[[nome, 0.7, "#14211d"], [val, 1, "#14211d"]]} fundo="#ffcf3a" tam={[0.64, 0.28]} p={[x, 1.08, 0.1]} px={[520, 230]} />
  );

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.9}>
        {/* 0 e 1: picape no pedestal com etiqueta de preço subindo até a tabela */}
        {em(0) || em(1) ? (
          <group position={em(0) ? S[0] : S[1]}>
            <Pedestal raio={0.6} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.4 - 0.5, 0]}>
              <Picape p={[0, TOPO_PEDESTAL + 0.12, 0]} s={0.9 * mola(0.0, 220, 12)} cor="#d8dde3" />
            </group>
            <group position={[-0.32, 0.8, 0.6]} rotation={[0, 0.25, Math.sin(t * 3) * 0.05]} scale={0.62 * mola(0.2, 220, 12)}>
              <PlanoTexto linhas={[[brl(lerp(120000, 314690, ease.out(p(t, 0.3, 3.0, (x) => x)))), 1, "#c8262c"]]} fundo="#fff6d8" tam={[0.9, 0.22]} px={[640, 150]} />
            </group>
          </group>
        ) : null}

        {/* 2: tabela × anúncio (dois pedestais) */}
        {em(2) ? (
          <group position={S[2]}>
            <group position={[-0.5, 0, 0]}>
              <Pedestal raio={0.46} aro="#ffcf3a" acende={g(Ta, 0.4)} s={mola(Ta - 0.15, 260, 12)} />
              <Picape p={[0, TOPO_PEDESTAL + 0.1, 0]} s={0.62 * mola(Ta, 220, 12)} rotY={-0.5} cor="#d8dde3" />
              <Placa nome="TABELA SRV" val="R$ 314.690" />
            </group>
            <group position={[0.5, 0, 0]}>
              <Pedestal raio={0.46} aro="#ffcf3a" acende={g(c.duzentos - 0.2, 0.4)} s={mola(Ta - 0.15, 260, 12)} />
              <Picape p={[0, TOPO_PEDESTAL + 0.1, 0]} s={0.62 * mola(Math.min(c.duzentos, Ta + 0.3), 220, 12)} rotY={-0.5} cor="#d8dde3" />
              <Placa nome="ANÚNCIO À VISTA" val={t >= c.duzentos - 0.1 ? "R$ 269.990" : "?"} />
            </group>
          </group>
        ) : null}

        {/* 3: R$ 44.700 em salários mínimos */}
        {em(3) ? (
          <group position={S[3]}>
            <Maco p={[0, 0, 0.2]} n={27.6 * g(c.salarios - 0.3, 1.6)} s={1.0} h={0.022} cor="#5fae5a" />
            <group scale={mola(c.salarios, 220, 12)}>
              <PlanoTexto linhas={[["27,6 SALÁRIOS", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.9, 0.13]} p={[0, 0.8, 0.5]} px={[800, 120]} />
            </group>
          </group>
        ) : null}

        {/* 4: nova geração — sem preço nem data */}
        {em(4) ? (
          <group position={S[4]}>
            <Pedestal raio={0.6} aro="#ffcf3a" />
            <Picape p={[0, TOPO_PEDESTAL + 0.12, 0]} s={0.9 * mola(Tn, 220, 12)} rotY={-0.5} cor="#9aa3ad" />
            <Placa nome="NOVA GERAÇÃO" val="R$ ?" />
            <Bandeira p={[0.75, 0.2, 0.2]} pais="AR" s={0.4 * mola(c.argentina, 220, 12)} t={t} />
          </group>
        ) : null}

        {/* 5: CTA */}
        {em(5) ? (
          <group position={S[5]}>
            <Boneco url="personagens/character-male-a" p={[0, 0.1, 0.5]} altura={0.9} anim="idle" tAnim={t} s={mola(Tc, 220, 12)} />
            <group scale={mola(Tc + 0.1, 200, 12)}>
              <PlanoTexto linhas={[["ESPERAR OU COMPRAR?", 1, "#ffffff"]]} fundo="#10331f" tam={[1.1, 0.16]} p={[0, 1.1, 0.3]} px={[940, 140]} />
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={250} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      <Carimbo t={t} de={c.menos - 0.1} ate={Ts - 0.15} txt="− R$ 44.700" top={1500} />

      <PalavraGrande destaque={DESTAQUE} />
      {T.slice(1).map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
