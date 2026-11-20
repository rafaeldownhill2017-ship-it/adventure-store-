import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, Modelo, precarregar } from "../lib/kenney";
import {
  Balanca,
  Carimbo,
  CardNumero,
  Cofre,
  Cofrinho,
  corBloco,
  NotasVoando,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  Placa,
  PlanoTexto,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · masterstf · "Caso Master: o capítulo do Supremo" (avulso). Dados: docs/dossies/master-stf.md.
// Regras da cena: nenhum rosto/caricatura de ministro (só cadeiras e pastas); conversas do celular aparecem
// TARJADAS (o teor é sigiloso: não inventamos mensagem); "suspeita" sempre atribuída ao UOL.
precarregar(["moveis/chairDesk", "moveis/trashcan", "personagens/character-male-a", "personagens/character-male-b", "personagens/character-female-d", "personagens/character-male-f"]);

const H: V3 = [0, 0, 0];
const CE: V3 = [25, 0, 0];
const PS: V3 = [50, 0, 0];
const PG: V3 = [75, 0, 0];
const BA: V3 = [100, 0, 0];
const FG: V3 = [125, 0, 0];
const FI: V3 = [150, 0, 0];
const DESTAQUE = /UOL|Moraes|voto|rejeitou|dois|delegados|refazer|celular|Vorcaro|ministros|dez|Seis|Quatro|PGR|Toffoli|Nunes|Marques|André|Mendonça|arquiva|investigação|inquérito|crime|acusado|Oitocentos|FGC|Manda|segue/i;

const MANILA = "#e9c27b";

/** Pasta de relatório em pé (capa manila, aba, etiqueta com texto). Largura ~0.5 com s=1. */
const Pasta: React.FC<{ p?: V3; rotY?: number; rot?: V3; s?: number; linhas: [string, number, string][]; cor?: string; carimbo?: number; apaga?: number }> = ({
  p: pos = [0, 0, 0],
  rotY = 0,
  rot,
  s = 1,
  linhas,
  cor = MANILA,
  carimbo = 0,
  apaga = 0,
}) => {
  if (s <= 0.002) return null;
  const c = apaga > 0 ? mistura(cor, "#8a8f98", apaga) : cor;
  return (
    <group position={pos} rotation={rot ?? [0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.64, 0.03]} p={[0, 0.32, -0.03]} cor={escurecer(c, 0.85)} />
      <B s={[0.46, 0.6, 0.04]} p={[0, 0.32, 0]} cor="#f6f3ec" />
      <B s={[0.18, 0.06, 0.03]} p={[-0.12, 0.67, -0.03]} cor={escurecer(c, 0.85)} />
      <B s={[0.5, 0.62, 0.025]} p={[0, 0.31, 0.03]} cor={c} />
      <PlanoTexto linhas={linhas} fundo="#ffffff" tam={[0.4, 0.26]} p={[0, 0.4, 0.044]} px={[620, 400]} />
      {carimbo > 0 ? (
        <group position={[0, 0.2, 0.05]} rotation={[0, 0, 0.18]} scale={lerp(2.2, 1, ease.in(clamp01(carimbo)))}>
          <PlanoTexto linhas={[["REJEITADO", 1, "#d8262c"]]} fundo={null} tam={[0.46, 0.13]} px={[700, 200]} />
          <B s={[0.47, 0.012, 0.004]} p={[0, 0.07, 0]} cor="#d8262c" />
          <B s={[0.47, 0.012, 0.004]} p={[0, -0.07, 0]} cor="#d8262c" />
        </group>
      ) : null}
    </group>
  );
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (v: number[]) => "#" + v.map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("");
const escurecer = (c: string, f: number) => toHex(hex(c).map((x) => x * f));
const mistura = (a: string, b: string, k: number) => {
  const A = hex(a);
  const Bv = hex(b);
  return toHex(A.map((x, i) => lerp(x, Bv[i], clamp01(k))));
};

/** Cadeira de espaldar alto (plenário), com aro de luz no chão quando `acesa`. */
const CadeiraPlenario: React.FC<{ p: V3; rotY?: number; s?: number; acesa?: number }> = ({ p: pos, rotY = 0, s = 1, acesa = 0 }) => {
  if (s <= 0.002) return null;
  const couro = mistura("#3a2a2c", "#7a1f2b", acesa);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.42, 0.08, 0.4]} p={[0, 0.34, 0]} cor={couro} />
      <B s={[0.42, 0.62, 0.08]} p={[0, 0.68, -0.17]} cor={couro} />
      <B s={[0.44, 0.04, 0.1]} p={[0, 1.0, -0.17]} cor="#c9a24a" />
      {[-1, 1].map((i) => (
        <B key={i} s={[0.05, 0.3, 0.05]} p={[i * 0.17, 0.15, 0.12]} cor="#2a2422" />
      ))}
      <B s={[0.05, 0.3, 0.05]} p={[0, 0.15, -0.12]} cor="#2a2422" />
      {acesa > 0.01 ? (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.38, 40]} />
          <meshStandardMaterial color="#ffcf3a" emissive="#ffcf3a" emissiveIntensity={1.8 * acesa} toneMapped={false} transparent opacity={acesa} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Celular grande com conversas TARJADAS (barras pretas: o teor é sigiloso). */
const CelularTarjado: React.FC<{ p: V3; rotY?: number; s?: number; k?: number }> = ({ p: pos, rotY = 0, s = 1, k = 1 }) => {
  if (s <= 0.002) return null;
  const bolhas = [
    [0.06, 0.32],
    [-0.06, 0.26],
    [0.06, 0.3],
    [-0.06, 0.22],
    [0.06, 0.28],
  ];
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.95, 0.05]} p={[0, 0.48, 0]} cor="#16191e" rough={0.3} />
      <B s={[0.44, 0.86, 0.004]} p={[0, 0.48, 0.026]} cor="#ece5dc" />
      <B s={[0.44, 0.1, 0.006]} p={[0, 0.86, 0.028]} cor="#2a3b4f" />
      <PlanoTexto linhas={[["CONVERSAS", 1, "#ffffff"]]} fundo={null} tam={[0.3, 0.07]} p={[0, 0.86, 0.033]} px={[420, 100]} />
      {bolhas.map(([x, w], i) => {
        const ki = ease.back(clamp01(k * bolhas.length - i));
        if (ki <= 0.01) return null;
        const meu = x > 0;
        return (
          <group key={i} position={[x * 1.2, 0.74 - i * 0.135, 0.032]} scale={ki}>
            <B s={[w, 0.1, 0.006]} cor={meu ? "#d9fdd3" : "#ffffff"} />
            {i % 2 === 0 ? (
              <PlanoTexto linhas={[["STF", 1, "#1d2f5c"]]} fundo={null} tam={[w - 0.04, 0.085]} p={[0, 0, 0.005]} px={[400, 120]} />
            ) : (
              <B s={[w - 0.06, 0.035, 0.004]} p={[0, 0, 0.005]} cor="#111317" />
            )}
          </group>
        );
      })}
    </group>
  );
};

