import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, PlanoTexto } from "../lib/objetos";
import { ease, hash, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Lavoura } from "./Fazenda1";
import { Maco } from "./Libertadores1";
import { Bandeira } from "./Picape1";

// PESO NO BOLSO · fazenda2 · "Fazenda parte 2: o custo de plantar soja, EUA × Mato Grosso" (resposta aos comentários do vídeo 1).
// Dados: docs/dossies/fazenda2.md (USDA ERS EIB-310, out/2026, médias 2023–25; R$ 10.200/ha Heartland e R$ 7.900/ha MT = contas nossas, US$ 1 = R$ 5,93).
// Recap do episódio 1 (docs/dossies/fazenda1.md): US$ 5 mi → 336 ha EUA × 738 ha Brasil; colheita ≈ 1.200 t × 2.700 t.
precarregar(["carros/tractor", "personagens/character-male-a", "comercial/building-a"]);

const S: V3[] = [0, 30, 60, 90, 120, 150, 180, 210, 240].map((x) => [x, 0, 0] as V3);
const DESTAQUE = /anterior|cinco|milhões|trezentos|setecentos|colheita|comentários|impostos|manutenção|hectare|média|governo|dez|mil|Mato|sete|máquinas|terra|Imposto|chutar|saca|vantagem|seguro|nove|ganha|parte|Comenta|custo|vídeos|Link|bio/i;

