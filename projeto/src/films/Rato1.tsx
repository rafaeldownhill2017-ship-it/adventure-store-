import React from "react";
import { useTexture } from "@react-three/drei";
import { AbsoluteFill, staticFile } from "remotion";
import * as THREE from "three";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, PalcoCor, Pedestal, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · rato1 · "A IA que guiou uma agulha no cérebro de um rato (e a versão mais forte recusou)".
// RELATO DA EMPRESA (Exin), sem artigo publicado. Sem sangue, sem logo da Anthropic/Exin, rato em blocos.
// Fotos reais (licença livre, Wikimedia) entram depois em `FOTOS` quando o download funcionar / o dono mandar.
precarregar(["personagens/character-male-a", "personagens/character-female-d"]);

const H0: V3 = [0, 0, 0];
const LB: V3 = [25, 0, 0];
const LI: V3 = [50, 0, 0];
const MO: V3 = [75, 0, 0];
const AG: V3 = [100, 0, 0];
const PA: V3 = [125, 0, 0];
const RE: V3 = [150, 0, 0];
const VC: V3 = [175, 0, 0];
const DESTAQUE = /inteligência|agulha|cérebro|rato|cobra|Dois|dólares|doze|Exin|Claude|Arduino|hobby|Opus|forte|recusou|Sonnet|dezenove|conta|hora|quarenta|veterinário|custou|artigo|substitui|ajuda|Comenta/i;

/** Ratinho em blocos (fofo). Comprimento ~0.45 com s=1, frente +x. */
const Rato: React.FC<{ p: V3; rotY?: number; s?: number; t?: number; dorme?: number }> = ({ p: pos, rotY = 0, s = 1, t = 0, dorme = 0 }) => {
  if (s <= 0.002) return null;
  const resp = 1 + Math.sin(t * 4) * 0.02;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <group scale={[1, resp, 1]}>
        <B s={[0.3, 0.16, 0.18]} p={[0, 0.1, 0]} cor="#f2f0ec" />
        <B s={[0.14, 0.12, 0.13]} p={[0.2, 0.12, 0]} cor="#f2f0ec" />
      </group>
      <B s={[0.04, 0.03, 0.03]} p={[0.285, 0.12, 0]} cor="#f2a0b0" />
      {[-1, 1].map((i) => (
        <group key={i}>
          <mesh position={[0.18, 0.21, i * 0.06]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.045, 16]} />
            <meshStandardMaterial color="#f2a0b0" side={2} />
          </mesh>
          <B s={[0.012, dorme > 0.5 ? 0.004 : 0.02, 0.02]} p={[0.27, 0.15, i * 0.035]} cor="#1d1d1d" />
          <B s={[0.04, 0.04, 0.04]} p={[0.08, 0.02, i * 0.07]} cor="#f2a0b0" />
          <B s={[0.04, 0.04, 0.04]} p={[-0.1, 0.02, i * 0.07]} cor="#f2a0b0" />
        </group>
      ))}
      <B s={[0.22, 0.015, 0.015]} p={[-0.25, 0.08, 0]} r={[0, Math.sin(t * 2) * 0.3, -0.3]} cor="#f2a0b0" />
    </group>
  );
};