/** Prédio da PGR: escadaria, colunas, frontão, 3 portas com rótulo que acendem. */
const PredioPGR: React.FC<{ p: V3; s?: number; luz: [number, number, number] }> = ({ p: pos, s = 1, luz }) => {
  const portas: [string, number][] = [
    ["ARQUIVAR", -0.78],
    ["INVESTIGAR", 0],
    ["INQUÉRITO", 0.78],
  ];
  return (
    <group position={pos} scale={s}>
      <B s={[2.6, 0.08, 1.2]} p={[0, 0.04, 0.1]} cor="#d9d4c7" />
      <B s={[2.45, 0.08, 1.05]} p={[0, 0.12, 0.05]} cor="#e4dfd2" />
      <B s={[2.3, 1.25, 0.7]} p={[0, 0.78, -0.2]} cor="#efebe1" />
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-1.05 + i * 0.3, 0.78, 0.2]} castShadow>
          <cylinderGeometry args={[0.055, 0.065, 1.25, 16]} />
          <meshStandardMaterial color="#f6f3ea" roughness={0.6} />
        </mesh>
      ))}
      <B s={[2.45, 0.12, 0.85]} p={[0, 1.46, -0.12]} cor="#e4dfd2" />
      <B s={[2.1, 0.12, 0.7]} p={[0, 1.58, -0.15]} cor="#e9e4d8" />
      <B s={[1.4, 0.14, 0.6]} p={[0, 1.71, -0.15]} cor="#efebe1" />
      <PlanoTexto linhas={[["PGR", 1, "#1d2f5c"]]} fundo={null} tam={[0.5, 0.18]} p={[0, 1.72, 0.17]} px={[400, 144]} />
      {portas.map(([txt, x], i) => {
        const k = clamp01(luz[i]);
        return (
          <group key={txt} position={[x, 0, 0.16]}>
            <mesh position={[0, 0.55, 0]}>
              <planeGeometry args={[0.36, 0.62]} />
              <meshStandardMaterial color={mistura("#3a3f4a", "#ffcf3a", k)} emissive="#ffcf3a" emissiveIntensity={1.4 * k} toneMapped={k < 0.05} />
            </mesh>
            <PlanoTexto linhas={[[txt, 1, k > 0.5 ? "#14211d" : "#ffffff"]]} fundo={k > 0.5 ? "#ffcf3a" : "#1d2f5c"} tam={[0.62, 0.15]} p={[0, 1.02, 0.42]} px={[560, 136]} />
          </group>
        );
      })}
    </group>
  );
};

