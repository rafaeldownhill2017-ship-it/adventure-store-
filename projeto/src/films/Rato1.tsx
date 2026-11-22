import React from "react";
import { AbsoluteFill } from "remotion";
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
const DESTAQUE = /inteligência|agulha|cérebro|rato|recusou|Exin|Claude|Anthropic|robô|camundongo|epilepsia|dezenove|Opus|Sonnet|topou|veterinário|parou|calibração|botão|recuperou|crises|artigo|operar|Comenta/i;

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

export const Rato1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.exin - 0.6; // "Quem conta é a Exin"
  const T2 = c.camundongo - 0.5; // "Deu um camundongo"
  const T3 = c.opus55 - 1.4; // "O Opus 5.5 recusou"
  const T4 = c.veterinario - 0.6; // "Um veterinário abriu"
  const T5 = c.meio - 0.5; // "No meio, ela parou"
  const T6 = c.recuperou - 0.7; // "O rato se recuperou"
  const T7 = c.operar - 1.6; // "Então me fala"

  const blocos: [number, V3, V3, V3][] = [
    [0, H0, [H0[0] + 0.28, 1.1, 4.5], [H0[0] + 0.28, 0.6, 0]],
    [T1, LB, [LB[0], 1.4, 5.7], [LB[0], 0.6, 0]],
    [T2, LI, [LI[0], 1.1, 3.8], [LI[0], 0.6, 0]],
    [T3, MO, [MO[0], 1.2, 6.6], [MO[0], 0.5, 0]],
    [T4, AG, [AG[0] + 0.28, 1.0, 4.2], [AG[0] + 0.28, 0.6, 0]],
    [T5, PA, [PA[0], 1.2, 5.2], [PA[0], 0.6, 0]],
    [T6, RE, [RE[0], 1.0, 4.2], [RE[0], 0.55, 0]],
    [T7, VC, [VC[0], 1.4, 5.8], [VC[0], 0.6, 0]],
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
      [T2, "#0f2a2a"],
      [T3, "#2a2f44"],
      [T4, "#14213a"],
      [T5, "#4a1a1e"],
      [T6, "#1f4a3a"],
      [T7, "#2a2f44"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };
  const terapias = Array.from({ length: 7 }, (_, i) => [`TERAPIA ${String(i + 1).padStart(2, "0")}  ▢`, 1, i === 4 && t >= c.dezenove + 0.8 ? "#3aff7a" : "#9fb3c8"] as [string, number, string]);

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.2}>
        {/* GANCHO: agulha descendo até a cabeça do rato */}
        {em(0) ? (
          <group position={H0}>
            <Pedestal p={[0.68, 0, 0]} raio={0.32} aro="#5ad1ff" />
            <Rato p={[0.66, TOPO_PEDESTAL, 0]} rotY={-0.4} s={0.95 * mola(0.0, 220, 12)} t={t} dorme={1} />
            <BracoRobo p={[-0.15, 0, -0.05]} s={1.0} desce={p(t, 0.4, 3.2)} t={t} />
          </group>
        ) : null}

        {/* LABORATÓRIO: robô de cirurgia + câmeras + monitor "CLAUDE (IA)" */}
        {em(1) ? (
          <group position={LB}>
            <B s={[1.6, 0.06, 0.7]} p={[0, 0.45, 0]} cor="#c9ced6" />
            {[-0.7, 0.7].map((x) => (
              <B key={x} s={[0.06, 0.45, 0.06]} p={[x, 0.22, 0.3]} cor="#8a929e" />
            ))}
            <BracoRobo p={[-0.55, 0.48, -0.1]} s={0.7} desce={0.2} t={t} />
            <Rato p={[0.1, 0.48, 0.05]} rotY={-0.3} s={0.7} t={t} dorme={1} />
            <Monitor p={[0.62, 0.48, -0.15]} s={0.6} rotY={-0.3} linhas={[["CLAUDE (IA)", 1.2, "#5ad1ff"], ["agente conectado", 0.8, "#9fb3c8"], ["câmeras ✓  robô ✓", 0.8, "#3aff7a"]]} />
            {[-0.35, 0.35].map((x) => (
              <group key={x} position={[x, 1.25, -0.25]} rotation={[0.6, 0, 0]}>
                <B s={[0.12, 0.08, 0.14]} cor="#1d2230" />
                <mesh position={[0, 0, 0.075]}>
                  <circleGeometry args={[0.03, 12]} />
                  <meshStandardMaterial color="#ff3b30" emissive="#ff3b30" emissiveIntensity={1.2 + Math.sin(t * 6) * 0.6} toneMapped={false} />
                </mesh>
              </group>
            ))}
          </group>
        ) : null}

        {/* LISTA: 19 terapias */}
        {em(2) ? (
          <group position={LI}>
            <Monitor p={[0, 0, -0.2]} s={1.1} linhas={[["19 TERAPIAS GENÉTICAS", 1.3, "#ffcf3a"], ...terapias, ["… +12", 1, "#9fb3c8"]]} />
            <Pedestal p={[0.62, 0, 0.35]} raio={0.22} aro="#5ad1ff" s={0.8} />
            <Rato p={[0.62, TOPO_PEDESTAL * 0.8, 0.35]} rotY={-0.6} s={0.6} t={t} />
          </group>
        ) : null}

        {/* TRÊS MODELOS: recusou / só teste / topou */}
        {em(3) ? (
          <group position={MO}>
            <RoboIA p={[-0.62, 0, 0]} nome="OPUS 5.5" placa="RECUSOU" corPlaca="#c8262c" kPlaca={p(t, c.opus55 - 0.4, 0.5)} t={t} olho="#ff8a7a" />
            <RoboIA p={[0, 0, 0]} nome="OPUS 5" placa="SÓ TESTE" corPlaca="#d9a21e" kPlaca={p(t, c.seco - 0.4, 0.5)} t={t + 1} olho="#ffd86a" />
            <RoboIA p={[0.62, 0, 0]} nome="SONNET 5" placa="TOPOU" corPlaca="#2a9a5a" kPlaca={p(t, c.sonnet - 0.2, 0.5)} t={t + 2} olho="#7affb0" />
          </group>
        ) : null}

        {/* AGULHA: mira no cérebro */}
        {em(4) ? (
          <group position={AG}>
            <Pedestal p={[0.68, 0, 0]} raio={0.3} aro="#5ad1ff" />
            <Rato p={[0.66, TOPO_PEDESTAL, 0]} rotY={-0.4} s={0.95} t={t} dorme={1} />
            <BracoRobo p={[-0.15, 0, -0.05]} s={1.0} desce={p(t, c.agulha2 - 1.2, 1.4)} t={t} />
            {/* mira */}
            <group position={[0.84, TOPO_PEDESTAL + 0.27, 0.02]} rotation={[0, 0, t * 1.5]} scale={0.6 + 0.1 * Math.sin(t * 5)}>
              <mesh>
                <ringGeometry args={[0.07, 0.08, 32]} />
                <meshStandardMaterial color="#3aff7a" emissive="#3aff7a" emissiveIntensity={1.4} toneMapped={false} side={2} />
              </mesh>
              {[0, 1, 2, 3].map((i) => (
                <B key={i} s={[0.05, 0.006, 0.002]} p={[Math.cos((i * Math.PI) / 2) * 0.11, Math.sin((i * Math.PI) / 2) * 0.11, 0]} r={[0, 0, (i * Math.PI) / 2]} cor="#3aff7a" />
              ))}
            </group>
          </group>
        ) : null}

        {/* PARADA: calibração não bate + humano no botão */}
        {em(5) ? (
          <group position={PA}>
            <BracoRobo p={[-0.55, 0, -0.1]} s={0.85} desce={0.55} t={t} alerta />
            <Monitor p={[0.3, 0, -0.7]} s={0.7} fundo="#4a0f12" linhas={[["⚠ PAROU", 1.3, "#ff6a5a"], ["calibração ≠", 1, "#ffffff"], ["faixa do aparelho", 0.9, "#ffd0c8"]]} />
            {t >= c.botao - 0.4 ? (
              <group position={[0.45, 0, 0.3]} scale={mola(c.botao - 0.4, 220, 12)}>
                <Boneco url="personagens/character-female-d" p={[0, 0, 0]} rotY={-0.5} altura={0.6} anim="idle" tAnim={t} />
                <group position={[-0.18, 0.42, 0.12]}>
                  <B s={[0.12, 0.08, 0.12]} cor="#1d2230" />
                  <mesh position={[0, 0.06, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.04, 20]} />
                    <meshStandardMaterial color="#ff2a1a" emissive="#ff2a1a" emissiveIntensity={0.8 + 0.6 * Math.sin(t * 8)} toneMapped={false} />
                  </mesh>
                </group>
              </group>
            ) : null}
          </group>
        ) : null}

        {/* RESULTADO: rato bem; sem artigo publicado */}
        {em(6) ? (
          <group position={RE}>
            <Pedestal raio={0.4} aro="#3aff7a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.5 - 0.4, 0]}>
              <Rato p={[0, TOPO_PEDESTAL, 0]} s={1.3 * mola(T6 + 0.1, 220, 12)} t={t} />
            </group>
            {t >= c.crises - 0.3 ? (
              <group position={[0.42, 0.95, 0]} scale={mola(c.crises - 0.3, 220, 12)}>
                <PlanoTexto linhas={[["?", 1, "#ffcf3a"]]} fundo={null} tam={[0.3, 0.4]} px={[200, 260]} />
              </group>
            ) : null}
          </group>
        ) : null}

        {/* VOCÊ DEIXARIA? */}
        {em(7) ? (
          <group position={VC}>
            <B s={[1.1, 0.06, 0.45]} p={[0.15, 0.45, 0]} cor="#e8ebef" />
            {[-0.35, 0.65].map((x) => (
              <B key={x} s={[0.06, 0.45, 0.06]} p={[x, 0.22, 0]} cor="#8a929e" />
            ))}
            <Boneco url="personagens/character-male-a" p={[0.15, 0.48, 0]} rotY={Math.PI / 2} altura={0.55} anim="idle" tAnim={t} />
            <BracoRobo p={[-0.75, 0, -0.15]} s={0.9} desce={0.3 + 0.1 * Math.sin(t * 2)} t={t} />
            <group position={[0.72, 0, -0.5]}>
              <B s={[0.04, 1.2, 0.04]} p={[0, 0.6, 0]} cor="#2a2f3a" />
              <group position={[-0.2, 1.08, 0]}>
                <PlanoTexto linhas={[["SIM", 1, "#ffffff"]]} fundo="#2a9a5a" tam={[0.4, 0.16]} px={[300, 120]} />
              </group>
              <group position={[0.2, 0.86, 0]}>
                <PlanoTexto linhas={[["NÃO", 1, "#ffffff"]]} fundo="#c8262c" tam={[0.4, 0.16]} px={[300, 120]} />
              </group>
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.recusou - 0.6} titulo="UMA IA GUIOU UMA AGULHA" valor="no cérebro de um rato" cor={C.destaque} />
      <CardNumero t={t} de={c.recusou - 0.4} ate={T1 - 0.4} titulo="E A VERSÃO MAIS FORTE" valor="se recusou" />
      <CardNumero t={t} de={T1 + 0.1} ate={c.claude - 0.4} titulo="SEGUNDO A EXIN (STARTUP, EUA)" valor="relato da empresa" />
      <CardNumero t={t} de={c.claude - 0.2} ate={c.robo - 0.4} titulo="A IA" valor="Claude, da Anthropic" />
      <CardNumero t={t} de={c.robo - 0.2} ate={T2 - 0.4} titulo="LIGADA A" valor="um robô de cirurgia" />
      <CardNumero t={t} de={T2 + 0.1} ate={c.dezenove - 0.4} titulo="O PACIENTE" valor="camundongo com epilepsia" />
      <CardNumero t={t} de={c.dezenove - 0.2} ate={T3 - 0.4} titulo="NA LISTA" valor="19 terapias genéticas" cor={C.destaque} />
      <Carimbo t={t} de={c.opus55 - 0.3} ate={c.seco - 0.7} txt="OPUS 5.5: RECUSOU" />
      <CardNumero t={t} de={c.seco - 0.5} ate={c.sonnet - 0.4} titulo="OPUS 5" valor="só teste a seco" />
      <CardNumero t={t} de={c.sonnet - 0.2} ate={T4 - 0.4} titulo="QUEM TOPOU" valor="Sonnet 5" cor={C.destaque} />
      <CardNumero t={t} de={T4 + 0.1} ate={c.agulha2 - 1.0} titulo="UM VETERINÁRIO" valor="abriu o crânio" />
      <CardNumero t={t} de={c.agulha2 - 0.8} ate={T5 - 0.4} titulo="A IA ESCOLHEU E" valor="guiou a agulha" cor={C.destaque} />
      <Carimbo t={t} de={c.meio + 0.2} ate={c.botao - 0.6} txt="PAROU SOZINHA" />
      <CardNumero t={t} de={c.botao - 0.4} ate={T6 - 0.4} titulo="UM HUMANO NO" valor="botão de emergência" />
      <CardNumero t={t} de={T6 + 0.1} ate={c.crises - 0.4} titulo="O RATO" valor="se recuperou" cor={C.destaque} />
      <CardNumero t={t} de={c.crises - 0.2} ate={c.artigo - 0.4} titulo="AS CRISES DIMINUÍRAM?" valor="ainda não se sabe" />
      <Carimbo t={t} de={c.artigo - 0.1} ate={T7 - 0.4} txt="SEM ARTIGO PUBLICADO" />
      <CardNumero t={t} de={T7 + 0.1} ate={99} titulo="E VOCÊ?" valor="deixaria uma IA te operar?" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
