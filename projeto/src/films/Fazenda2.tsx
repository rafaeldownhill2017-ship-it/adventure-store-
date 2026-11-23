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

  const T = [0, c.perguntaram - 0.3, c.hoje + 1.0, c.dez - 0.6, c.imposto - 0.4, c.manut - 0.4, c.saca - 0.5, c.olha - 0.4, c.parte - 0.3];
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
    { de: T[4] + 0.1, ate: c.cento - 0.35, titulo: "IMPOSTO E SEGURO · POR HECTARE", valor: "o estudo mostra, sim" },
    { de: c.cento - 0.2, ate: c.duzentosSess - 0.35, titulo: "EUA · IMPOSTO + SEGURO", valor: "≈ R$ 170/ha", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.duzentosSess - 0.2, ate: T[5] - 0.2, titulo: "MATO GROSSO · IMPOSTO + SEGURO", valor: "≈ R$ 260/ha", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T[5] + 0.1, ate: c.seiscentos - 0.35, titulo: "MANUTENÇÃO DE MÁQUINA (REPAROS)", valor: "por hectare" },
    { de: c.seiscentos - 0.2, ate: c.trinta - 0.35, titulo: "EUA · REPAROS", valor: "≈ R$ 620/ha", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.trinta - 0.2, ate: T[6] - 0.2, titulo: "MATO GROSSO · REPAROS", valor: "≈ R$ 30/ha", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T[6] + 0.1, ate: T[7] - 0.2, titulo: "PREÇO DA SACA E VANTAGEM DO GOVERNO", valor: "o estudo não conta o governo" },
    { de: T[7] + 0.1, ate: c.ganha - 0.5, titulo: "DEPOIS DE TODOS OS CUSTOS · SEM GOVERNO", valor: "MT na frente 9 anos (2017–25)", cor: "#2a9a5a", tinta: "#ffffff" },
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
              <Lavoura p={[0, 0, 0]} cols={2} total={8} n={8 * ease.out(p(t, 0.1, 1.4))} soja={0.9} seed={3} />
            </group>
            <Bandeira p={[-0.5, 0.45, 0.6]} pais="US" s={0.5 * mola(0.8, 220, 12)} t={t} />
            <group position={[0.35, 0, 0]} scale={1.5}>
              <Lavoura p={[0, 0, 0]} cols={3} total={18} n={18 * ease.out(p(t, 0.5, 1.6))} soja={0.9} seed={9} />
            </group>
            <Bandeira p={[0.35, 0.45, 0.6]} pais="BR" s={0.5 * mola(1.2, 220, 12)} t={t} />
            {t >= c.colheita - 0.1 ? (
              <group position={[0, 0, 0.3]}>
                <B s={[0.2, 1.2 * 0.22 * ease.out(p(t, c.colheita - 0.1, 1.2)), 0.2]} p={[-0.45, 0.11 * ease.out(p(t, c.colheita - 0.1, 1.2)), 0]} cor="#e0b030" />
                <B s={[0.2, 2.7 * 0.22 * ease.out(p(t, c.duzentas - 0.1, 1.4)), 0.2]} p={[0.35, 0.11 * 2.7 * ease.out(p(t, c.duzentas - 0.1, 1.4)), 0]} cor="#e0b030" />
              </group>
            ) : null}
          </group>,
        )}

        {/* 1: comentários — pergunta com "?" */}
        {W(
          1,
          <group>
            <Boneco url="personagens/character-male-a" p={[0, 0, 0.3]} altura={0.62} anim="idle" tAnim={t} s={mola(T[1], 220, 12)} />
            {[-0.27, 0.27].map((x, i) => (
              <group key={x} position={[x, 0.75 + 0.05 * Math.sin(t * 2 + i), 0.3]} scale={mola(c.impostos - 0.1 + i * 0.5, 220, 12)}>
                <PlanoTexto linhas={[[i ? "CUSTO?" : "IMPOSTO?", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.42, 0.13]} px={[420, 130]} />
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
            <PlanoTexto linhas={[["R$ 10.200", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.11]} p={[-0.28, 0.3, 0.5]} px={[500, 110]} />
            <PlanoTexto linhas={[["R$ 7.900", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.5, 0.11]} p={[0.33, 0.24, 0.5]} px={[500, 110]} />
            <Bandeira p={[-0.33, 0.45, 0]} pais="US" s={0.4 * mola(T[3] + 0.1, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.36, 0]} pais="BR" s={0.4 * mola(c.mato - 0.1, 220, 12)} t={t} />
          </group>,
        )}

        {/* 4: imposto + seguro por hectare */}
        {W(
          4,
          <group>
            <Maco p={[-0.33, 0, 0]} n={17 * ease.out(p(t, T[4] + 0.2, 1.0))} s={0.8} h={0.012} cor="#5fae5a" />
            <Maco p={[0.33, 0, 0]} n={26 * ease.out(p(t, T[4] + 0.5, 1.0))} s={0.8} h={0.012} cor="#5fae5a" />
            <Bandeira p={[-0.33, 0.42, 0]} pais="US" s={0.4 * mola(c.cento - 0.1, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.5, 0]} pais="BR" s={0.4 * mola(T[4] + 0.6, 220, 12)} t={t} />
          </group>,
        )}

        {/* 5: manutenção de máquina: pilha EUA alta × quase nada no MT */}
        {W(
          5,
          <group>
            <Maco p={[-0.33, 0, 0]} n={62 * ease.out(p(t, c.seiscentos - 0.2, 1.2))} s={0.8} h={0.008} cor="#5fae5a" />
            <Maco p={[0.33, 0, 0]} n={2.8 * ease.out(p(t, c.trinta - 0.2, 0.6))} s={0.8} h={0.008} cor="#5fae5a" />
            <Modelo url="carros/tractor" p={[0.14, 0.2, 0.6]} alvo={{ comp: 0.5 }} s={mola(T[5], 220, 12)} />
            <Bandeira p={[-0.33, 0.42, 0]} pais="US" s={0.4 * mola(c.seiscentos - 0.1, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.16, 0]} pais="BR" s={0.4 * mola(c.trinta - 0.1, 220, 12)} t={t} />
          </group>,
        )}

        {/* 6: saca e governo — fora do estudo */}
        {W(
          6,
          <group>
            <B s={[0.3, 0.42, 0.2]} p={[-0.3, 0.21, 0]} cor="#d9b46a" />
            <PlanoTexto linhas={[["SACA", 1, "#3a2a10"]]} fundo="#f2e2b0" tam={[0.26, 0.09]} p={[-0.3, 0.22, 0.11]} px={[300, 100]} />
            <Modelo url="comercial/building-a" p={[0.3, 0, 0]} alvo={{ altura: 0.7 }} s={mola(c.vantagem - 0.2, 220, 12)} />
            <PlanoTexto linhas={[["GOVERNO", 1, "#ffffff"]]} fundo="#2f5aa8" tam={[0.44, 0.1]} p={[0.3, 0.85, 0.3]} px={[400, 100]} />
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
            <PlanoTexto linhas={[["EUA", 1, "#ffffff"]]} fundo="#2a4fb8" tam={[0.3, 0.09]} p={[-0.3, 0.7, 0.3]} px={[300, 90]} />
            <PlanoTexto linhas={[["MATO GROSSO", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.55, 0.09]} p={[0.25, 0.7, 0.3]} px={[550, 90]} />
            <PlanoTexto linhas={[["ILUSTRATIVO · 2017–2025", 1, "#ffffff"]]} fundo="#1b3a2a" tam={[1.0, 0.1]} p={[0, 0.86, 0.3]} px={[900, 90]} />
          </group>,
        )}

        {/* 8: parte 3 */}
        {W(
          8,
          <group>
            <group scale={mola(T[8], 200, 12)}>
              <PlanoTexto linhas={[["PARTE 3", 1, "#ffffff"]]} fundo="#10331f" tam={[0.9, 0.2]} p={[0, 0.8, 0.3]} px={[720, 160]} />
            </group>
            <Boneco url="personagens/character-male-a" p={[0, 0.2, 0.5]} altura={0.55} anim="idle" tAnim={t} s={mola(T[8] + 0.1, 220, 12)} />
          </group>,
        )}
      </PalcoCor>

      {t >= c.hectare - 0.3 && t < T[6] - 0.1 ? (
        <div style={{ position: "absolute", top: 1480, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: "#fff", background: "rgba(14,18,24,0.75)", padding: "8px 26px", borderRadius: 999 }}>USDA · MÉDIA 2023–25 · US$ 1 = R$ 5,93</div>
        </div>
      ) : null}

      {cards.map((k, i) => {
        const prox = cards[i + 1];
        const ate = prox ? Math.min(k.ate, prox.de - 0.32) : k.ate;
        return <CardNumero key={i} t={t} de={k.de} ate={ate} top={250} titulo={k.titulo} valor={k.valor} cor={k.cor} tinta={k.tinta} />;
      })}
      
      <PalavraGrande destaque={DESTAQUE} />
      {T.slice(1).map((x) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