export const Fazenda2: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();

  const T = [0, c.perguntaram - 0.3, c.hoje + 1.0, c.dez - 0.6, c.maquinas - 0.5, c.imposto - 0.4, c.saca - 0.5, c.olha - 0.4, c.parte - 0.3];
  const fim = c.fim + 3;
  const cam = (i: number, y: number, z: number, ly: number): [V3, V3] => [[S[i][0], y, z], [S[i][0], ly, 0]];
  const poses: [V3, V3][] = [cam(0, 1.5, 3.4, 0.3), cam(1, 1.1, 3.0, 0.42), cam(2, 1.5, 3.3, 0.3), cam(3, 1.2, 3.1, 0.4), cam(4, 1.3, 3.1, 0.35), cam(5, 1.1, 3.0, 0.42), cam(6, 1.2, 3.1, 0.42), cam(7, 1.3, 3.2, 0.38), cam(8, 1.1, 3.2, 0.45)];
  const K: Key[] = [];
  T.forEach((t0, i) => {
    const t1 = i < T.length - 1 ? T[i + 1] : fim;
    const [pos, look] = poses[i];
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0] + (i % 2 ? -0.12 : 0.12), pos[1] - 0.08, pos[2] * 0.94], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#3d7a3a"],
      [T[1], "#3a4a7a"],
      [T[2], "#4a7a3a"],
      [T[3], "#2f6a8a"],
      [T[4], "#7a5a2a"],
      [T[5], "#5a3a6a"],
      [T[6], "#6a4a2a"],
      [T[7], "#2f7a5a"],
      [T[8], "#2f8f5b"],
    ],
    0.25,
  );
  const em = (i: number) => t >= T[i] - 0.05 && t < (i < T.length - 1 ? T[i + 1] : 1e9);
  const W = (i: number, ch: React.ReactNode) => (em(i) ? <group position={[S[i][0], 0.08, 0]} scale={0.76}>{ch}</group> : null);

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: c.trezentos - 0.35, titulo: "NO EPISÓDIO ANTERIOR", valor: "US$ 5 milhões 💵", cor: C.destaque },
    { de: c.trezentos - 0.2, ate: c.setecentos - 0.35, titulo: "ESTADOS UNIDOS", valor: "336 ha" },
    { de: c.setecentos - 0.2, ate: c.colheita - 0.35, titulo: "BRASIL", valor: "738 ha", cor: C.destaque },
    { de: c.colheita - 0.2, ate: T[1] - 0.2, titulo: "COLHEITA · EUA × BRASIL", valor: "≈ 1.200 t × 2.700 t" },
    { de: T[1] + 0.1, ate: c.hoje - 0.35, titulo: "VOCÊS PERGUNTARAM", valor: "impostos e manutenção?", cor: C.destaque },
    { de: c.hoje - 0.2, ate: c.hectare - 0.3, titulo: "HOJE", valor: "a conta de quem planta" },
    { de: c.hectare - 0.2, ate: T[3] - 0.15, titulo: "1 HECTARE DE SOJA · MÉDIA 2023–25", valor: "dados do governo dos EUA (USDA)" },
    { de: T[3] + 0.1, ate: c.mato - 0.35, titulo: "EUA (CORAÇÃO DA SOJA)", valor: "≈ R$ 10.200/ha", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.mato - 0.2, ate: T[4] - 0.15, titulo: "MATO GROSSO", valor: "≈ R$ 7.900/ha", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T[4] + 0.1, ate: c.imposto - 0.55, titulo: "MÁQUINAS ENTRAM NA CONTA", valor: "pesam mais nos EUA, com a terra" },
    { de: T[5] + 0.1, ate: c.saca - 0.5, titulo: "IMPOSTO", valor: "o estudo não mostra separado", cor: C.destaque },
    { de: c.saca - 0.4, ate: c.seguro - 0.15, titulo: "PREÇO DA SACA E VANTAGEM DO GOVERNO", valor: "fora deste estudo" },
    { de: T[7] + 0.1, ate: c.ganha - 0.5, titulo: "9 ANOS SEGUIDOS (2017–25)", valor: "MT sobra mais por hectare", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.ganha - 0.4, ate: c.comenta - 0.35, titulo: "QUEM GANHA DE VERDADE?", valor: "parte 3, com fonte", cor: C.destaque },
    { de: c.comenta - 0.2, ate: c.fim - 1.6, titulo: "COMENTA", valor: "CUSTO 👇", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  const stackH = (i: number) => Math.min(1, Math.max(0, p(t, T[3] + 0.2 + i * 0.4, 1.4, ease.out)));

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.2}>
        {/* 0: recap — as duas lavouras do episódio 1 */}
        {W(
          0,
          <group>
            <group position={[-0.5, 0, 0]} scale={1.5}>
              <Lavoura p={[0, 0, 0]} cols={2} total={8} n={8 * ease.out(p(t, c.trezentos - 0.2, 1.6))} soja={0.9} seed={3} />
            </group>
            <Bandeira p={[-0.5, 0.45, 0.6]} pais="US" s={0.5 * mola(c.trezentos - 0.2, 220, 12)} t={t} />
            <group position={[0.35, 0, 0]} scale={1.5}>
              <Lavoura p={[0, 0, 0]} cols={3} total={18} n={18 * ease.out(p(t, c.setecentos - 0.2, 1.8))} soja={0.9} seed={9} />
            </group>
            <Bandeira p={[0.35, 0.45, 0.6]} pais="BR" s={0.5 * mola(c.setecentos - 0.2, 220, 12)} t={t} />
            {t >= c.colheita - 0.1 ? (
              <group position={[0, 0, 0.9]}>
                <B s={[0.25, 1.2 * 0.22 * ease.out(p(t, c.colheita - 0.1, 1.2)), 0.25]} p={[-0.5, 0.11 * ease.out(p(t, c.colheita - 0.1, 1.2)), 0]} cor="#e0b030" />
                <B s={[0.25, 2.7 * 0.22 * ease.out(p(t, c.duzentas - 0.1, 1.4)), 0.25]} p={[0.35, 0.11 * 2.7 * ease.out(p(t, c.duzentas - 0.1, 1.4)), 0]} cor="#e0b030" />
              </group>
            ) : null}
          </group>,
        )}

        {/* 1: comentários — pergunta com "?" */}
        {W(
          1,
          <group>
            <Boneco url="personagens/character-male-a" p={[0, 0, 0.3]} altura={0.62} anim="idle" tAnim={t} s={mola(T[1], 220, 12)} />
            {[-0.32, 0.34].map((x, i) => (
              <group key={x} position={[x, 0.75 + 0.05 * Math.sin(t * 2 + i), 0.3]} scale={mola(c.impostos - 0.1 + i * 0.5, 220, 12)}>
                <PlanoTexto linhas={[[i ? "CUSTO?" : "IMPOSTO?", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.48, 0.14]} px={[480, 140]} />
              </group>
            ))}
          </group>,
        )}

        {/* 2: 1 hectare de soja */}
        {W(
          2,
          <group>
            <group scale={1.7}>
              <Lavoura p={[0, 0, 0]} cols={3} total={9} n={9 * ease.out(p(t, T[2], 1.4))} soja={0.95} seed={5} />
            </group>
            <PlanoTexto linhas={[["1 HECTARE", 1, "#ffffff"]]} fundo="#2f6a8a" tam={[0.6, 0.13]} p={[0, 0.7, 0.9]} px={[560, 130]} />
          </group>,
        )}

        {/* 3: R$ 10.200 × R$ 7.900 */}
        {W(
          3,
          <group>
            <Maco p={[-0.33, 0, 0]} n={51 * stackH(0)} s={0.8} h={0.012} cor="#5fae5a" />
            <Maco p={[0.33, 0, 0]} n={39.5 * stackH(1)} s={0.8} h={0.012} cor="#5fae5a" />
            <Bandeira p={[-0.33, 0.45, 0]} pais="US" s={0.4 * mola(T[3] + 0.1, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.36, 0]} pais="BR" s={0.4 * mola(c.mato - 0.1, 220, 12)} t={t} />
          </group>,
        )}

        {/* 4: máquinas e terra */}
        {W(
          4,
          <group>
            <B s={[0.9, 0.04, 0.6]} p={[-0.1, 0.02, 0]} cor="#8a5a34" rough={1} />
            <Modelo url="carros/tractor" p={[lerp(-0.5, 0.2, ease.out(p(t, T[4], 1.5))), 0.04, 0.1]} alvo={{ comp: 0.55 }} s={mola(T[4], 220, 12)} />
            <PlanoTexto linhas={[["TERRA + MÁQUINAS", 1, "#ffffff"]]} fundo="#7a5a2a" tam={[0.9, 0.13]} p={[0, 0.7, 0.4]} px={[800, 120]} />
          </group>,
        )}

        {/* 5: imposto? */}
        {W(
          5,
          <group>
            <group scale={mola(T[5], 220, 12)}>
              <PlanoTexto linhas={[["?", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.5]} p={[0, 0.4, 0.3]} px={[400, 400]} />
            </group>
            <PlanoTexto linhas={[["IMPOSTO", 1, "#ffffff"]]} fundo="#5a3a6a" tam={[0.7, 0.13]} p={[0, 0.98, 0.4]} px={[560, 110]} />
          </group>,
        )}

        {/* 6: saca e governo — fora do estudo */}
        {W(
          6,
          <group>
            <B s={[0.3, 0.42, 0.2]} p={[-0.35, 0.21, 0]} cor="#d9b46a" />
            <PlanoTexto linhas={[["SACA", 1, "#3a2a10"]]} fundo="#f2e2b0" tam={[0.26, 0.09]} p={[-0.35, 0.22, 0.11]} px={[300, 100]} />
            <Modelo url="comercial/building-a" p={[0.4, 0, 0]} alvo={{ altura: 0.7 }} s={mola(c.vantagem - 0.2, 220, 12)} />
            <PlanoTexto linhas={[["GOVERNO", 1, "#ffffff"]]} fundo="#2f5aa8" tam={[0.44, 0.1]} p={[0.4, 0.85, 0.3]} px={[400, 100]} />
          </group>,
        )}

        {/* 7: 9 anos seguidos (barras ilustrativas: MT sempre à frente, sem valores) */}
        {W(
          7,
          <group>
            {Array.from({ length: 9 }, (_, i) => {
              const k = ease.out(p(t, T[7] + 0.15 + i * 0.28, 0.5));
              const x = -0.5 + i * 0.125;
              const hm = 0.45 + hash(i + 11) * 0.12;
              const hu = hm - 0.1 - hash(i + 3) * 0.1;
              return (
                <group key={i} position={[x, 0, 0]}>
                  <B s={[0.06, hu * k, 0.06]} p={[-0.035, (hu * k) / 2, 0]} cor="#4a78d8" />
                  <B s={[0.06, hm * k, 0.06]} p={[0.035, (hm * k) / 2, 0]} cor="#3fbf5a" />
                </group>
              );
            })}
            <PlanoTexto linhas={[["ILUSTRATIVO · 2017–2025", 1, "#ffffff"]]} fundo="#1b3a2a" tam={[1.0, 0.1]} p={[0, 0.8, 0.3]} px={[900, 90]} />
          </group>,
        )}

        {/* 8: parte 3 */}
        {W(
          8,
          <group>
            <group scale={mola(T[8], 200, 12)}>
              <PlanoTexto linhas={[["PARTE 3", 1, "#ffffff"]]} fundo="#2f8f5b" tam={[0.9, 0.2]} p={[0, 0.98, 0.3]} px={[720, 160]} />
            </group>
            <Boneco url="personagens/character-male-a" p={[0, 0, 0.5]} altura={0.55} anim="idle" tAnim={t} s={mola(T[8] + 0.1, 220, 12)} />
          </group>,
        )}
      </PalcoCor>

      {t >= c.hectare - 0.3 && t < T[4] - 0.1 ? (
        <div style={{ position: "absolute", top: 722, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: "#fff", background: "rgba(14,18,24,0.75)", padding: "8px 26px", borderRadius: 999 }}>USDA · MÉDIA 2023–25 · US$ 1 = R$ 5,93</div>
        </div>
      ) : null}

      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={250} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      <Carimbo t={t} de={c.chutar - 0.2} ate={c.saca - 0.8} txt="NÃO VOU CHUTAR" top={560} />
      <Carimbo t={t} de={c.seguro - 0.1} ate={T[7] - 0.1} txt="FORA DO ESTUDO" top={560} />

      <PalavraGrande destaque={DESTAQUE} />
      {T.slice(1).map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