export const MasterStf: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c, palavras } = useTimeline();
  const T1 = 13.78 - 0.35 + (c.celular - 14.113); // "No celular de Daniel Vorcaro"
  const T2 = c.dez - 0.85; // "Foram dez relatórios"
  const T3 = c.pgr - 0.85; // "Agora a PGR decide"
  const T4 = c.comentou - 1.05; // "Moraes não comentou"
  const T5 = c.conta - 0.6; // "E a conta do Master?"
  const T6 = c.manda - 0.3; // "Manda pra quem..."
  const T7 = (palavras.find((x) => x.w === "segue")?.start ?? c.fim - 1.6) - 0.25; // "e segue pra ver o que a PGR decide"
  const w = (x: string, d: number) => palavras.find((q) => q.w.startsWith(x) && q.start > 23)?.start ?? c.nomes + d;
  const nome = (i: number) => [c.nomes, w("Toffoli", 0.8), w("Nunes", 1.4), w("André", 2.4)][i];

  const blocos: [number, V3, V3, V3][] = [
    [0, H, [H[0], 1.15, 3.0], [H[0], 0.82, 0]],
    [3.2, H, [H[0], 1.6, 5.0], [H[0], 0.72, 0]],
    [T1, CE, [CE[0], 1.8, 7.0], [CE[0], 0.38, -0.4]],
    [T2, PS, [PS[0], 1.8, 7.6], [PS[0], 0.25, 0]],
    [T3, PG, [PG[0], 1.3, 6.6], [PG[0], 0.6, 0]],
    [T4, BA, [BA[0], 1.4, 6.6], [BA[0], 0.62, 0]],
    [T5, FG, [FG[0], 1.6, 7.2], [FG[0], 0.45, 0]],
    [T6, FI, [FI[0], 1.5, 4.4], [FI[0], 0.6, 0]],
    [T7, PG, [PG[0], 1.3, 6.2], [PG[0], 0.6, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    if (i === 0) return; // close do gancho: vai direto para a pose aberta
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#3a1f2a"],
      [T1, "#1d2a44"],
      [T2, "#4a3a2a"],
      [T3, "#2a4466"],
      [T4, "#3a3a4a"],
      [T5, "#1f5a46"],
      [T6, "#2f8f5b"],
      [T7, "#2a4466"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const j = i === 0 ? 0 : i + 1; // bloco 0 tem duas poses de câmera (close → aberto)
    const t0 = blocos[j][0];
    const prox = i === 0 ? 2 : j + 1;
    const t1 = prox < blocos.length ? blocos[prox][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  // gancho: carimbo, cadeiras da chefia saindo, pasta indo pro lixo
  const kCarimbo = t < 3.0 ? p(t, 0.25, 0.2, (x) => x) * (1 - p(t, 2.6, 0.3)) : p(t, c.rejeitou, 0.2, (x) => x);
  const kSaiChefia = p(t, c.delegados, 0.9);
  const kLixo = p(t, c.refazer - 0.1, 0.55, ease.inOut);

  // pastas: 6 saem (não seguiram), 4 sobem
  const kSeis = p(t, c.seis, 0.8, ease.inOut);
  const kQuatro = p(t, c.quatro, 0.8, ease.inOut);

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.4}>
        {/* GANCHO: 1ª versão do relatório (segundo o UOL) → rejeitada → 2 da chefia saem → refazer */}
        {em(0) ? (
          <group position={H}>
            <B s={[1.9, 0.06, 0.9]} p={[0, 0.5, 0]} cor="#5a3b2a" />
            {[-0.85, 0.85].map((x) => (
              <B key={x} s={[0.07, 0.5, 0.07]} p={[x, 0.25, 0.3]} cor="#3a281e" />
            ))}
            {[-0.85, 0.85].map((x) => (
              <B key={`b${x}`} s={[0.07, 0.5, 0.07]} p={[x, 0.25, -0.3]} cor="#3a281e" />
            ))}
            {/* cadeiras da chefia (os 2 delegados) atrás da mesa, saem pelas laterais */}
            {[-1, 1].map((lado) => (
              <group key={lado} position={[lado * lerp(0.62, 2.6, kSaiChefia), 0, -0.85]}>
                <Modelo url="moveis/chairDesk" p={[0, 0, 0]} rotY={lado * kSaiChefia * 1.2} alvo={{ altura: 0.75 }} tinta="#4a4f5c" />
              </group>
            ))}
            <Placa p={[0, 1.45, -0.95]} txt="CHEFIA DA INVESTIGAÇÃO" cor="#1d2f5c" k={p(t, 3.3, 0.6, (x) => x) * (1 - p(t, c.delegados - 0.5, 0.3))} larg={1.15} s={0.9} />
            {/* pasta da 1ª versão: carimbo, depois voa pro lixo */}
            <Pasta
              p={[lerp(-0.05, 0.95, kLixo), 0.53 + Math.sin(kLixo * Math.PI) * 0.55 - kLixo * 0.35, lerp(0.05, 0.45, kLixo)]}
              rot={[-0.12 - kLixo * 1.4, -kLixo * 0.8, kLixo * 0.6]}
              s={1.05 * mola(0.0, 220, 12) * (1 - p(t, c.refazer + 0.4, 0.2, (x) => x) * 0.999)}
              linhas={[["RELATÓRIO PF", 1, "#1d2f5c"], ["1ª VERSÃO", 0.8, "#c8322a"], ["SOBRE MORAES", 1, "#1d2230"]]}
              carimbo={kCarimbo}
            />
            <Modelo url="moveis/trashcan" p={[1.0, 0, 0.55]} alvo={{ altura: 0.42 }} />
            {/* versão 2 nasce em branco */}
            {t >= c.refazer + 0.3 ? (
              <Pasta p={[-0.05, 0.53, 0.05]} rotY={0} rot={[-0.12, 0, 0]} s={1.05 * mola(c.refazer + 0.3, 220, 12)} linhas={[["RELATÓRIO PF", 1, "#1d2f5c"], ["NOVA VERSÃO", 0.8, "#2a7f4f"], ["EM BRANCO", 1, "#8a8f98"]]} />
            ) : null}
          </group>
        ) : null}

        {/* CELULAR + PLENÁRIO: ministros citados nas conversas */}
        {em(1) ? (
          <group position={CE}>
            {Array.from({ length: 10 }, (_, i) => {
              const ang = -1.25 + (i / 9) * 2.5;
              const r = 1.4;
              return (
                <CadeiraPlenario
                  key={i}
                  p={[Math.sin(ang) * r * 0.62, 0, -0.7 - Math.cos(ang) * r * 0.6]}
                  rotY={-ang * 0.8}
                  s={0.62 * mola(T1 + 0.1 + i * 0.05, 240, 12)}
                  acesa={p(t, c.ministros + i * 0.09, 0.3)}
                />
              );
            })}
            <CelularTarjado p={[0, 0, 0.9]} s={0.95 * mola(T1 + 0.05, 220, 12)} k={p(t, c.celular + 0.2, 1.8, (x) => x)} />
          </group>
        ) : null}

        {/* 10 RELATÓRIOS: 6 não seguiram, 4 foram pra PGR */}
        {em(2) ? (
          <group position={PS}>
            <Pedestal p={[0, 0, -0.75]} raio={1.0} aro="#ffcf3a" acende={kQuatro} />
            {Array.from({ length: 10 }, (_, i) => {
              const segue = i >= 3 && i <= 6; // as 4 do meio seguem
              const j = segue ? i - 3 : i < 3 ? i : i - 4; // índice no grupo
              const x0 = -0.9 + i * 0.2;
              const nasce = c.dez + i * 0.06;
              if (segue) {
                const x1 = -0.66 + j * 0.44;
                const ki = clamp01(t >= nome(j) ? 1 : 0);
                const nomes = ["MORAES", "TOFFOLI", "NUNES MARQUES", "MENDONÇA"];
                return (
                  <Pasta
                    key={i}
                    p={[lerp(x0, x1, kQuatro), lerp(0, TOPO_PEDESTAL, kQuatro) + Math.sin(kQuatro * Math.PI) * 0.4, lerp(0.7, -0.55, kQuatro)]}
                    rotY={0}
                    s={0.42 * mola(nasce, 240, 12) * lerp(1, 1.65, kQuatro)}
                    linhas={ki ? [["RELATÓRIO", 0.8, "#1d2f5c"], [nomes[j], 1.1, "#1d2230"], ["→ PGR", 0.8, "#c8322a"]] : kQuatro > 0.3 ? [["RELATÓRIO", 0.8, "#1d2f5c"], ["→ PGR", 1.1, "#c8322a"]] : [["RELATÓRIO", 0.8, "#1d2f5c"], ["PF", 1.1, "#1d2230"]]}
                  />
                );
              }
              const lado = i < 3 ? -1 : 1;
              return (
                <Pasta
                  key={i}
                  p={[x0 + lado * kSeis * 0.25, 0, lerp(0.7, 1.0, kSeis)]}
                  rot={[-kSeis * 1.5, 0, 0]}
                  s={0.42 * mola(nasce, 240, 12) * (1 - p(t, c.seis + 0.15, 0.35) * 0.999)}
                  apaga={kSeis}
                  linhas={[["RELATÓRIO", 0.8, "#1d2f5c"], ["PF", 1.1, "#1d2230"]]}
                />
              );
            })}
          </group>
        ) : null}

        {/* PGR decide: 3 portas */}
        {em(3) || em(7) ? (
          <group position={PG}>
            <PredioPGR p={[0, 0, -0.5]} s={0.76} luz={em(7) ? [0.5 + 0.5 * Math.sin(t * 6), 0.5 + 0.5 * Math.sin(t * 6 + 2.1), 0.5 + 0.5 * Math.sin(t * 6 + 4.2)] : [p(t, c.arquiva - 0.1, 0.3), p(t, c.investigacao - 0.2, 0.3), p(t, c.inquerito - 0.1, 0.3)]} />
            {em(7) ? <Pasta p={[0, 0, 0.55]} s={0.6 * mola(T7 + 0.1, 240, 12)} linhas={[["RELATÓRIO", 0.8, "#1d2f5c"], ["→ PGR", 1.1, "#c8322a"]]} /> : null}
          </group>
        ) : null}

        {/* SEM COMENTÁRIOS · citado não é crime: balança em equilíbrio */}
        {em(4) ? (
          <group position={BA}>
            <Balanca
              p={[0, 0, -0.1]}
              s={0.72 * mola(T4 + 0.1, 220, 12)}
              incl={Math.sin((t - T4) * 3) * Math.max(0, 1 - (t - T4) * 0.35) * 0.9}
              esq={<Pasta p={[0, 0, 0]} s={0.66} linhas={[["CITADO", 1, "#1d2230"]]} />}
              dir={<Pasta p={[0, 0, 0]} s={0.66} linhas={[["ACUSADOS", 0.8, "#1d2230"], ["0", 1.3, "#c8322a"]]} cor="#cfd3da" />}
            />
            <Placa p={[0, 1.55, -0.3]} txt="SEM COMENTÁRIOS" cor="#1d1d1d" k={p(t, c.comentou - 0.1, 0.6, (x) => x) * (1 - p(t, c.citado - 0.2, 0.35))} larg={0.95} s={0.9} />
          </group>
        ) : null}

        {/* A CONTA: fila de credores → cofre do FGC abre */}
        {em(5) ? (
          <group position={FG}>
            {Array.from({ length: 6 }, (_, i) => {
              const urls = ["personagens/character-male-a", "personagens/character-female-d", "personagens/character-male-b", "personagens/character-male-f"];
              const t0 = c.oitocentos - 0.2 + i * 0.12;
              const s = mola(t0, 240, 12);
              return s > 0.01 ? (
                <Boneco key={i} url={urls[i % 4]} p={[-0.15 - i * 0.13, 0, 0.3 + i * 0.12]} rotY={1.2} altura={0.55} anim="idle" tAnim={t + i * 0.3} s={s} />
              ) : null;
            })}
            <Cofre p={[0.42, 0, -0.2]} rotY={-0.45} s={0.8 * mola(T5 + 0.15, 220, 12)} abre={p(t, c.fgc - 0.2, 0.8)} />
            <NotasVoando de={[0.32, 0.5, -0.3]} k={p(t, c.fgc + 0.2, 2.6, (x) => x)} alcance={1.4} n={14} />
            <Placa p={[0.35, 1.35, -0.3]} txt="FGC" cor="#1d6b4a" k={p(t, c.fgc - 0.1, 0.6, (x) => x)} larg={0.5} />
          </group>
        ) : null}

        {/* FECHO: cofrinho = o seu dinheiro no banco */}
        {em(6) ? (
          <group position={FI}>
            <Pedestal raio={0.75} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.3, 0]}>
              <Cofrinho p={[-0.12, TOPO_PEDESTAL, 0]} s={0.85 * mola(T6 + 0.1, 220, 11)} />
              <PilhaMoedas p={[0.42, TOPO_PEDESTAL, 0.12]} k={p(t, T6 + 0.3, 1.2)} max={10} s={0.9} />
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.moraes - 0.45} titulo="SEGUNDO O UOL" valor="relatório da PF" />
      <CardNumero t={t} de={c.moraes - 0.25} ate={c.rejeitou - 1.4} titulo="SEGUNDO O UOL · 1ª VERSÃO" valor="voto antecipado?" cor={C.destaque} />
      <Carimbo t={t} de={c.rejeitou - 0.05} ate={c.delegados - 0.55} txt="REJEITADO PELA PF" />
      <CardNumero t={t} de={c.delegados - 0.25} ate={c.refazer - 0.35} titulo="TIRADOS DA CHEFIA" valor="2 delegados" />
      <CardNumero t={t} de={c.refazer - 0.15} ate={T1 - 0.4} titulo="A DIREÇÃO DA PF MANDOU" valor="refazer" cor={C.destaque} />
      <CardNumero t={t} de={T1 + 0.1} ate={T2 - 0.35} titulo="CELULAR DE VORCARO" valor="ministros citados" />
      <CardNumero t={t} de={c.dez - 0.15} ate={c.seis - 0.3} titulo="A PF FEZ" valor="10 relatórios" />
      <CardNumero t={t} de={c.seis - 0.1} ate={c.quatro - 0.3} titulo="NÃO SEGUIRAM" valor="6" />
      <CardNumero t={t} de={c.quatro - 0.1} ate={T3 - 0.4} titulo="FORAM PRA PGR" valor="4" cor={C.destaque} />
      <CardNumero t={t} de={T3 + 0.1} ate={T4 - 0.4} titulo="AGORA A PGR DECIDE" valor="3 caminhos" />
      <CardNumero t={t} de={T4 + 0.1} ate={c.citado - 0.45} titulo="MORAES E A DEFESA DE VORCARO" valor="não comentaram" />
      <CardNumero t={t} de={c.citado - 0.25} ate={c.acusado - 0.5} titulo="SER CITADO" valor="não é crime" cor={C.destaque} />
      <CardNumero t={t} de={c.acusado - 0.3} ate={T5 - 0.4} titulo="SER CITADO ≠ CRIME" valor="nenhuma acusação" />
      <CardNumero t={t} de={T5 + 0.1} ate={c.oitocentos - 0.35} titulo="E A CONTA" valor="do Master?" />
      <CardNumero t={t} de={c.oitocentos - 0.15} ate={c.fgc - 0.45} titulo="CREDORES DO MASTER" valor="800 mil" />
      <CardNumero t={t} de={c.fgc - 0.25} ate={T6 - 0.4} titulo="BANCADO PELOS BANCOS" valor="o FGC cobriu" cor={C.destaque} />
      <CardNumero t={t} de={T6 + 0.1} ate={T7 - 0.3} titulo="MANDA PRA QUEM TEM" valor="dinheiro no banco 🏦" cor={C.destaque} />
      <CardNumero t={t} de={T7 + 0.1} ate={99} titulo="SEGUE PRA VER" valor="o que a PGR decide" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
