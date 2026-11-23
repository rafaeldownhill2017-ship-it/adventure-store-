import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, PlanoTexto } from "../lib/objetos";
import { ease, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";
import { Maco } from "./Libertadores1";
import { Bandeira } from "./Picape1";

// PESO NO BOLSO · fazenda3 · "Fazenda parte 3: saca, governo e quem sobra" (resposta aos comentários dos vídeos 1 e 2).
// Dados: docs/dossies/fazenda3.md (USDA ERS EIB-310 tabelas 3 e 4; Cepea via Brasil 61, 17/11; USDA FBA, 31/12/2025; Plano Safra 2026/27).
// Contas nossas: retorno = preço × produtividade − custo total (−US$ 70,40 e +US$ 54,11 por acre) × 2,471 × R$ 5,93.
precarregar(["personagens/character-male-a", "comercial/building-a"]);

const S: V3[] = [0, 30, 60, 90, 120, 150, 180].map((x) => [x, 0, 0] as V3);
const DESTAQUE = /anteriores|custo|dez|mil|sete|saca|governo|Paranaguá|cento|média|perde|oitocentos|único|trinta|quatrocentos|Plano|quinhentos|bilhões|crédito|empréstimo|pagamento|ganha|períodos|Comenta|vídeos|Link|bio/i;

export const Fazenda3: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();

  const T = [0, c.paranagua - 0.4, c.conta - 0.4, c.governo - 0.3, c.plano - 0.4, c.ganha - 0.5, c.comenta - 0.3];
  const fim = c.fim + 3;
  const cam = (i: number, y: number, z: number, ly: number): [V3, V3] => [[S[i][0], y, z], [S[i][0], ly, 0]];
  const poses: [V3, V3][] = [cam(0, 1.2, 3.1, 0.4), cam(1, 1.2, 3.1, 0.38), cam(2, 1.2, 3.1, 0.35), cam(3, 1.2, 3.1, 0.38), cam(4, 1.3, 3.2, 0.4), cam(5, 1.1, 3.1, 0.42), cam(6, 1.1, 3.2, 0.45)];
  const K: Key[] = [];
  T.forEach((t0, i) => {
    const t1 = i < T.length - 1 ? T[i + 1] : fim;
    const [pos, look] = poses[i];
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0] + (i % 2 ? -0.12 : 0.12), pos[1] - 0.08, pos[2] * 0.94], look, 34]);
  });
  const camPose = camPorKeys(t, K);
  const cor = corBloco(t, [[0, "#2f6a8a"], [T[1], "#6a5a2a"], [T[2], "#5a3a6a"], [T[3], "#2f4a8a"], [T[4], "#2f7a4a"], [T[5], "#3a4a7a"], [T[6], "#2f8f5b"]], 0.25);
  const em = (i: number) => t >= T[i] - 0.05 && t < (i < T.length - 1 ? T[i + 1] : 1e9);
  const W = (i: number, ch: React.ReactNode) => (em(i) ? <group position={[S[i][0], 0.08, 0]} scale={0.76}>{ch}</group> : null);

  const cards: { de: number; ate: number; titulo: string; valor: string; cor?: string; tinta?: string }[] = [
    { de: -0.6, ate: c.dez - 0.35, titulo: "NOS EPISÓDIOS ANTERIORES", valor: "custo por hectare", cor: C.destaque },
    { de: c.dez - 0.2, ate: c.sete - 0.35, titulo: "EUA (CORAÇÃO DA SOJA)", valor: "≈ R$ 10.200/ha", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.sete - 0.2, ate: c.faltava - 0.35, titulo: "MATO GROSSO", valor: "≈ R$ 7.900/ha", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.faltava - 0.2, ate: T[1] - 0.2, titulo: "FALTAVA", valor: "preço da saca e governo" },
    { de: T[1] + 0.1, ate: c.cento - 0.35, titulo: "SACA DE SOJA · 60 KG", valor: "Paranaguá", cor: C.destaque },
    { de: c.cento - 0.2, ate: T[2] - 0.2, titulo: "SACA EM PARANAGUÁ · CEPEA, 17/11", valor: "≈ R$ 167" },
    { de: T[2] + 0.1, ate: c.perde - 0.3, titulo: "ESTUDO USDA 2023–25 (PREÇO DO ESTUDO, NÃO A SACA DE HOJE)", valor: "preço × produtividade − custo" },
    { de: c.perde - 0.2, ate: c.oitocentos - 0.35, titulo: "EUA (CORAÇÃO DA SOJA) · RETORNO/ha", valor: "≈ −R$ 1.030", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: c.oitocentos - 0.2, ate: T[3] - 0.2, titulo: "MATO GROSSO · RETORNO POR HECTARE", valor: "≈ +R$ 790", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: T[3] + 0.1, ate: c.unico - 0.1, titulo: "EUA · APOIO DO GOVERNO", valor: "pagamento único (2025)", cor: C.destaque },
    { de: c.unico + 0.1, ate: c.quatrocentos - 0.35, titulo: "ANUNCIADO: SOJA", valor: "US$ 30,88 por acre" },
    { de: c.quatrocentos - 0.2, ate: T[4] - 0.2, titulo: "EQUIVALE A (CONTAS NOSSAS)", valor: "≈ R$ 450/ha", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T[4] + 0.1, ate: c.quinhentos - 0.35, titulo: "BRASIL · PLANO SAFRA 2026/27", valor: "crédito rural", cor: C.destaque },
    { de: c.quinhentos - 0.2, ate: c.emprestimo - 0.3, titulo: "CRÉDITO PARA A AGRICULTURA EMPRESARIAL", valor: "R$ 525,1 bilhões", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.emprestimo - 0.2, ate: T[5] - 0.2, titulo: "JUROS MENORES, MAS", valor: "é empréstimo", cor: "#ff5a4e", tinta: "#ffffff" },
    { de: T[5] + 0.1, ate: c.periodos - 0.35, titulo: "QUEM GANHA?", valor: "pelo estudo: Mato Grosso", cor: "#2a9a5a", tinta: "#ffffff" },
    { de: c.periodos - 0.2, ate: c.comenta - 0.35, titulo: "SEM CONTAR O GOVERNO", valor: "períodos diferentes" },
    { de: c.comenta - 0.2, ate: c.fim - 1.6, titulo: "COMENTA", valor: "quem você acha? 👇", cor: C.destaque },
    { de: c.fim - 1.5, ate: 99, titulo: "QUER FAZER VÍDEOS ASSIM?", valor: "link na bio 👆", cor: C.destaque },
  ];

  const g = (t0: number, d = 1.2) => ease.out(p(t, t0, d));

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={camPose} cor={cor} luz={2.2}>
        {/* 0: recap — custo por hectare */}
        {W(
          0,
          <group>
            <Maco p={[-0.33, 0, 0]} n={51 * g(0.2, 1.4)} s={0.8} h={0.008} cor="#5fae5a" />
            <Maco p={[0.33, 0, 0]} n={39.5 * g(0.5, 1.4)} s={0.8} h={0.008} cor="#5fae5a" />
            <PlanoTexto linhas={[["R$ 10.200", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.5, 0.11]} p={[-0.28, 0.46, 0.5]} px={[500, 110]} />
            <PlanoTexto linhas={[["R$ 7.900", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.5, 0.11]} p={[0.33, 0.38, 0.5]} px={[500, 110]} />
            <Bandeira p={[-0.33, 0.62, 0]} pais="US" s={0.4 * mola(0.8, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.56, 0]} pais="BR" s={0.4 * mola(1.2, 220, 12)} t={t} />
          </group>,
        )}

        {/* 1: saca de soja em Paranaguá */}
        {W(
          1,
          <group>
            <group scale={mola(T[1], 220, 12)}>
              <B s={[0.42, 0.6, 0.26]} p={[0, 0.3, 0]} cor="#d9b46a" />
              <B s={[0.42, 0.06, 0.26]} p={[0, 0.63, 0]} cor="#c49a50" />
              <PlanoTexto linhas={[["SOJA", 1, "#3a2a10"], ["60 KG", 0.7, "#3a2a10"]]} fundo="#f2e2b0" tam={[0.32, 0.22]} p={[0, 0.32, 0.14]} px={[320, 220]} />
            </group>
            {[-0.45, 0.45, 0.35, -0.35].map((x, i) => (
              <B key={i} s={[0.1, 0.1, 0.1]} p={[x, 0.05 + (i % 2) * 0.1, 0.15 + i * 0.05]} cor="#e0b030" />
            ))}
            <PlanoTexto linhas={[["PARANAGUÁ", 1, "#ffffff"]]} fundo="#1b3a5a" tam={[0.8, 0.12]} p={[0, 0.82, 0.2]} px={[720, 110]} />
          </group>,
        )}

        {/* 2: retorno por hectare (mesma escala dos maços de custo) */}
        {W(
          2,
          <group>
            <Maco p={[-0.33, 0, 0]} n={10.3 * g(c.perde - 0.2, 0.9)} s={0.8} h={0.008} cor="#c8262c" />
            <Maco p={[0.33, 0, 0]} n={7.9 * g(c.oitocentos - 0.2, 0.9)} s={0.8} h={0.008} cor="#5fae5a" />
            <PlanoTexto linhas={[["− R$ 1.030", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.55, 0.11]} p={[-0.3, 0.14, 0.5]} px={[550, 110]} />
            <PlanoTexto linhas={[["+ R$ 790", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.5, 0.11]} p={[0.33, 0.14, 0.5]} px={[500, 110]} />
            <PlanoTexto linhas={[["USDA", 1, "#ffffff"], ["MÉDIA 2023–25", 0.6, "#ffffff"]]} fundo="#2f2a5a" tam={[0.5, 0.26]} p={[0.28, 0.7, 0.2]} px={[480, 240]} />
            <Bandeira p={[-0.33, 0.22, 0]} pais="US" s={0.4 * mola(c.perde - 0.1, 220, 12)} t={t} />
            <Bandeira p={[0.33, 0.2, 0]} pais="BR" s={0.4 * mola(c.oitocentos - 0.1, 220, 12)} t={t} />
          </group>,
        )}

        {/* 3: pagamento único dos EUA */}
        {W(
          3,
          <group>
            <Maco p={[0, 0, 0]} n={4.5 * g(c.quatrocentos - 0.3, 0.8)} s={0.9} h={0.008} cor="#5fae5a" />
            <group scale={mola(c.unico, 220, 12)}>
              <PlanoTexto linhas={[["PAGAMENTO ÚNICO", 1, "#1b3a1b"], ["2025 · SOJA", 0.7, "#1b3a1b"]]} fundo="#f2f2e0" tam={[0.85, 0.3]} p={[0, 0.4, 0.2]} px={[760, 260]} />
            </group>
          </group>,
        )}

        {/* 4: Plano Safra (crédito) */}
        {W(
          4,
          <group>
            <Modelo url="comercial/building-a" p={[0, 0, 0]} alvo={{ altura: 0.8 }} s={mola(T[4], 220, 12)} />
            <PlanoTexto linhas={[["PLANO SAFRA", 1, "#ffffff"]]} fundo="#1f7a42" tam={[0.8, 0.13]} p={[0, 0.98, 0.3]} px={[720, 120]} />
            <Bandeira p={[0.3, 0.2, 0.5]} pais="BR" s={0.45 * mola(T[4] + 0.1, 220, 12)} t={t} />
          </group>,
        )}

        {/* 5: quem ganha? */}
        {W(
          5,
          <group>
            <Maco p={[-0.4, 0, 0]} n={10.3} s={0.7} h={0.008} cor="#c8262c" />
            <Maco p={[0.4, 0, 0]} n={7.9 * g(c.ganha, 0.8)} s={0.7} h={0.008} cor="#5fae5a" />
            <Boneco url="personagens/character-male-a" p={[0, 0.05, 0.5]} altura={0.55} anim="idle" tAnim={t} s={mola(T[5], 220, 12)} />
            <group scale={mola(c.ganha - 0.2, 220, 12)} position={[0, 0.98, 0.3]}>
              <PlanoTexto linhas={[["?", 1, "#ffffff"]]} fundo="#2f5aa8" tam={[0.3, 0.3]} px={[240, 240]} />
            </group>
          </group>,
        )}

        {/* 6: CTA */}
        {W(
          6,
          <group>
            <Boneco url="personagens/character-male-a" p={[0, 0.2, 0.5]} altura={0.55} anim="idle" tAnim={t} s={mola(T[6], 220, 12)} />
            <group scale={mola(T[6] + 0.1, 200, 12)}>
              <PlanoTexto linhas={[["QUEM GANHA?", 1, "#ffffff"]]} fundo="#10331f" tam={[0.9, 0.16]} p={[0, 0.85, 0.3]} px={[780, 140]} />
            </group>
          </group>,
        )}
      </PalcoCor>

      {t >= c.conta - 0.3 && t < T[3] - 0.1 ? (
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
