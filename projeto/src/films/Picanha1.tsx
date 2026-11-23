import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, PlanoTexto } from "../lib/objetos";
import { ease, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Boi } from "./Boi1";
import { Maco } from "./Libertadores1";

// PESO NO BOLSO · picanha1 · "Um quilo de picanha custa mais que um dia de salário mínimo" (BH, nov/2026).
// Dados: docs/dossies/picanha1.md. Preço de BH (Mercado Mineiro, 9–11/11); faixa de outubro (BH); salário mínimo 2026 R$ 1.621 ÷ 30 = R$ 54; arroba Cepea nov/2026.
precarregar(["personagens/character-male-a"]);

const S: V3[] = [0, 30, 60, 90, 120, 150].map((x) => [x, 0, 0] as V3);
const DESTAQUE = /picanha|quilo|dia|salário|mínimo|setenta|cinquenta|pior|outubro|cento|dobro|culpa|boi|arroba|recorde|trezentos|ceia|dois|oito|conta|Comenta|vídeos|Link|bio/i;

/** Picanha em bloco: carne vermelha com capa de gordura e marmoreio. Comprimento ≈ 0.6·s. */
const Picanha: React.FC<{ p: V3; s?: number; rotY?: number }> = ({ p: pos, s = 1, rotY = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      <B s={[0.6, 0.14, 0.3]} p={[0, 0.07, 0]} cor="#a6302b" rough={0.6} />
      <B s={[0.6, 0.05, 0.3]} p={[0, 0.165, 0]} cor="#f3e6c8" rough={0.7} />
      <B s={[0.5, 0.03, 0.26]} p={[0.02, 0.1, 0.0]} cor="#c0453c" rough={0.6} />
      {[-0.18, 0, 0.18].map((x) => (
        <B key={x} s={[0.025, 0.12, 0.31]} p={[x, 0.07, 0]} cor="#e8c9b0" rough={0.8} />
      ))}
    </group>
  );
};