/** Braço robótico com agulha. `desce` 0..1 leva a ponta até o alvo; `para` treme e trava. */
const BracoRobo: React.FC<{ p: V3; s?: number; desce: number; t: number; alerta?: boolean }> = ({ p: pos, s = 1, desce, t, alerta = false }) => {
  const k = ease.inOut(clamp01(desce));
  const treme = alerta ? Math.sin(t * 50) * 0.004 : 0;
  return (
    <group position={pos} scale={s}>
      <B s={[0.36, 0.08, 0.36]} p={[0, 0.04, 0]} cor="#2a2f3a" />
      <B s={[0.1, 0.9, 0.1]} p={[0, 0.5, 0]} cor="#d9dde3" />
      <B s={[0.16, 0.16, 0.16]} p={[0, 0.95, 0]} cor="#3a78b8" />
      <B s={[0.7, 0.08, 0.08]} p={[0.35, 0.95, 0]} cor="#d9dde3" />
      <group position={[0.68 + treme, 0.95 - k * 0.32, 0]}>
        <B s={[0.12, 0.14, 0.12]} p={[0, -0.02, 0]} cor="#3a78b8" />
        <B s={[0.03, 0.18, 0.03]} p={[0, -0.18, 0]} cor="#c9ced6" />
        <mesh position={[0, -0.31, 0]}>
          <coneGeometry args={[0.012, 0.08, 8]} />
          <meshStandardMaterial color="#e3e6ea" metalness={0.7} roughness={0.2} />
        </mesh>
        <mesh position={[0.07, 0.06, 0]}>
          <sphereGeometry args={[0.02, 8, 6]} />
          <meshStandardMaterial color={alerta ? "#ff3b30" : "#3aff7a"} emissive={alerta ? "#ff3b30" : "#3aff7a"} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/** Monitor de laboratório com linhas de texto. */
const Monitor: React.FC<{ p: V3; s?: number; linhas: [string, number, string][]; fundo?: string; rotY?: number }> = ({ p: pos, s = 1, linhas, fundo = "#0f1a2a", rotY = 0 }) => (
  <group position={pos} scale={s} rotation={[0, rotY, 0]}>
    <B s={[0.06, 0.4, 0.06]} p={[0, 0.2, 0]} cor="#2a2f3a" />
    <B s={[0.9, 0.6, 0.05]} p={[0, 0.7, 0]} cor="#1d2230" />
    <PlanoTexto linhas={linhas} fundo={fundo} tam={[0.82, 0.52]} p={[0, 0.7, 0.027]} px={[700, 440]} />
  </group>
);

/** Cabeça de robô-IA genérica com placa embaixo (sem logo). */
const RoboIA: React.FC<{ p: V3; s?: number; nome: string; placa?: string; corPlaca?: string; kPlaca: number; t: number; olho?: string }> = ({ p: pos, s = 1, nome, placa, corPlaca = "#c8262c", kPlaca, t, olho = "#5ad1ff" }) => (
  <group position={pos} scale={s}>
    <Pedestal raio={0.3} aro={corPlaca} acende={kPlaca} />
    <group position={[0, TOPO_PEDESTAL, 0]}>
      <B s={[0.36, 0.32, 0.3]} p={[0, 0.2, 0]} cor="#e8ebef" />
      <B s={[0.3, 0.14, 0.02]} p={[0, 0.24, 0.155]} cor="#1d2230" />
      {[-0.07, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.24 + Math.sin(t * 2 + x * 10) * 0.004, 0.167]}>
          <circleGeometry args={[0.025, 12]} />
          <meshStandardMaterial color={olho} emissive={olho} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      <B s={[0.02, 0.1, 0.02]} p={[0, 0.41, 0]} cor="#8a929e" />
      <mesh position={[0, 0.47, 0]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial color={olho} emissive={olho} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <PlanoTexto linhas={[[nome, 1, "#ffffff"]]} fundo="#1d2230" tam={[0.5, 0.11]} p={[0, -0.21, 0.31]} px={[460, 100]} />
      {placa && kPlaca > 0.02 ? (
        <group position={[0, 0.72, 0]} scale={ease.back(clamp01(kPlaca))}>
          <PlanoTexto linhas={[[placa, 1, "#ffffff"]]} fundo={corPlaca} tam={[0.56, 0.16]} px={[480, 136]} />
        </group>
      ) : null}
    </group>
  </group>
);

/** Foto real (licença livre) numa moldura branca tipo polaroide, com legenda curta. Largura ~0.9 com s=1. */
const Foto: React.FC<{ p: V3; rot?: V3; s?: number; img: string; asp: number; legenda?: string }> = ({ p: pos, rot = [0, 0, 0], s = 1, img, asp, legenda }) => {
  const tex = useTexture(staticFile(img));
  tex.colorSpace = THREE.SRGBColorSpace;
  if (s <= 0.002) return null;
  const w = 0.8;
  const h = w / asp;
  return (
    <group position={pos} rotation={rot} scale={s}>
      <B s={[w + 0.08, h + (legenda ? 0.2 : 0.08), 0.02]} p={[0, legenda ? -0.06 : 0, -0.012]} cor="#fbfaf6" />
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {legenda ? <PlanoTexto linhas={[[legenda, 1, "#1d2230"]]} fundo={null} tam={[w, 0.09]} p={[0, -h / 2 - 0.07, 0.002]} px={[700, 80]} /> : null}
    </group>
  );
};

export const Rato1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.exin - 1.0; // "Quem conta é a Exin"
  const T2 = c.opus55 - 0.3; // "O Opus 5.5"
  const T3 = c.sonnet - 0.9; // "Quem topou foi o Sonnet 5"
  const T4 = c.conta - 0.4; // "Mas a conta não é tão simples"
  const T5 = c.custou - 0.4; // "Quanto custou tudo?"
  const T6 = c.substitui - 1.6; // "Então me fala"

  const blocos: [number, V3, V3, V3][] = [
    [0, H0, [H0[0] + 0.3, 1.1, 4.5], [H0[0] + 0.3, 0.62, 0]],
    [T1, LB, [LB[0], 1.1, 4.2], [LB[0], 0.75, 0]],
    [T2, MO, [MO[0], 1.15, 5.0], [MO[0], 0.55, 0]],
    [T3, AG, [AG[0], 1.05, 4.6], [AG[0], 0.7, 0]],
    [T4, PA, [PA[0], 1.2, 5.2], [PA[0], 0.62, 0]],
    [T5, RE, [RE[0], 1.1, 4.6], [RE[0], 0.6, 0]],
    [T6, VC, [VC[0], 1.3, 5.9], [VC[0], 0.68, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#14213a"],
      [T1, "#1d3c5a"],
      [T2, "#2a2f44"],
      [T3, "#14213a"],
      [T4, "#4a1a1e"],
      [T5, "#3a3a4a"],
      [T6, "#1f4a3a"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.2}>
        {/* GANCHO: agulha descendo + monitor com o preço por token */}
        {em(0) ? (
          <group position={H0}>
            <Pedestal p={[0.68, 0, 0.1]} raio={0.32} aro="#5ad1ff" />
            <Rato p={[0.66, TOPO_PEDESTAL, 0.1]} rotY={-0.4} s={0.95 * mola(0.0, 220, 12)} t={t} dorme={1} />
            <BracoRobo p={[-0.15, 0, -0.05]} s={1.0} desce={p(t, 0.4, 3.2)} t={t} />
          </group>
        ) : null}

        {/* LABORATÓRIO: foto real (camundongo) + robô "feito com Arduino" (foto do aparelho antigo) */}
        {em(1) ? (
          <group position={LB}>
            <Foto p={[-0.32, 0.92, -0.3]} rot={[0, 0.2, -0.05]} s={0.78 * mola(T1 + 0.1, 220, 12)} img="fotos/rato/luva.jpg" asp={1.5} legenda="camundongo de laboratório (foto ilustrativa)" />
            {t >= c.arduino - 0.5 ? (
              <Foto p={[0.38, 0.85, -0.15]} rot={[0, -0.2, 0.05]} s={0.62 * mola(c.arduino - 0.5, 220, 12)} img="fotos/rato/estereotaxico.jpg" asp={650 / 771} legenda="aparelho de cirurgia cerebral (antigo)" />
            ) : null}
            {t >= c.arduino - 0.2 ? (
              <group position={[0.0, 0.22, 0.45]} rotation={[0.5, 0, 0]} scale={1.1 * mola(c.arduino - 0.2, 220, 12)}>
                <B s={[0.5, 0.03, 0.34]} cor="#1f7a8c" />
                {[-0.15, 0, 0.15].map((x) => (
                  <B key={x} s={[0.08, 0.04, 0.06]} p={[x, 0.035, 0.05]} cor="#1d1d1d" />
                ))}
                <B s={[0.12, 0.05, 0.08]} p={[-0.17, 0.04, -0.1]} cor="#c9ced6" />
                <PlanoTexto linhas={[["ARDUINO", 1, "#ffffff"]]} fundo={null} tam={[0.3, 0.06]} p={[0.05, 0.02, -0.1]} r={[-Math.PI / 2, 0, 0]} px={[300, 60]} />
              </group>
            ) : null}
            <Rato p={[-0.28, 0, 0.55]} rotY={0.5} s={0.75} t={t} />
          </group>
        ) : null}

        {/* MODELOS: Opus 5.5 recusou */}
        {em(2) ? (
          <group position={MO}>
            <RoboIA p={[-0.38, 0, 0]} nome="OPUS 5.5" placa="RECUSOU" corPlaca="#c8262c" kPlaca={p(t, c.recusou - 0.3, 0.5)} t={t} olho="#ff8a7a" />
            <RoboIA p={[0.38, 0, 0]} nome="SONNET 5" placa="?" corPlaca="#4a4f5c" kPlaca={0.0} t={t + 2} olho="#7affb0" />
          </group>
        ) : null}

        {/* SONNET 5 TOPOU: lista de 19 → agulha com o cérebro (ilustração NIH) */}
        {em(3) ? (
          <group position={AG}>
            <Foto p={[0.0, 1.05, -0.35]} s={0.95 * mola(c.dezenove - 0.6, 220, 12)} img="fotos/rato/cerebro.jpg" asp={1000 / 600} legenda="cérebro de camundongo (ilustração NIH)" />
            {/* mira sobre a foto do cérebro */}
            {t >= c.agulha2 - 0.8 ? (
              <group position={[0.02, 1.08, -0.3]} rotation={[0, 0, t * 1.5]} scale={0.9 + 0.1 * Math.sin(t * 5)}>
                <mesh>
                  <ringGeometry args={[0.07, 0.085, 32]} />
                  <meshStandardMaterial color="#3aff7a" emissive="#3aff7a" emissiveIntensity={1.4} toneMapped={false} side={2} />
                </mesh>
                {[0, 1, 2, 3].map((i) => (
                  <B key={i} s={[0.05, 0.008, 0.002]} p={[Math.cos((i * Math.PI) / 2) * 0.12, Math.sin((i * Math.PI) / 2) * 0.12, 0]} r={[0, 0, (i * Math.PI) / 2]} cor="#3aff7a" />
                ))}
              </group>
            ) : null}
            <BracoRobo p={[-0.55, 0, 0.35]} s={0.75} desce={p(t, c.agulha2 - 1.0, 1.0)} t={t} />
            <Rato p={[0.0, 0, 0.45]} rotY={-0.4} s={0.75} t={t} dorme={1} />
          </group>
        ) : null}

        {/* A CONTA: relógio 1h+ × 45 min + veterinário liberando */}
        {em(4) ? (
          <group position={PA}>
            {(
              [
                ["IA: 1h+", -0.45, "#c8262c", 1.0],
                ["NORMAL: ~45 min", 0.45, "#2a9a5a", 0.75],
              ] as const
            ).map(([txt, x, corR, frac], i) => (
              <group key={txt} position={[x, 0, -0.2]} scale={mola(T4 + 0.1 + i * 0.25, 220, 12)}>
                <B s={[0.04, 0.6, 0.04]} p={[0, 0.3, 0]} cor="#2a2f3a" />
                <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.24, 0.24, 0.05, 32]} />
                  <meshStandardMaterial color="#2a2f3a" />
                </mesh>
                <mesh position={[0, 0.85, 0.027]}>
                  <circleGeometry args={[0.215, 32]} />
                  <meshStandardMaterial color="#f6f3ec" />
                </mesh>
                <mesh position={[0, 0.85, 0.03]}>
                  <ringGeometry args={[0.0, 0.2, 32, 1, Math.PI / 2 - Math.PI * 2 * frac * clamp01((t - T4 - 0.3) / 1.5), Math.PI * 2 * frac * clamp01((t - T4 - 0.3) / 1.5)]} />
                  <meshStandardMaterial color={corR} transparent opacity={0.7} />
                </mesh>
                <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo={corR} tam={[0.55, 0.12]} p={[0, 0.5, 0.05]} px={[460, 100]} />
              </group>
            ))}
            {t >= c.veterinario - 0.4 ? (
              <group position={[0.0, 0, 0.45]} scale={mola(c.veterinario - 0.4, 220, 12)}>
                <Boneco url="personagens/character-female-d" p={[0, 0, 0]} rotY={0} altura={0.55} anim="idle" tAnim={t} />
                <PlanoTexto linhas={[["✓ LIBERA CADA PASSO", 1, "#14211d"]]} fundo="#ffcf3a" tam={[0.6, 0.11]} p={[0, 0.7, 0.05]} px={[520, 96]} />
              </group>
            ) : null}
          </group>
        ) : null}

        {/* QUANTO CUSTOU? não divulgado; foto real das gaiolas */}
        {em(5) ? (
          <group position={RE}>
            <Foto p={[0, 0.9, -0.3]} rot={[0, 0, -0.04]} s={0.85 * mola(T5 + 0.1, 220, 12)} img="fotos/rato/gaiolas.jpg" asp={1} legenda="biotério (foto ilustrativa)" />
            <group position={[0.3, 0.28, 0.35]} scale={mola(T5 + 0.3, 220, 12)}>
              <PlanoTexto linhas={[["R$ ???", 1, "#c8262c"]]} fundo="#fff6d8" tam={[0.5, 0.18]} px={[420, 150]} />
            </group>
          </group>
        ) : null}

        {/* SUBSTITUI OU SÓ AJUDA? */}
        {em(6) ? (
          <group position={VC}>
            <BracoRobo p={[-0.7, 0, -0.15]} s={0.85} desce={0.3 + 0.1 * Math.sin(t * 2)} t={t} />
            <Boneco url="personagens/character-male-a" p={[0.0, 0, 0.1]} rotY={-0.3} altura={0.6} anim="idle" tAnim={t} />
            <group position={[0.3, 0, -0.5]}>
              <B s={[0.04, 1.2, 0.04]} p={[0, 0.6, 0]} cor="#2a2f3a" />
              <group position={[-0.3, 1.08, 0.03]}>
                <PlanoTexto linhas={[["SUBSTITUI", 1, "#ffffff"]]} fundo={t >= c.substitui && t < c.substitui + 1.1 ? "#c8262c" : "#7a2a2e"} tam={[0.52, 0.15]} px={[400, 116]} />
              </group>
              <group position={[0.3, 0.86, 0.03]}>
                <PlanoTexto linhas={[["SÓ AJUDA", 1, "#ffffff"]]} fundo={t >= c.substitui + 1.3 ? "#2a9a5a" : "#1f5a3a"} tam={[0.52, 0.15]} px={[400, 116]} />
              </group>
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.cobra - 0.5} titulo="UMA IA GUIOU UMA AGULHA" valor="no cérebro de um rato" cor={C.destaque} />
      <CardNumero t={t} de={c.cobra - 0.3} ate={c.dois - 0.3} titulo="E QUANTO ELA COBRA?" valor="💰" />
      <CardNumero t={t} de={c.dois - 0.1} ate={c.doze - 0.35} titulo="SONNET 5 · TABELA DA ANTHROPIC" valor="US$ 2 / 1 mi tokens" cor={C.destaque} />
      <CardNumero t={t} de={c.doze - 0.15} ate={T1 - 0.4} titulo="NO CÂMBIO DA SEMANA" valor="≈ R$ 12" cor={C.destaque} />
      <CardNumero t={t} de={T1 + 0.1} ate={c.claude - 0.4} titulo="SEGUNDO A EXIN (STARTUP, EUA)" valor="relato da empresa" />
      <CardNumero t={t} de={c.claude - 0.2} ate={c.arduino - 0.4} titulo="LIGOU O CLAUDE A" valor="um robô de cirurgia" />
      <CardNumero t={t} de={c.arduino - 0.2} ate={T2 - 0.4} titulo="FEITO COM" valor="Arduino (peça de hobby)" />
      <CardNumero t={t} de={T2 + 0.1} ate={c.recusou - 0.3} titulo="A VERSÃO MAIS FORTE" valor="Opus 5.5" />
      <Carimbo t={t} de={c.recusou - 0.1} ate={T3 - 0.4} txt="RECUSOU" />
      <CardNumero t={t} de={T3 + 0.1} ate={c.dezenove - 0.4} titulo="QUEM TOPOU" valor="Sonnet 5" cor={C.destaque} />
      <CardNumero t={t} de={c.dezenove - 0.2} ate={T4 - 0.4} titulo="ESCOLHEU ENTRE 19 TERAPIAS" valor="e guiou a agulha" />
      <CardNumero t={t} de={T4 + 0.1} ate={c.quarenta - 0.4} titulo="MAS A CONTA..." valor="mais de 1 hora" cor="#ff5a4e" tinta="#ffffff" />
      <CardNumero t={t} de={c.quarenta - 0.2} ate={c.veterinario - 0.4} titulo="O NORMAL" valor="~45 minutos" />
      <CardNumero t={t} de={c.veterinario - 0.2} ate={T5 - 0.4} titulo="UM VETERINÁRIO" valor="liberou cada passo" />
      <CardNumero t={t} de={T5 + 0.1} ate={c.artigo - 0.4} titulo="QUANTO CUSTOU TUDO?" valor="não divulgado" />
      <Carimbo t={t} de={c.artigo - 0.1} ate={T6 - 0.4} txt="SEM ARTIGO PUBLICADO" />
      <CardNumero t={t} de={T6 + 0.1} ate={99} titulo="COMENTA" valor="substitui ou só ajuda?" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
