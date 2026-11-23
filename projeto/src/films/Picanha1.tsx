import React from "react";
import * as THREE from "three";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, Pedestal, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Boi } from "./Boi1";
import { Maco } from "./Libertadores1";

// PESO NO BOLSO · picanha1 · "Um quilo de picanha custa mais que um dia de salário mínimo" (BH, nov/2026).
// Dados: docs/dossies/picanha1.md. Preço de BH (Mercado Mineiro, 9–11/11); faixa de outubro (BH); salário mínimo 2026 R$ 1.621 ÷ 30 = R$ 54; arroba Cepea nov/2026.
precarregar(["personagens/character-male-a"]);

const S: V3[] = [0, 30, 60, 90, 120, 150].map((x) => [x, 0, 0] as V3);
const DESTAQUE = /picanha|quilo|dia|salário|mínimo|setenta|cinquenta|pior|outubro|cento|dobro|culpa|boi|arroba|recorde|trezentos|ceia|dois|oito|conta|Comenta|vídeos|Link|bio/i;

/** Picanha: cunha de carne vermelha (secção trapezoidal extrudada) com capa de gordura branca em cima e fibras na face. Comprimento ≈ 0.5·s. */
const PICANHA_SHAPE = (() => {
  const sh = new THREE.Shape();
  sh.moveTo(-0.17, 0);
  sh.lineTo(0.17, 0);
  sh.lineTo(0.1, 0.2);
  sh.quadraticCurveTo(0, 0.25, -0.1, 0.2);
  sh.lineTo(-0.17, 0);
  return sh;
})();
const Picanha: React.FC<{ p: V3; s?: number; rotY?: number }> = ({ p: pos, s = 1, rotY = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s} rotation={[0, rotY, 0]}>
      {/* carne */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <extrudeGeometry args={[PICANHA_SHAPE, { depth: 0.5, bevelEnabled: false }]} />
        <meshStandardMaterial color="#b3262e" roughness={0.55} />
      </mesh>
      {/* capa de gordura no topo */}
      <mesh position={[-0.25, 0.012, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.04, 1.0, 1.0]}>
        <extrudeGeometry
          args={[
            (() => {
              const g = new THREE.Shape();
              g.moveTo(-0.105, 0.19);
              g.quadraticCurveTo(0, 0.245, 0.105, 0.19);
              g.lineTo(0.1, 0.2);
              g.quadraticCurveTo(0, 0.255, -0.1, 0.2);
              g.lineTo(-0.105, 0.19);
              return g;
            })(),
            { depth: 0.5, bevelEnabled: false },
          ]}
        />
        <meshStandardMaterial color="#f4e8c8" roughness={0.7} />
      </mesh>
      {/* fibras/marmoreio na face do corte */}
      {[0.04, 0.08, 0.12, 0.16].map((y, i) => (
        <B key={y} s={[0.012, 0.012, 0.26 - i * 0.045]} p={[0.252, y, 0]} cor="#7a1a22" />
      ))}
      {[-0.18, -0.06, 0.06, 0.18].map((x) => (
        <B key={x} s={[0.012, 0.15, 0.012]} p={[x, 0.09, 0.172 - Math.abs(x) * 0.05]} cor="#8f1c25" />
      ))}
    </group>
  );
};