export const Picanha1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();

  const T = [0, c.outubro - 0.3, c.culpa - 0.4, c.conta - 0.5, c.comenta - 0.3];
  const fim = c.fim + 3;
  const cam = (i: number, y: number, z: number, ly: number): [V3, V3] => [[S[i][0], y, z], [S[i][0], ly, 0]];
  const poses: [V3, V3][] = [cam(0, 1.15, 3.0, 0.38), cam(1, 1.15, 3.0, 0.4), cam(2, 1.2, 3.1, 0.4), cam(3, 1.3, 3.1, 0.35), cam(4, 1.1, 3.2, 0.45)];
  const K: Key[] = [];
  T.forEach((t0, i) => {
    const t1 = i < T.length - 1 ? T[i + 1] : fim;
    const [pos, look] = poses[i];
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0] + (i % 2 ? -0.12 : 0.12), pos[1] - 0.08, pos[2] * 0.94], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(t, [[0, "#6a2a2a"], [T[1], "#2f4a6a"], [T[2], "#5a4a2a"], [T[3], "#2f6a4a"], [T[4], "#2f8f5b"]], 0.25);
  const em = (i: number) => t >= T[i] - 0.05 && t < (i < T.length - 1 ? T[i + 1] : 1e9);
  const W = (i: number, ch: React.ReactNode) => (em(i) ? <group position={[S[i][0], 0.08, 0]} scale={0.76}>{ch}</group> : null);
  const g = (t0: number, d = 1.0) => ease.out(p(t, t0, d));

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: c.setenta - 0.3, titulo: "1 KG DE PICANHA > 1 DIA DE SALÁRIO MÍNIMO", valor: "olha a conta 👇", cor: C.destaque },
    { de: c.setenta - 0.2, ate: c.minimo - 0.3, titulo: "PICANHA · BH · NOVEMBRO · 1 KG", valor: "R$ 78,47", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.minimo - 0.2, ate: T[1] - 0.2, titulo: "1 DIA DO SALÁRIO MÍNIMO (R$ 1.621 ÷ 30)", valor: "R$ 54", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T[1] + 0.1, ate: c.cinq54b - 0.3, titulo: "O MESMO CORTE, NA MESMA CIDADE", valor: "em outubro (BH)", cor: C.destaque },
    { de: c.cinq54b - 0.2, ate: c.cento - 0.3, titulo: "LOJA MAIS BARATA", valor: "R$ 54,98", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.cento - 0.2, ate: c.dobro - 0.3, titulo: "LOJA MAIS CARA", valor: "R$ 129,90", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.dobro - 0.2, ate: T[2] - 0.2, titulo: "DIFERENÇA", valor: "mais que o dobro" },
    { de: T[2] + 0.1, ate: c.arroba - 0.3, titulo: "A CULPA É DO BOI", valor: "oferta de gado restrita", cor: C.destaque },
    { de: c.arroba - 0.2, ate: T[3] - 0.2, titulo: "ARROBA DO BOI · RECORDE · CEPEA, NOV/2026", valor: "≈ R$ 395", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T[3] + 0.1, ate: c.carne - 0.3, titulo: "CEIA (EXEMPLO): 2 KG PARA 8 PESSOAS", valor: "conta da picanha" },
    { de: c.carne - 0.2, ate: T[4] - 0.2, titulo: "SÓ DE PICANHA", valor: "≈ R$ 157", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.comenta - 0.2, ate: c.fim - 1.6, titulo: "COMENTA", valor: "o preço aí na sua cidade 👇", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.2}>
        {/* 0: gancho — picanha de 1 kg × um dia de salário */}
        {W(
          0,
          <group>
            <Maco p={[-0.3, 0, 0.2]} n={7.85 * g(c.setenta - 0.3, 0.8)} s={0.7} h={0.03} cor="#5fae5a" />
            <Picanha p={[-0.3, 0.07 + 7.85 * 0.03 * g(c.setenta - 0.3, 0.8), 0.2]} s={0.7 * mola(0.0, 220, 12)} rotY={0.3 + Math.sin(t * 1.2) * 0.1} />
            <Maco p={[0.35, 0, 0.2]} n={5.4 * g(c.minimo - 0.3, 0.8)} s={0.7} h={0.03} cor="#5fae5a" />
            <PlanoTexto linhas={[["R$ 78,47", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.55, 0.12]} p={[-0.3, 0.6, 0.5]} px={[550, 120]} />
            <PlanoTexto linhas={[["R$ 54", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.4, 0.12]} p={[0.35, 0.38, 0.5]} px={[400, 120]} />
          </group>,
        )}

        {/* 1: o mesmo corte, duas lojas */}
        {W(
          1,
          <group>
            <Picanha p={[-0.3, 0.05, 0.1]} s={0.65 * mola(T[1], 220, 12)} rotY={0.3} />
            <Picanha p={[0.3, 0.05, 0.1]} s={0.65 * mola(c.cinq54b, 220, 12)} rotY={-0.3} />
            <PlanoTexto linhas={[["R$ 54,98", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.5, 0.12]} p={[-0.3, 0.42, 0.4]} px={[500, 120]} />
            <group scale={mola(c.cento, 220, 12)} position={[0.3, 0.42, 0.4]}>
              <PlanoTexto linhas={[["R$ 129,90", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.6, 0.12]} px={[600, 120]} />
            </group>
          </group>,
        )}

        {/* 2: a culpa é do boi */}
        {W(
          2,
          <group>
            <Boi p={[0, 0.02, 0]} s={1.0 * mola(T[2], 220, 12)} t={t} />
            <group scale={mola(c.arroba, 220, 12)} position={[0.1, 0.85, 0.3]}>
              <PlanoTexto linhas={[["RECORDE", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.12]} px={[500, 120]} />
            </group>
          </group>,
        )}

        {/* 3: a conta da ceia (8 pratos + 2 kg) */}
        {W(
          3,
          <group>
            <B s={[1.0, 0.04, 0.5]} p={[0, 0.02, 0]} cor="#7a5a3a" rough={0.9} />
            {Array.from({ length: 8 }, (_, i) => {
              const x = -0.39 + (i % 4) * 0.26;
              const z = i < 4 ? -0.12 : 0.12;
              const k = ease.out(p(t, c.oito - 0.3 + i * 0.1, 0.4));
              return <B key={i} s={[0.17 * k, 0.015, 0.17 * k]} p={[x, 0.05, z]} cor="#f2f2ee" />;
            })}
            <Picanha p={[0, 0.06, 0.38]} s={0.8 * mola(c.dois - 0.1, 220, 12)} rotY={0.1} />
            <Picanha p={[0, 0.2, 0.38]} s={0.8 * mola(c.dois, 220, 12)} rotY={-0.1} />
            <PlanoTexto linhas={[["2 KG", 1, "#ffffff"]]} fundo="#a6302b" tam={[0.4, 0.12]} p={[0.3, 0.45, 0.5]} px={[400, 120]} />
          </group>,
        )}

        {/* 4: CTA */}
        {W(
          4,
          <group>
            <Boneco url="personagens/character-male-a" p={[0, 0.2, 0.5]} altura={0.55} anim="idle" tAnim={t} s={mola(T[4], 220, 12)} />
            <group scale={mola(T[4] + 0.1, 200, 12)}>
              <PlanoTexto linhas={[["PREÇO NA SUA CIDADE?", 1, "#ffffff"]]} fundo="#10331f" tam={[1.0, 0.16]} p={[0, 0.85, 0.3]} px={[880, 140]} />
            </group>
          </group>,
        )}
      </PalcoCor>

      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={250} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      <Carimbo t={t} de={c.dobro - 0.1} ate={T[2] - 0.15} txt="2,4× MAIS CARO" top={560} />

      <PalavraGrande destaque={DESTAQUE} />
      {T.slice(1).map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