export const Picanha1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();

  const Tm = c.minimo - 0.5; // pedestal do salário
  const Tout = c.outubro - 0.3; // duas lojas
  const Tcul = c.culpa - 0.4; // boi
  const Tcon = c.conta - 0.5; // ceia
  const Tcom = c.comenta - 0.3; // CTA
  const T = [0, Tm, Tout, Tcul, Tcon, Tcom];
  const fim = c.fim + 3;
  const cam = (i: number, y: number, z: number, ly: number): [V3, V3] => [[S[i][0], y, z], [S[i][0], ly, 0]];
  const poses: [V3, V3][] = [cam(0, 1.0, 4.4, 0.78), cam(1, 1.3, 6.2, 0.5), cam(2, 1.3, 6.2, 0.5), cam(3, 1.0, 4.4, 0.78), cam(4, 1.3, 5.4, 0.4), cam(5, 1.4, 5.2, 0.7)];
  const K: Key[] = [];
  T.forEach((t0, i) => {
    const t1 = i < T.length - 1 ? T[i + 1] : fim;
    const [pos, look] = poses[i];
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(t, [[0, "#3a2a22"], [Tm, "#4a2a1a"], [Tout, "#2f4a6a"], [Tcul, "#5a4a2a"], [Tcon, "#2f6a4a"], [Tcom, "#2f8f5b"]], 0.25);
  const em = (i: number) => t >= T[i] - 0.05 && t < (i < T.length - 1 ? T[i + 1] : 1e9);
  const g = (t0: number, d = 1.0) => ease.out(p(t, t0, d));
  const rs = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: c.setenta - 0.3, titulo: "1 KG DE PICANHA > 1 DIA DE SALÁRIO MÍNIMO", valor: "olha a conta 👇", cor: C.destaque },
    { de: c.setenta - 0.2, ate: c.minimo - 0.3, titulo: "PICANHA · BH · NOVEMBRO · 1 KG", valor: "R$ 78,47", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.minimo - 0.2, ate: Tout - 0.2, titulo: "1 DIA DO SALÁRIO MÍNIMO (R$ 1.621 ÷ 30)", valor: "R$ 54", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: Tout + 0.1, ate: c.cinq54b - 0.3, titulo: "O MESMO CORTE, NA MESMA CIDADE", valor: "em outubro (BH)", cor: C.destaque },
    { de: c.cinq54b - 0.2, ate: c.cento - 0.3, titulo: "LOJA MAIS BARATA", valor: "R$ 54,98", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.cento - 0.2, ate: c.dobro - 0.3, titulo: "LOJA MAIS CARA", valor: "R$ 129,90", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.dobro - 0.2, ate: Tcul - 0.2, titulo: "DIFERENÇA", valor: "mais que o dobro" },
    { de: Tcul + 0.1, ate: c.arroba - 0.3, titulo: "A CULPA É DO BOI", valor: "oferta de gado restrita", cor: C.destaque },
    { de: c.arroba - 0.2, ate: Tcon - 0.2, titulo: "ARROBA DO BOI · RECORDE · CEPEA, NOV/2026", valor: "≈ R$ 395", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: Tcon + 0.1, ate: c.carne - 0.3, titulo: "CEIA (EXEMPLO): 2 KG PARA 8 PESSOAS", valor: "conta da picanha" },
    { de: c.carne - 0.2, ate: Tcom - 0.2, titulo: "SÓ DE PICANHA", valor: "≈ R$ 157", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.comenta - 0.2, ate: c.fim - 1.6, titulo: "COMENTA", valor: "o preço aí na sua cidade 👇", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  /** Placa amarela de pedestal (nome + valor ou "?"). */
  const Placa: React.FC<{ nome: string; val: string; mostra: boolean; x?: number }> = ({ nome, val, mostra, x = 0 }) => (
    <PlanoTexto linhas={mostra ? [[nome, 0.7, "#14211d"], [val, 1, "#14211d"]] : [[nome, 0.7, "#14211d"], ["?", 1, "#14211d"]]} fundo="#ffcf3a" tam={[0.56, 0.28]} p={[x, 1.08, 0.1]} px={[460, 230]} />
  );

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.9}>
        {/* 0: gancho — picanha no pedestal com etiqueta de preço subindo */}
        {em(0) ? (
          <group position={S[0]}>
            <Pedestal raio={0.6} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.4 - 0.5, 0]}>
              <Picanha p={[0, TOPO_PEDESTAL + 0.01, 0]} s={1.9 * mola(0.0, 220, 12)} />
            </group>
            <group position={[-0.2, 0.7, 0.8]} rotation={[0, 0.25, Math.sin(t * 3) * 0.05]} scale={0.6 * mola(0.2, 220, 12)}>
              <PlanoTexto linhas={[[rs(lerp(20, 78.47, ease.out(p(t, 0.3, 2.4, (x) => x)))), 1, "#c8262c"]]} fundo="#fff6d8" tam={[0.74, 0.22]} px={[500, 150]} />
            </group>
          </group>
        ) : null}

        {/* 1: picanha × um dia de salário (dois pedestais) */}
        {em(1) ? (
          <group position={S[1]}>
            <group position={[-0.45, 0, 0]}>
              <Pedestal raio={0.42} aro="#ffcf3a" acende={g(Tm, 0.4)} s={mola(Tm - 0.15, 260, 12)} />
              <Picanha p={[0, TOPO_PEDESTAL + 0.01, 0]} s={1.1 * mola(Tm, 220, 12)} rotY={-0.5} />
              <Placa nome="1 KG PICANHA" val="R$ 78,47" mostra x={0} />
            </group>
            <group position={[0.45, 0, 0]}>
              <Pedestal raio={0.42} aro="#ffcf3a" acende={g(c.minimo - 0.2, 0.4)} s={mola(Tm - 0.15, 260, 12)} />
              <Maco p={[0, TOPO_PEDESTAL, 0]} n={5.4 * g(c.minimo - 0.2, 0.8)} s={0.9} h={0.03} cor="#5fae5a" />
              <Placa nome="1 DIA DE SALÁRIO" val="R$ 54" mostra={t >= c.minimo - 0.1} x={0} />
            </group>
          </group>
        ) : null}

        {/* 2: o mesmo corte, duas lojas */}
        {em(2) ? (
          <group position={S[2]}>
            {(
              [
                ["MAIS BARATA", -0.45, c.cinq54b - 0.2, "R$ 54,98"],
                ["MAIS CARA", 0.45, c.cento - 0.2, "R$ 129,90"],
              ] as const
            ).map(([nome, x, t0, val]) => (
              <group key={nome} position={[x, 0, 0]}>
                <Pedestal raio={0.42} aro="#ffcf3a" acende={g(t0, 0.4)} s={mola(Tout - 0.15, 260, 12)} />
                <Picanha p={[0, TOPO_PEDESTAL + 0.01, 0]} rotY={-0.5} s={1.1 * mola(Math.min(t0, Tout), 220, 12)} />
                <Placa nome={nome} val={val} mostra={t >= t0 + 0.2} />
              </group>
            ))}
          </group>
        ) : null}

        {/* 3: o boi (volta do vídeo da arroba) */}
        {em(3) ? (
          <group position={S[3]}>
            <Pedestal raio={0.6} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.4 - 0.5, 0]}>
              <Boi p={[0, TOPO_PEDESTAL, 0]} s={1.0 * mola(Tcul, 220, 12)} t={t} />
            </group>
            <group position={[-0.25, 0.62, 0.55]} rotation={[0, 0.25, Math.sin(t * 3) * 0.05]} scale={0.7 * mola(Tcul + 0.2, 220, 12)}>
              <PlanoTexto linhas={[[`R$ ${Math.round(lerp(120, 395, ease.out(p(t, c.arroba - 0.1, 2.0, (x) => x))))}`, 1, "#c8262c"]]} fundo="#fff6d8" tam={[0.62, 0.22]} px={[420, 150]} />
            </group>
          </group>
        ) : null}

        {/* 4: a conta da ceia (8 pratos + 2 kg) */}
        {em(4) ? (
          <group position={S[4]}>
            <B s={[1.5, 0.05, 0.7]} p={[0, 0.025, 0]} cor="#7a5a3a" rough={0.9} />
            {Array.from({ length: 8 }, (_, i) => {
              const x = -0.55 + (i % 4) * 0.37;
              const z = i < 4 ? -0.17 : 0.17;
              const k = ease.out(p(t, c.oito - 0.3 + i * 0.1, 0.4));
              return <B key={i} s={[0.24 * k, 0.02, 0.24 * k]} p={[x, 0.06, z]} cor="#f2f2ee" />;
            })}
            <Picanha p={[-0.1, 0.07, 0.5]} s={1.0 * mola(c.dois - 0.1, 220, 12)} rotY={0.1} />
            <Picanha p={[-0.1, 0.3, 0.5]} s={1.0 * mola(c.dois, 220, 12)} rotY={-0.1} />
            <PlanoTexto linhas={[["2 KG", 1, "#ffffff"]]} fundo="#a6302b" tam={[0.45, 0.14]} p={[0.45, 0.42, 0.5]} px={[450, 140]} />
          </group>
        ) : null}

        {/* 5: CTA */}
        {em(5) ? (
          <group position={S[5]}>
            <Boneco url="personagens/character-male-a" p={[0, 0.1, 0.5]} altura={0.9} anim="idle" tAnim={t} s={mola(Tcom, 220, 12)} />
            <group scale={mola(Tcom + 0.1, 200, 12)}>
              <PlanoTexto linhas={[["PREÇO NA SUA CIDADE?", 1, "#ffffff"]]} fundo="#10331f" tam={[1.0, 0.16]} p={[0, 1.1, 0.3]} px={[880, 140]} />
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={250} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      <Carimbo t={t} de={c.dobro - 0.1} ate={Tcul - 0.15} txt="2,4× MAIS CARO" top={1500} />

      <PalavraGrande destaque={DESTAQUE} />
      {T.slice(1).map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
