import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import React, { useLayoutEffect, useMemo } from "react";
import { spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { FONT, H, W } from "../brand";
import type { CamPose } from "./camera";
import { clamp01, ease, hash, lerp, p } from "./time";
import { B, mat } from "./ui";

// PEÇAS EM CÓDIGO REAPROVEITÁVEIS · "arte nova" (fundo de cor por bloco, objetos low-poly grandes e limpos).
// Tudo é feito com geometria simples: nada de modelo de terceiros, nada de licença a registrar.
// Escala: cada peça tem ~1 unidade de altura com s=1 (cabe num Pedestal de raio 0.7).
// Animações recebem um progresso 0..1 (ex.: `abre`, `k`) para o filme controlar pelo tempo (render determinístico).
//
// Sumário: PalcoCor · corBloco · Pedestal · Cofre · NotasVoando · Cofrinho · Calendario · Garrafa · PilhaMoedas
//          BombaCombustivel · Carregador · Mala · Fabrica · Cigarro · Laco · SacaTrigo · CardNumero · Carimbo

type V3 = [number, number, number];

/* ------------------------------------------------------------------ cores e texto */

/** Paleta das referências (cor saturada por bloco). */
export const BLOCO = {
  terra: "#c8693a",
  marinho: "#1d2f5c",
  roxo: "#5b3a8c",
  verde: "#2f8f5b",
  vermelho: "#b8322a",
  noite: "#141b2e",
  garagem: "#6b4a32",
};

/**
 * Cor de fundo por bloco: `blocos` = [[tempo, cor], ...] em ordem. Troca suave (`trans` s) a cada bloco.
 * Ex.: corBloco(t, [[0, BLOCO.marinho], [c.trigo, BLOCO.terra], [c.dolar, BLOCO.verde]])
 */
export const corBloco = (t: number, blocos: [number, string][], trans = 0.45) => {
  const c = new THREE.Color(blocos[0][1]);
  for (let i = 1; i < blocos.length; i++) {
    const k = ease.inOut(clamp01((t - blocos[i][0]) / trans));
    if (k > 0) c.lerp(new THREE.Color(blocos[i][1]), k);
  }
  return `#${c.getHexString()}`;
};

const escurece = (cor: string, k: number) => `#${new THREE.Color(cor).multiplyScalar(k).getHexString()}`;

/** Material emissivo (aro de luz, lâmpadas, brasa), com cache. */
const cacheLuz = new Map<string, THREE.MeshStandardMaterial>();
const luzMat = (cor: string, forca = 2.2) => {
  const k = `${cor}-${forca}`;
  if (!cacheLuz.has(k)) cacheLuz.set(k, new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: forca, roughness: 0.4, toneMapped: false }));
  return cacheLuz.get(k)!;
};

/** Material liso (vidro/metal pintado), sem flatShading, com cache. */
const cacheLiso = new Map<string, THREE.MeshStandardMaterial>();
const lisoMat = (cor: string, rough = 0.25, metal = 0, opac = 1) => {
  const k = `${cor}-${rough}-${metal}-${opac}`;
  if (!cacheLiso.has(k))
    cacheLiso.set(k, new THREE.MeshStandardMaterial({ color: cor, roughness: rough, metalness: metal, transparent: opac < 1, opacity: opac }));
  return cacheLiso.get(k)!;
};

/**
 * Textura com texto desenhado em canvas (usa a Manrope já carregada pelo FontGate).
 * `linhas`: [texto, tamanhoRelativo, cor][]. Fundo opcional. Cache por conteúdo.
 */
const cacheTex = new Map<string, THREE.CanvasTexture>();
export const texturaTexto = (linhas: [string, number, string][], fundo: string | null, larg = 512, alt = 512) => {
  const chave = JSON.stringify([linhas, fundo, larg, alt]);
  const achou = cacheTex.get(chave);
  if (achou) return achou;
  const cv = document.createElement("canvas");
  cv.width = larg;
  cv.height = alt;
  const g = cv.getContext("2d")!;
  if (fundo) {
    g.fillStyle = fundo;
    g.fillRect(0, 0, larg, alt);
  }
  const total = linhas.reduce((s, [, k]) => s + k, 0);
  let y = 0;
  for (const [txt, k, cor] of linhas) {
    const h = (k / total) * alt;
    let fs = h * 0.78;
    g.font = `800 ${fs}px ${FONT}`;
    const w = g.measureText(txt).width;
    if (w > larg * 0.9) fs *= (larg * 0.9) / w;
    g.font = `800 ${fs}px ${FONT}`;
    g.fillStyle = cor;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(txt, larg / 2, y + h / 2);
    y += h;
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cacheTex.set(chave, tex);
  return tex;
};

/** Plano com texto (rótulo de garrafa, placa de fábrica, folha de calendário). */
const PlanoTexto: React.FC<{ linhas: [string, number, string][]; fundo: string | null; tam: [number, number]; p?: V3; r?: V3; px?: [number, number] }> = ({
  linhas,
  fundo,
  tam,
  p: pos = [0, 0, 0],
  r = [0, 0, 0],
  px = [512, 512],
}) => {
  const tex = texturaTexto(linhas, fundo, px[0], px[1]);
  return (
    <mesh position={pos} rotation={r}>
      <planeGeometry args={tam} />
      <meshStandardMaterial map={tex} transparent={!fundo} roughness={0.8} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ palco */

const QUAL = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.QUALIDADE;
const LEVE = QUAL === "leve" || QUAL === "minima";

const CamPalco: React.FC<CamPose> = ({ pos, look, fov = 30 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    camera.position.set(...pos);
    camera.fov = fov;
    camera.lookAt(...look);
    camera.updateProjectionMatrix();
  });
  return null;
};

/**
 * Palco de COR CHAPADA (estilo das referências): fundo e piso da mesma cor, luz de estúdio suave,
 * sombra macia no piso. Troque `cor` por bloco com `corBloco`. O piso fica um tom abaixo do fundo,
 * o que dá horizonte sem "linha".
 */
export const PalcoCor: React.FC<{ cam: CamPose; cor: string; children: React.ReactNode; luz?: number; quente?: boolean }> = ({ cam, cor, children, luz = 2.4, quente = false }) => {
  const piso = escurece(cor, 0.86);
  return (
    <ThreeCanvas
      width={W}
      height={H}
      shadows
      dpr={1}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, preserveDrawingBuffer: true }}
      camera={{ fov: 30, near: 0.1, far: 120 }}
    >
      <color attach="background" args={[cor]} />
      <fog attach="fog" args={[cor, 14, 34]} />
      <CamPalco {...cam} />
      <hemisphereLight args={["#ffffff", piso, 1.3]} />
      <ambientLight intensity={0.35} />
      {/* reflexos para metal (moedas, roda do cofre) e vidro: sem isso eles ficam pretos */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, -6]} scale={[14, 5, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[-7, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color={quente ? "#ffd9a8" : "#ffffff"} />
        <Lightformer form="rect" intensity={0.8} position={[0, -3, 4]} rotation-x={-Math.PI / 2} scale={[10, 4, 1]} color={cor} />
      </Environment>
      <directionalLight
        position={[cam.look[0] + 4, 9, cam.look[2] + 6]}
        intensity={luz}
        color={quente ? "#ffd9a8" : "#fff6ea"}
        castShadow
        shadow-mapSize={LEVE ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      >
        <object3D attach="target" position={cam.look} />
      </directionalLight>
      <pointLight position={[cam.look[0] - 4, 3, cam.look[2] + 3]} intensity={quente ? 18 : 10} color={quente ? "#ffb36b" : "#ffffff"} distance={14} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[cam.look[0], -0.001, cam.look[2]]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color={piso} roughness={0.92} />
      </mesh>
      {children}
      <EffectComposer multisampling={LEVE ? 0 : 4}>
        <Bloom intensity={0.55} luminanceThreshold={0.85} mipmapBlur />
        <Vignette offset={0.32} darkness={0.38} />
      </EffectComposer>
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ pedestal */

/** Pedestal redondo com ARO DE LUZ. `acende` 0..1 liga o aro; `cor` do aro (dourado, verde, vermelho...). */
export const Pedestal: React.FC<{ p?: V3; raio?: number; alt?: number; base?: string; aro?: string; acende?: number; s?: number }> = ({
  p: pos = [0, 0, 0],
  raio = 0.7,
  alt = 0.32,
  base = "#f2efe8",
  aro = "#ffc94a",
  acende = 1,
  s = 1,
}) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, alt / 2, 0]} castShadow receiveShadow material={lisoMat(base, 0.55)}>
        <cylinderGeometry args={[raio, raio * 1.04, alt, 48]} />
      </mesh>
      <mesh position={[0, alt * 0.55, 0]} rotation={[Math.PI / 2, 0, 0]} material={acende > 0.02 ? luzMat(aro, 0.4 + 2.4 * acende) : lisoMat(escurece(aro, 0.6), 0.5)}>
        <torusGeometry args={[raio * 1.045, 0.028, 10, 64]} />
      </mesh>
      <mesh position={[0, alt + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow material={lisoMat(escurece(base, 0.93), 0.6)}>
        <circleGeometry args={[raio * 0.94, 48]} />
      </mesh>
    </group>
  );
};

/** Altura do tampo do Pedestal (para apoiar objetos em cima). */
export const TOPO_PEDESTAL = 0.325;

/* ------------------------------------------------------------------ cofre e notas */

/** Cofre de aço com porta que abre (`abre` 0..1, ~100°) e roda que gira. Opcional: notas lá dentro. */
export const Cofre: React.FC<{ p?: V3; rotY?: number; s?: number; abre?: number; cor?: string; cheio?: boolean }> = ({
  p: pos = [0, 0, 0],
  rotY = 0,
  s = 1,
  abre = 0,
  cor = "#3c4654",
  cheio = true,
}) => {
  if (s <= 0.002) return null;
  const L = 0.9;
  const A = 1.0;
  const P = 0.8;
  const ang = -ease.out(clamp01(abre)) * 1.75;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {/* corpo: fundo + laterais + topo + base (aberto na frente) */}
      <B s={[L, A, 0.08]} p={[0, A / 2, -P / 2 + 0.04]} cor={cor} />
      <B s={[0.08, A, P]} p={[-L / 2 + 0.04, A / 2, 0]} cor={cor} />
      <B s={[0.08, A, P]} p={[L / 2 - 0.04, A / 2, 0]} cor={cor} />
      <B s={[L, 0.08, P]} p={[0, A - 0.04, 0]} cor={cor} />
      <B s={[L, 0.08, P]} p={[0, 0.04, 0]} cor={cor} />
      <B s={[L - 0.16, 0.025, P - 0.12]} p={[0, A / 2, -0.02]} cor={escurece(cor, 0.7)} />
      <B s={[L - 0.16, A - 0.16, 0.02]} p={[0, A / 2, -P / 2 + 0.09]} cor="#1c2027" />
      {/* pés */}
      {[-1, 1].map((i) => (
        <B key={i} s={[0.14, 0.06, 0.14]} p={[i * (L / 2 - 0.1), -0.03, P / 2 - 0.12]} cor="#20252c" />
      ))}
      {/* maços de notas dentro */}
      {cheio &&
        [0, 1, 2].map((i) => (
          <group key={i} position={[-0.22 + i * 0.22, 0.1, -0.05]}>
            <B s={[0.18, 0.16, 0.36]} p={[0, 0.08, 0]} cor="#5fae5a" />
            <B s={[0.19, 0.03, 0.08]} p={[0, 0.13, 0]} cor="#f2efe8" />
          </group>
        ))}
      {/* porta com dobradiça à esquerda */}
      <group position={[-L / 2, 0, P / 2]} rotation={[0, ang, 0]}>
        <B s={[L, A, 0.1]} p={[L / 2, A / 2, 0.05]} cor={escurece(cor, 1.12)} />
        <B s={[L - 0.14, A - 0.14, 0.02]} p={[L / 2, A / 2, 0.11]} cor={escurece(cor, 1.25)} />
        <group position={[L / 2, A / 2, 0.13]} rotation={[0, 0, abre * 6]}>
          <mesh rotation={[0, 0, 0]} castShadow material={lisoMat("#c9ced6", 0.3, 0.8)}>
            <torusGeometry args={[0.16, 0.025, 10, 32]} />
          </mesh>
          {[0, 1, 2].map((i) => (
            <B key={i} s={[0.32, 0.03, 0.03]} r={[0, 0, (i * Math.PI) / 3]} cor="#c9ced6" />
          ))}
          <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} material={lisoMat("#e3e6ea", 0.3, 0.8)}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 20]} />
          </mesh>
        </group>
        <B s={[0.05, 0.16, 0.05]} p={[L - 0.1, A / 2, 0.13]} cor="#c9ced6" />
      </group>
    </group>
  );
};

/**
 * Notas verdes VOANDO a partir de um ponto (boca do cofre), em arcos com giro. `k` 0..1 = progresso.
 * Cada nota sai num instante diferente (determinístico).
 */
export const NotasVoando: React.FC<{ de: V3; k: number; n?: number; alcance?: number; cor?: string; s?: number }> = ({ de, k, n = 18, alcance = 2.2, cor = "#6dbb5e", s = 1 }) => {
  if (k <= 0) return null;
  return (
    <group position={de} scale={s}>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i) * 0.5;
        const u = clamp01((k - a) / (1 - a + 0.0001));
        if (u <= 0 || u >= 0.995) return null; // some ao fim do voo (não fica parada no ar)
        const dir = (hash(i + 7) - 0.5) * 2.4;
        const sobe = 0.8 + hash(i + 3) * 1.4;
        const x = Math.sin(dir) * alcance * u;
        const z = Math.cos(dir) * alcance * 0.6 * u + 0.2 * u;
        const y = sobe * Math.sin(u * Math.PI * 0.85) + 0.1;
        const gira = u * (4 + hash(i + 11) * 6);
        return (
          <group key={i} position={[x, y, z]} rotation={[gira, gira * 0.7, Math.sin(gira) * 0.6]}>
            <B s={[0.34, 0.008, 0.16]} cor={cor} />
            <B s={[0.1, 0.012, 0.1]} cor={escurece(cor, 0.75)} />
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ cofrinho */

/** Cofrinho-porquinho rosa (esferas e cilindros). `balanca` 0..1 faz um pulinho; `moeda` 0..1 mostra a moeda entrando. */
export const Cofrinho: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string; balanca?: number; moeda?: number }> = ({
  p: pos = [0, 0, 0],
  rotY = 0,
  s = 1,
  cor = "#f39bb4",
  balanca = 0,
  moeda = 0,
}) => {
  if (s <= 0.002) return null;
  const m = lisoMat(cor, 0.45);
  const md = lisoMat(escurece(cor, 0.82), 0.5);
  const pulo = Math.sin(clamp01(balanca) * Math.PI) * 0.12;
  return (
    <group position={[pos[0], pos[1] + pulo, pos[2]]} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.48, 0]} scale={[1.15, 0.92, 0.95]} castShadow receiveShadow material={m}>
        <sphereGeometry args={[0.4, 32, 24]} />
      </mesh>
      {/* focinho */}
      <mesh position={[0, 0.46, 0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow material={md}>
        <cylinderGeometry args={[0.13, 0.14, 0.12, 24]} />
      </mesh>
      {[-1, 1].map((i) => (
        <mesh key={`n${i}`} position={[i * 0.045, 0.46, 0.485]} material={lisoMat("#7a3346", 0.6)}>
          <sphereGeometry args={[0.022, 10, 8]} />
        </mesh>
      ))}
      {/* olhos */}
      {[-1, 1].map((i) => (
        <mesh key={`o${i}`} position={[i * 0.14, 0.6, 0.33]} material={lisoMat("#1b1b22", 0.2)}>
          <sphereGeometry args={[0.035, 12, 10]} />
        </mesh>
      ))}
      {/* orelhas */}
      {[-1, 1].map((i) => (
        <mesh key={`e${i}`} position={[i * 0.2, 0.82, 0.12]} rotation={[0.3, 0, i * -0.35]} castShadow material={md}>
          <coneGeometry args={[0.09, 0.16, 4]} />
        </mesh>
      ))}
      {/* pernas */}
      {[
        [-0.22, 0.2],
        [0.22, 0.2],
        [-0.22, -0.2],
        [0.22, -0.2],
      ].map(([x, z], i) => (
        <mesh key={`p${i}`} position={[x, 0.1, z]} castShadow material={md}>
          <cylinderGeometry args={[0.07, 0.075, 0.2, 14]} />
        </mesh>
      ))}
      {/* rabinho */}
      <mesh position={[0, 0.52, -0.42]} rotation={[0, Math.PI / 2, 0]} material={md}>
        <torusGeometry args={[0.05, 0.016, 8, 16, Math.PI * 1.5]} />
      </mesh>
      {/* fenda + moeda */}
      <B s={[0.2, 0.02, 0.05]} p={[0, 0.89, -0.02]} cor="#4a2230" />
      {moeda > 0 && moeda < 1 && (
        <mesh position={[0, 0.89 + 0.35 * (1 - ease.in(moeda)), -0.02]} rotation={[0, Math.PI / 2, Math.PI / 2]} castShadow material={lisoMat("#f2c14e", 0.25, 0.7)}>
          <cylinderGeometry args={[0.08, 0.08, 0.02, 24]} />
        </mesh>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ calendário */

/**
 * Calendário de mesa (placa dobrada em "A"). Folha: faixa vermelha com o MÊS, número grande e o ANO.
 * Ex.: <Calendario mes="DEZ" dia="2024" /> ou <Calendario mes="FEV" dia="2" ano="2027" />.
 * `vira` 0..1 faz a folha da frente girar (troca de data): passe `antes` com a folha anterior.
 */
export const Calendario: React.FC<{
  p?: V3;
  rotY?: number;
  s?: number;
  mes: string;
  dia: string;
  ano?: string;
  cor?: string;
  vira?: number;
  antes?: { mes: string; dia: string; ano?: string };
}> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, mes, dia, ano, cor = "#d6453a", vira = 1, antes }) => {
  if (s <= 0.002) return null;
  const LW = 0.8;
  const LH = 0.9;
  const incl = 0.28;
  const folha = (f: { mes: string; dia: string; ano?: string }) => (
    <>
      <PlanoTexto linhas={[[f.mes, 1, "#ffffff"]]} fundo={cor} tam={[LW, LH * 0.28]} p={[0, LH * 0.36, 0]} px={[512, 160]} />
      <PlanoTexto
        linhas={f.ano ? [[f.dia, 2.2, "#1d2230"], [f.ano, 0.8, "#6b7080"]] : [[f.dia, 1, "#1d2230"]]}
        fundo="#fbfaf6"
        tam={[LW, LH * 0.72]}
        p={[0, -LH * 0.14, 0]}
        px={[512, 460]}
      />
    </>
  );
  const kv = antes ? ease.inOut(clamp01(vira)) : 1;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {/* suporte traseiro */}
      <B s={[LW + 0.04, LH, 0.03]} p={[0, LH / 2 * Math.cos(incl), -LH / 2 * Math.sin(incl) - 0.02]} r={[incl, 0, 0]} cor="#2a2f3a" />
      {/* frente inclinada */}
      <group position={[0, 0, 0.04]} rotation={[-incl, 0, 0]}>
        <B s={[LW + 0.04, LH + 0.04, 0.03]} p={[0, LH / 2, -0.016]} cor="#2a2f3a" />
        <group position={[0, LH / 2, 0.002]}>{kv >= 0.5 ? folha({ mes, dia, ano }) : antes && folha(antes)}</group>
        {antes && kv > 0 && kv < 1 && (
          <group position={[0, LH, 0.006]} rotation={[-kv * Math.PI * 0.95, 0, 0]}>
            <group position={[0, -LH / 2, 0]}>{folha(kv < 0.5 ? antes : { mes, dia, ano })}</group>
          </group>
        )}
        {/* argolas */}
        {[-0.24, 0, 0.24].map((x) => (
          <mesh key={x} position={[x, LH + 0.01, 0.01]} rotation={[0, Math.PI / 2, 0]} material={lisoMat("#c9ced6", 0.3, 0.8)}>
            <torusGeometry args={[0.035, 0.009, 8, 16]} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ garrafas */

type TipoGarrafa = "cerveja" | "vodca" | "vinho" | "refri" | "agua";
const GARRAFA: Record<TipoGarrafa, { vidro: string; opac: number; perfil: [number, number][]; rotulo: string; tinta: string; tampa: string }> = {
  cerveja: { vidro: "#8a4a12", opac: 0.92, rotulo: "#f2e2b8", tinta: "#7a2a12", tampa: "#d9b23a", perfil: [[0, 0], [0.17, 0], [0.18, 0.02], [0.18, 0.5], [0.15, 0.62], [0.07, 0.78], [0.065, 0.96], [0.075, 0.98], [0.07, 1.0], [0, 1.0]] },
  vodca: { vidro: "#dfeaf2", opac: 0.55, rotulo: "#ffffff", tinta: "#1d3c7a", tampa: "#c9ced6", perfil: [[0, 0], [0.19, 0], [0.2, 0.02], [0.2, 0.62], [0.17, 0.7], [0.08, 0.78], [0.075, 0.95], [0.085, 1.0], [0, 1.0]] },
  vinho: { vidro: "#1f3b26", opac: 0.95, rotulo: "#efe6d2", tinta: "#6e1b2a", tampa: "#6e1b2a", perfil: [[0, 0], [0.17, 0], [0.175, 0.02], [0.175, 0.58], [0.14, 0.7], [0.07, 0.8], [0.065, 0.98], [0.07, 1.0], [0, 1.0]] },
  refri: { vidro: "#3a1a10", opac: 0.9, rotulo: "#d6302a", tinta: "#ffffff", tampa: "#d6302a", perfil: [[0, 0], [0.15, 0], [0.2, 0.05], [0.18, 0.25], [0.2, 0.45], [0.18, 0.6], [0.09, 0.82], [0.07, 0.94], [0.08, 0.96], [0.075, 1.0], [0, 1.0]] },
  agua: { vidro: "#bfe3f5", opac: 0.5, rotulo: "#3f8fd2", tinta: "#ffffff", tampa: "#3f8fd2", perfil: [[0, 0], [0.16, 0], [0.18, 0.04], [0.18, 0.6], [0.09, 0.82], [0.07, 0.95], [0.08, 1.0], [0, 1.0]] },
};

/** Garrafa por torno (LatheGeometry) com rótulo e tampa. Altura 1 com s=1. `texto` aparece no rótulo. */
export const Garrafa: React.FC<{ p?: V3; rotY?: number; s?: number; tipo?: TipoGarrafa; texto?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, tipo = "cerveja", texto }) => {
  const g = GARRAFA[tipo];
  const geo = useMemo(() => new THREE.LatheGeometry(g.perfil.map(([x, y]) => new THREE.Vector2(x, y)), 32), [g]);
  if (s <= 0.002) return null;
  const r = g.perfil[3][0];
  const yRot = tipo === "refri" ? 0.32 : 0.3;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh geometry={geo} castShadow receiveShadow material={lisoMat(g.vidro, 0.12, 0.1, g.opac)} />
      {/* rótulo: faixa cilíndrica + texto na frente */}
      <mesh position={[0, yRot, 0]} material={lisoMat(g.rotulo, 0.7)}>
        <cylinderGeometry args={[r + 0.004, r + 0.004, 0.22, 32, 1, true]} />
      </mesh>
      {texto && <PlanoTexto linhas={[[texto, 1, g.tinta]]} fundo={null} tam={[r * 1.5, 0.12]} p={[0, yRot, r + 0.012]} px={[384, 128]} />}
      {/* tampa */}
      <mesh position={[0, 1.01, 0]} castShadow material={lisoMat(g.tampa, 0.35, 0.5)}>
        <cylinderGeometry args={[0.078, 0.078, 0.05, 20]} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ moedas */

/** Pilha de moedas douradas que CRESCE: `k` 0..1 vai de 0 a `max` moedas (a última entra com quique). */
export const PilhaMoedas: React.FC<{ p?: V3; k: number; max?: number; s?: number; cor?: string }> = ({ p: pos = [0, 0, 0], k, max = 14, s = 1, cor = "#ffc93c" }) => {
  if (s <= 0.002 || k <= 0) return null;
  const n = k * max;
  const inteiras = Math.floor(n);
  const fr = n - inteiras;
  const E = 0.045;
  const m = lisoMat(cor, 0.38, 0.25);
  const borda = lisoMat(escurece(cor, 0.85), 0.4, 0.25);
  const moeda = (i: number, y: number) => (
    <group key={i} position={[(hash(i) - 0.5) * 0.025, y, (hash(i + 5) - 0.5) * 0.025]} rotation={[0, hash(i + 9) * 3, 0]}>
      <mesh castShadow receiveShadow material={m}>
        <cylinderGeometry args={[0.16, 0.16, E * 0.8, 28]} />
      </mesh>
      <mesh material={borda}>
        <torusGeometry args={[0.16, 0.012, 6, 28]} />
      </mesh>
    </group>
  );
  return (
    <group position={pos} scale={s}>
      {Array.from({ length: inteiras }, (_, i) => moeda(i, E / 2 + i * E))}
      {fr > 0.02 && moeda(inteiras, E / 2 + inteiras * E + (1 - ease.out(fr)) * 0.5)}
    </group>
  );
};

/* ------------------------------------------------------------------ combustível e carregador */

/** Bomba de combustível. `cor` do corpo (verde = etanol/flex, vermelho = gasolina). `rotulo` no visor de cima. */
export const BombaCombustivel: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string; rotulo?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, cor = "#d6453a", rotulo }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.08, 0.36]} p={[0, 0.04, 0]} cor="#3a3f4a" />
      <B s={[0.44, 0.9, 0.3]} p={[0, 0.53, 0]} cor={cor} rough={0.5} />
      <B s={[0.46, 0.16, 0.32]} p={[0, 1.04, 0]} cor="#f2efe8" />
      {rotulo && <PlanoTexto linhas={[[rotulo, 1, cor]]} fundo="#f2efe8" tam={[0.42, 0.13]} p={[0, 1.04, 0.162]} px={[384, 120]} />}
      {/* visor */}
      <B s={[0.3, 0.2, 0.02]} p={[0, 0.78, 0.155]} cor="#1c2430" />
      <mesh position={[0, 0.78, 0.167]} material={luzMat("#7dff9a", 0.9)}>
        <planeGeometry args={[0.24, 0.07]} />
      </mesh>
      {/* bico + mangueira */}
      <B s={[0.07, 0.16, 0.09]} p={[0.25, 0.55, 0.05]} cor="#20252c" />
      <mesh position={[0.3, 0.4, 0.05]} rotation={[0, 0, 0]} material={lisoMat("#20252c", 0.6)}>
        <torusGeometry args={[0.12, 0.018, 8, 20, Math.PI]} />
      </mesh>
    </group>
  );
};

/** Carregador de carro elétrico (totem com tela, raio e cabo). `liga` 0..1 acende a luz verde. */
export const Carregador: React.FC<{ p?: V3; rotY?: number; s?: number; liga?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, liga = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.4, 0.06, 0.3]} p={[0, 0.03, 0]} cor="#3a3f4a" />
      <B s={[0.32, 1.0, 0.22]} p={[0, 0.56, 0]} cor="#f4f6f8" rough={0.4} />
      <B s={[0.33, 0.05, 0.23]} p={[0, 0.96, 0]} cor="#2fbf71" />
      <B s={[0.22, 0.22, 0.02]} p={[0, 0.72, 0.115]} cor="#1c2430" />
      {/* raio */}
      <mesh position={[0, 0.72, 0.128]} material={liga > 0.05 ? luzMat("#7dffb0", 0.6 + 2 * liga) : lisoMat("#2a5a40", 0.5)}>
        <shapeGeometry args={[raio()]} />
      </mesh>
      {/* cabo e plugue */}
      <mesh position={[0.17, 0.42, 0.04]} rotation={[0, 0, -0.2]} material={lisoMat("#20252c", 0.6)}>
        <torusGeometry args={[0.14, 0.02, 8, 20, Math.PI * 1.2]} />
      </mesh>
      <B s={[0.07, 0.12, 0.08]} p={[0.17, 0.5, 0.13]} cor="#20252c" />
    </group>
  );
};

let _raio: THREE.Shape | null = null;
const raio = () => {
  if (_raio) return _raio;
  const s = new THREE.Shape();
  s.moveTo(0.02, 0.08);
  s.lineTo(-0.05, -0.005);
  s.lineTo(-0.005, -0.005);
  s.lineTo(-0.025, -0.08);
  s.lineTo(0.05, 0.01);
  s.lineTo(0.005, 0.01);
  s.closePath();
  _raio = s;
  return s;
};

/* ------------------------------------------------------------------ mala, fábrica, cigarro */

/** Mala de viagem com rodinhas e alça. */
export const Mala: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, cor = "#c8322a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.56, 0.78, 0.3]} p={[0, 0.47, 0]} cor={cor} rough={0.45} />
      {[-0.14, 0, 0.14].map((x) => (
        <B key={x} s={[0.035, 0.74, 0.31]} p={[x, 0.47, 0]} cor={escurece(cor, 0.82)} />
      ))}
      <B s={[0.58, 0.04, 0.32]} p={[0, 0.47, 0]} cor="#2a2f3a" />
      {/* alça telescópica */}
      {[-0.12, 0.12].map((x) => (
        <B key={x} s={[0.025, 0.28, 0.025]} p={[x, 0.99, -0.1]} cor="#9aa1ab" />
      ))}
      <B s={[0.3, 0.04, 0.05]} p={[0, 1.13, -0.1]} cor="#2a2f3a" />
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.04, -0.1]} rotation={[0, 0, Math.PI / 2]} material={lisoMat("#20252c", 0.6)}>
          <cylinderGeometry args={[0.04, 0.04, 0.04, 14]} />
        </mesh>
      ))}
    </group>
  );
};

/** Fábrica low-poly: galpão com telhado em serra, chaminé (fumaça por `t`) e placa opcional ("R$ 100"). */
export const Fabrica: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string; placa?: string; t?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, cor = "#d9cbb4", placa, t = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[1.6, 0.7, 1.0]} p={[0, 0.35, 0]} cor={cor} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-0.6 + i * 0.4, 0.7, 0]}>
          <B s={[0.42, 0.04, 1.02]} p={[0.04, 0.12, 0]} r={[0, 0, 0.55]} cor="#8c5a46" />
          <B s={[0.03, 0.24, 1.0]} p={[0.19, 0.12, 0]} cor="#7fb0d6" />
        </group>
      ))}
      <B s={[0.36, 0.42, 0.02]} p={[0.45, 0.21, 0.51]} cor="#5a616c" />
      {[-0.55, -0.15].map((x) => (
        <B key={x} s={[0.26, 0.18, 0.02]} p={[x, 0.42, 0.51]} cor="#7fb0d6" />
      ))}
      <mesh position={[-0.55, 1.05, -0.3]} castShadow material={mat("#8c5a46")}>
        <cylinderGeometry args={[0.1, 0.13, 0.9, 12]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.35 + i / 3) % 1 + 1) % 1;
        return (
          <mesh key={i} position={[-0.55 + u * 0.25, 1.55 + u * 0.7, -0.3]} scale={0.12 + u * 0.18} material={lisoMat("#eef0f2", 0.9, 0, 0.85 * (1 - u))}>
            <sphereGeometry args={[1, 10, 8]} />
          </mesh>
        );
      })}
      {placa && <PlanoTexto linhas={[[placa, 1, "#1d2230"]]} fundo="#ffffff" tam={[0.7, 0.24]} p={[-0.2, 0.82, 0.53]} px={[448, 154]} />}
    </group>
  );
};

/** Cigarro deitado com brasa acesa e fumaça (`t` em segundos). Comprimento 1 com s=1. */
export const Cigarro: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  const pulso = 1.6 + Math.sin(t * 5) * 0.6;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <group rotation={[0, 0, Math.PI / 2]} position={[0, 0.07, 0]}>
        <mesh position={[0, 0.12, 0]} castShadow material={lisoMat("#f5f3ee", 0.7)}>
          <cylinderGeometry args={[0.065, 0.065, 0.72, 20]} />
        </mesh>
        <mesh position={[0, -0.39, 0]} castShadow material={lisoMat("#d9883a", 0.6)}>
          <cylinderGeometry args={[0.066, 0.066, 0.3, 20]} />
        </mesh>
        <mesh position={[0, 0.5, 0]} material={luzMat("#ff5a1f", pulso)}>
          <cylinderGeometry args={[0.062, 0.066, 0.04, 20]} />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((i) => {
        const u = ((t * 0.4 + i / 4) % 1 + 1) % 1;
        return (
          <mesh key={i} position={[-0.52 + Math.sin(u * 7 + i) * 0.05, 0.12 + u * 0.8, 0]} scale={0.04 + u * 0.1} material={lisoMat("#e8eaee", 0.9, 0, 0.6 * (1 - u))}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ laço e trigo */

/** Laço de presente (para o teto do carro novo). `k` 0..1 = entrada com mola. */
export const Laco: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string; k?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, cor = "#d62f3a", k = 1 }) => {
  const e = s * ease.back(clamp01(k));
  if (e <= 0.002) return null;
  const m = lisoMat(cor, 0.35);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={e}>
      {[-1, 1].map((i) => (
        <mesh key={i} position={[i * 0.17, 0.14, 0]} rotation={[0, 0, i * 0.5]} scale={[1, 0.62, 0.5]} castShadow material={m}>
          <torusGeometry args={[0.13, 0.05, 10, 24]} />
        </mesh>
      ))}
      {[-1, 1].map((i) => (
        <B key={`f${i}`} s={[0.08, 0.02, 0.3]} p={[i * 0.09, 0.02, 0.12]} r={[0, i * 0.4, 0]} cor={cor} />
      ))}
      <mesh position={[0, 0.12, 0]} castShadow material={m}>
        <sphereGeometry args={[0.07, 14, 10]} />
      </mesh>
    </group>
  );
};

/** Saca de trigo (juta) amarrada no topo, com espigas saindo. `rotulo` opcional pintado na frente. */
export const SacaTrigo: React.FC<{ p?: V3; rotY?: number; s?: number; rotulo?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, rotulo }) => {
  if (s <= 0.002) return null;
  const juta = mat("#c9a46a", 0.95);
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.36, 0]} scale={[1, 1.1, 0.8]} castShadow receiveShadow material={juta}>
        <sphereGeometry args={[0.36, 14, 10]} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow material={juta}>
        <cylinderGeometry args={[0.08, 0.16, 0.14, 10]} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]} material={mat("#7a5a32")}>
        <torusGeometry args={[0.1, 0.02, 6, 16]} />
      </mesh>
      {[-0.06, 0, 0.06].map((x, i) => (
        <group key={x} position={[x, 0.86, 0]} rotation={[0, 0, (i - 1) * 0.35]}>
          <B s={[0.012, 0.18, 0.012]} p={[0, 0.09, 0]} cor="#b08a3e" />
          <mesh position={[0, 0.2, 0]} scale={[0.5, 1, 0.5]} material={mat("#e0b44a")}>
            <sphereGeometry args={[0.05, 8, 6]} />
          </mesh>
        </group>
      ))}
      {rotulo && <PlanoTexto linhas={[[rotulo, 1, "#5a3a1a"]]} fundo={null} tam={[0.44, 0.16]} p={[0, 0.36, 0.292]} px={[384, 140]} />}
    </group>
  );
};

/* ------------------------------------------------------------------ camada 2D */

const useMolaLocal = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (t0: number) => (frame < t0 * fps ? 0 : spring({ frame: frame - t0 * fps, fps, config: { damping: 13, stiffness: 160, mass: 0.8 } }));
};

/**
 * CARD DE NÚMERO GRANDE no topo (estilo "US$ 8 BI" / "R$ 3,95 → ≈R$ 8").
 * Entra em `de` com mola e sai em `ate`. Com `antes`, mostra "antes → valor" (o valor entra 0,5 s depois).
 * Fica acima da faixa da legenda e dentro da margem segura (top padrão 210 px, abaixo do TituloTopo/Selo).
 */
export const CardNumero: React.FC<{ t: number; de: number; ate: number; valor: string; titulo?: string; antes?: string; cor?: string; tinta?: string; top?: number }> = ({
  t,
  de,
  ate,
  valor,
  titulo,
  antes,
  cor = "#ffffff",
  tinta = "#14211d",
  top = 250,
}) => {
  const mola = useMolaLocal();
  if (t < de || t > ate + 0.3) return null;
  const sai = 1 - p(t, ate, 0.3, ease.in);
  const k = mola(de) * sai;
  const kv = antes ? mola(de + 0.5) : 1;
  const tam = Math.max(46, Math.min(150, 1400 / Math.max(4, (antes ? antes.length + 3 : 0) + valor.length)));
  return (
    <div style={{ position: "absolute", top, left: 56, right: 56, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          background: cor,
          color: tinta,
          fontFamily: FONT,
          borderRadius: 40,
          padding: "26px 48px 30px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
          transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * -40}px)`,
          opacity: clamp01(k * 1.6),
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        {titulo && <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "0.06em", opacity: 0.7, marginBottom: 6 }}>{titulo}</div>}
        <div style={{ fontSize: tam, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap" }}>
          {antes && (
            <span style={{ opacity: 0.55 }}>
              {antes}
              <span style={{ margin: "0 0.25em" }}>→</span>
            </span>
          )}
          <span style={{ display: "inline-block", opacity: kv, transform: `scale(${0.7 + 0.3 * Math.min(1, kv)})` }}>{valor}</span>
        </div>
      </div>
    </div>
  );
};

/** CARIMBO (ex.: "IMPOSTO DO PECADO"): bate na tela com escala e leve tremida, inclinado. */
export const Carimbo: React.FC<{ t: number; de: number; ate: number; txt: string; cor?: string; top?: number; rot?: number }> = ({ t, de, ate, txt, cor = "#e23b2e", top = 300, rot = -8 }) => {
  if (t < de || t > ate + 0.3) return null;
  const k = clamp01((t - de) / 0.18);
  const esc = lerp(2.4, 1, ease.in(k));
  const treme = k >= 1 ? Math.sin((t - de) * 70) * Math.max(0, 1 - (t - de - 0.18) * 5) * 6 : 0;
  const sai = 1 - p(t, ate, 0.3, ease.in);
  return (
    <div style={{ position: "absolute", top, left: 56, right: 56, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          border: `12px solid ${cor}`,
          color: cor,
          borderRadius: 26,
          padding: "14px 36px",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: Math.min(92, 1500 / Math.max(8, txt.length)),
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          lineHeight: 1,
          textAlign: "center",
          background: "rgba(255,255,255,0.92)",
          transform: `translateX(${treme}px) rotate(${rot}deg) scale(${esc})`,
          opacity: Math.min(k * 2, 1) * sai,
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
        }}
      >
        {txt}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ padaria e trigo (pao1) */

/** Pãozinho francês: elipsoide dourado com o "pestana" (corte) em cima. Comprimento ~0.5 com s=1. */
export const Paozinho: React.FC<{ p?: V3; rotY?: number; s?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.11, 0]} scale={[1, 0.5, 0.55]} castShadow receiveShadow material={lisoMat("#d9963f", 0.75)}>
        <sphereGeometry args={[0.25, 24, 16]} />
      </mesh>
      <mesh position={[0, 0.215, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.25, 1, 0.35]} material={lisoMat("#f2d49a", 0.85)}>
        <capsuleGeometry args={[0.06, 0.26, 4, 10]} />
      </mesh>
    </group>
  );
};

/** Saco de pão de papel, aberto, com pãezinhos aparecendo. */
export const SacoPao: React.FC<{ p?: V3; rotY?: number; s?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.42, 0.62, 0.26]} p={[0, 0.31, 0]} cor="#e8d2a8" rough={0.95} />
      <B s={[0.43, 0.06, 0.27]} p={[0, 0.6, 0]} cor="#d9bf8f" rough={0.95} />
      <Paozinho p={[-0.06, 0.55, 0.02]} rotY={0.4} s={0.7} />
      <Paozinho p={[0.08, 0.6, -0.02]} rotY={-0.6} s={0.65} />
    </group>
  );
};

/** Moinho: torre afunilada, telhado cônico e pás girando (`t` em segundos). */
export const Moinho: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow material={mat("#efe6d6")}>
        <cylinderGeometry args={[0.2, 0.3, 0.9, 10]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow material={mat("#a8483a")}>
        <coneGeometry args={[0.27, 0.3, 10]} />
      </mesh>
      <B s={[0.12, 0.2, 0.02]} p={[0, 0.12, 0.29]} cor="#6b4a32" />
      <group position={[0, 0.82, 0.25]} rotation={[0, 0, t * 1.4]}>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <B s={[0.03, 0.55, 0.02]} p={[0, 0.3, 0]} cor="#6b4a32" />
            <B s={[0.12, 0.42, 0.01]} p={[0.07, 0.34, 0]} cor="#f6f1e6" />
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} material={mat("#3a2f28")}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 10]} />
        </mesh>
      </group>
    </group>
  );
};

/** Navio graneleiro: casco, porões com trigo, ponte de comando. `balanca` = t para o leve balanço. */
export const Navio: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number; cor?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0, cor = "#c8322a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[Math.sin(t * 1.3) * 0.02, rotY, Math.sin(t * 0.9) * 0.025]} scale={s}>
      <B s={[1.8, 0.22, 0.5]} p={[0, 0.11, 0]} cor={cor} />
      <B s={[1.82, 0.12, 0.52]} p={[0, 0.28, 0]} cor="#20252c" />
      <mesh position={[0.95, 0.22, 0]} rotation={[0, 0, 0]} castShadow material={mat("#20252c")}>
        <cylinderGeometry args={[0.001, 0.26, 0.34, 3, 1, false, Math.PI / 2]} />
      </mesh>
      {[-0.55, -0.15, 0.25].map((x) => (
        <group key={x} position={[x, 0.34, 0]}>
          <B s={[0.34, 0.04, 0.4]} cor="#7a5a3e" />
          <mesh position={[0, 0.04, 0]} scale={[1, 0.35, 1]} material={mat("#e0b44a")}>
            <sphereGeometry args={[0.17, 10, 6]} />
          </mesh>
        </group>
      ))}
      <B s={[0.3, 0.36, 0.42]} p={[-0.78, 0.52, 0]} cor="#f2efe8" />
      <B s={[0.32, 0.06, 0.44]} p={[-0.78, 0.72, 0]} cor="#20252c" />
      <B s={[0.31, 0.06, 0.43]} p={[-0.78, 0.6, 0]} cor="#7fb0d6" />
    </group>
  );
};

/** Balcão de padaria: base de madeira com vitrine de vidro e pãezinhos dentro. */
export const Balcao: React.FC<{ p?: V3; rotY?: number; s?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[1.1, 0.5, 0.45]} p={[0, 0.25, 0]} cor="#8c5a3a" />
      <B s={[1.14, 0.04, 0.49]} p={[0, 0.52, 0]} cor="#5a3a24" />
      <mesh position={[0, 0.7, 0]} material={lisoMat("#dff2ff", 0.1, 0, 0.35)}>
        <boxGeometry args={[1.0, 0.32, 0.38]} />
      </mesh>
      {[-0.32, -0.08, 0.16, 0.38].map((x, i) => (
        <Paozinho key={x} p={[x - 0.02, 0.54, (i % 2) * 0.08 - 0.04]} rotY={i * 0.7} s={0.55} />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ golpe e sorte (caixa1) */

/** Pirâmide dourada em degraus (a "pirâmide financeira"). `desaba` 0..1: os degraus caem e somem, de cima para baixo. */
export const Piramide: React.FC<{ p?: V3; rotY?: number; s?: number; desaba?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, desaba = 0 }) => {
  if (s <= 0.002) return null;
  const N = 5;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {Array.from({ length: N }, (_, i) => {
        const lado = 0.95 - i * 0.18;
        const ordem = (N - 1 - i) / N; // o topo cai primeiro
        const k = clamp01((desaba - ordem * 0.6) / 0.4);
        if (k >= 0.999) return null;
        const y = 0.09 + i * 0.18;
        return (
          <group key={i} position={[k * (i % 2 ? 0.6 : -0.6), y * (1 - ease.in(k)), k * 0.3]} rotation={[k * 1.2, 0, k * (i % 2 ? -1.4 : 1.4)]} scale={1 - k * 0.6}>
            <mesh castShadow receiveShadow material={lisoMat(i === N - 1 ? "#ffe08a" : "#f2c14e", 0.35, 0.3)}>
              <boxGeometry args={[lado, 0.17, lado]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Globo de sorteio: esfera de vidro num pé, bolinhas girando por `t`. */
export const GloboSorteio: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  const cores = ["#2fbf71", "#2fbf71", "#ffffff", "#2fbf71", "#ffffff", "#2fbf71", "#ffffff", "#2fbf71"];
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.06, 0.4]} p={[0, 0.03, 0]} cor="#2a2f3a" />
      <B s={[0.06, 0.32, 0.06]} p={[0, 0.2, 0]} cor="#9aa1ab" />
      <mesh position={[0, 0.62, 0]} material={lisoMat("#dff2ff", 0.05, 0, 0.3)}>
        <sphereGeometry args={[0.3, 28, 20]} />
      </mesh>
      <mesh position={[0, 0.62, 0]} rotation={[0, t * 1.5, Math.PI / 2]} material={lisoMat("#c9ced6", 0.3, 0.6)}>
        <torusGeometry args={[0.31, 0.012, 8, 40]} />
      </mesh>
      {cores.map((cor, i) => {
        const a = t * (2.2 + hash(i) * 1.6) + i * 1.7;
        const r = 0.15 + hash(i + 3) * 0.08;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.55 + Math.abs(Math.sin(a * 1.3 + i)) * 0.16, Math.sin(a) * r]} castShadow material={lisoMat(cor, 0.3)}>
            <sphereGeometry args={[0.045, 12, 10]} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ games (gta3) — tudo genérico, sem marca */

/** Console "torre" branco genérico (geração nova), com faixa de luz azul. `liga` 0..1 acende a luz. */
export const ConsoleNovo: React.FC<{ p?: V3; rotY?: number; s?: number; liga?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, liga = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.36, 0.04, 0.3]} p={[0, 0.02, 0]} cor="#20252c" />
      <mesh position={[-0.1, 0.5, 0]} castShadow receiveShadow material={lisoMat("#f4f6f8", 0.35)}>
        <boxGeometry args={[0.1, 0.95, 0.42]} />
      </mesh>
      <mesh position={[0.1, 0.5, 0]} castShadow receiveShadow material={lisoMat("#f4f6f8", 0.35)}>
        <boxGeometry args={[0.1, 0.95, 0.42]} />
      </mesh>
      <B s={[0.1, 0.92, 0.4]} p={[0, 0.5, 0]} cor="#1c2027" />
      <mesh position={[0, 0.5, 0.205]} material={liga > 0.05 ? luzMat("#5aa9ff", 0.6 + 1.8 * liga) : lisoMat("#2a3a5a", 0.5)}>
        <planeGeometry args={[0.03, 0.85]} />
      </mesh>
    </group>
  );
};

/** Console "antigo" genérico: caixa preta baixa com uma luz fina. */
export const ConsoleAntigo: React.FC<{ p?: V3; rotY?: number; s?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.7, 0.1, 0.5]} p={[0, 0.05, 0]} cor="#16191e" rough={0.4} />
      <B s={[0.7, 0.06, 0.48]} p={[0, 0.13, -0.01]} cor="#20242b" rough={0.4} />
      <mesh position={[0, 0.1, 0.252]} material={luzMat("#5aa9ff", 1.2)}>
        <planeGeometry args={[0.5, 0.008]} />
      </mesh>
    </group>
  );
};

/** Controle de videogame genérico (corpo + duas alças + direcional e botões). */
export const Controle: React.FC<{ p?: V3; rot?: V3; s?: number; cor?: string }> = ({ p: pos = [0, 0, 0], rot = [0, 0, 0], s = 1, cor = "#f4f6f8" }) => {
  if (s <= 0.002) return null;
  const m = lisoMat(cor, 0.35);
  return (
    <group position={pos} rotation={rot} scale={s}>
      <mesh castShadow material={m} scale={[1, 0.35, 0.6]}>
        <sphereGeometry args={[0.16, 20, 14]} />
      </mesh>
      {[-1, 1].map((i) => (
        <mesh key={i} position={[i * 0.13, -0.01, 0.06]} rotation={[0.5, 0, i * 0.3]} castShadow material={m}>
          <capsuleGeometry args={[0.045, 0.08, 4, 10]} />
        </mesh>
      ))}
      <B s={[0.05, 0.02, 0.015]} p={[-0.07, 0.05, -0.01]} cor="#20252c" />
      <B s={[0.015, 0.02, 0.05]} p={[-0.07, 0.05, -0.01]} cor="#20252c" />
      {[[0.06, -0.02], [0.09, 0.0], [0.06, 0.02], [0.03, 0.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.055, z - 0.01]} material={lisoMat("#20252c", 0.4)}>
          <cylinderGeometry args={[0.009, 0.009, 0.01, 10]} />
        </mesh>
      ))}
    </group>
  );
};

/** Caixa de jogo (estojo) com capa colorida e título. */
export const CaixaJogo: React.FC<{ p?: V3; rotY?: number; s?: number; titulo?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, titulo = "GTA 6" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.42, 0.56, 0.05]} p={[0, 0.28, 0]} cor="#1c2a6e" />
      <PlanoTexto linhas={[[titulo, 1.2, "#ffffff"], ["", 0.4, "#fff"]]} fundo="#e8457a" tam={[0.38, 0.4]} p={[0, 0.32, 0.027]} px={[320, 336]} />
      <mesh position={[0, 0.1, 0.027]} material={lisoMat("#f2a03a", 0.6)}>
        <planeGeometry args={[0.38, 0.12]} />
      </mesh>
    </group>
  );
};

/** Relógio de parede/mesa com ponteiros girando por `t` (rápido = tempo "voando"). */
export const Relogio: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number; vel?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0, vel = 6 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={lisoMat("#d6453a", 0.4)}>
        <cylinderGeometry args={[0.2, 0.2, 0.06, 32]} />
      </mesh>
      <mesh position={[0, 0, 0.031]} material={lisoMat("#fbfaf6", 0.6)}>
        <circleGeometry args={[0.17, 32]} />
      </mesh>
      <B s={[0.012, 0.13, 0.01]} p={[Math.sin(t * vel) * 0.065, Math.cos(t * vel) * 0.065, 0.04]} r={[0, 0, -t * vel]} cor="#1d2230" />
      <B s={[0.016, 0.09, 0.01]} p={[Math.sin(t * vel / 12) * 0.045, Math.cos(t * vel / 12) * 0.045, 0.042]} r={[0, 0, -t * vel / 12]} cor="#1d2230" />
    </group>
  );
};

/** Placa pendurada num poste (texto em placa colorida). `k` 0..1 = entrada com balanço. */
export const Placa: React.FC<{ p?: V3; rotY?: number; s?: number; txt: string; cor?: string; tinta?: string; k?: number; larg?: number }> = ({
  p: pos = [0, 0, 0],
  rotY = 0,
  s = 1,
  txt,
  cor = "#2fbf71",
  tinta = "#ffffff",
  k = 1,
  larg = 0.7,
}) => {
  const e = s * ease.back(clamp01(k));
  if (e <= 0.002) return null;
  const bal = Math.sin(clamp01(k) * Math.PI * 3) * (1 - clamp01(k)) * 0.4;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={e}>
      <B s={[0.025, 0.3, 0.025]} p={[0, 0.15, 0]} cor="#2a2f3a" />
      <group position={[0, 0.0, 0]} rotation={[0, 0, bal]}>
        <B s={[larg + 0.04, 0.24, 0.03]} p={[0, -0.12, 0]} cor={escurece(cor, 0.8)} />
        <PlanoTexto linhas={[[txt, 1, tinta]]} fundo={cor} tam={[larg, 0.2]} p={[0, -0.12, 0.017]} px={[Math.round(512 * larg / 0.7), 146]} />
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ comida (vídeo de vendas para negócio local) */

/**
 * Hambúrguer em camadas. `monta` 0..1: cada camada cai do alto e assenta (de baixo para cima).
 * `vapor` (t em s) solta fumacinha. Diâmetro ~0.8 com s=1.
 */
export const Hamburguer: React.FC<{ p?: V3; rotY?: number; s?: number; monta?: number; t?: number; duplo?: boolean }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, monta = 1, t = 0, duplo = true }) => {
  if (s <= 0.002) return null;
  type Cam = { h: number; r: number; cor: string; tipo?: "cupula" | "queijo" | "alface" };
  const camadas: Cam[] = [
    { h: 0.1, r: 0.4, cor: "#d99a4e" },
    { h: 0.12, r: 0.42, cor: "#5a2e1c" },
    { h: 0.03, r: 0.44, cor: "#ffb72e", tipo: "queijo" },
    ...(duplo ? ([{ h: 0.12, r: 0.42, cor: "#5a2e1c" }, { h: 0.03, r: 0.44, cor: "#ffb72e", tipo: "queijo" }] as Cam[]) : []),
    { h: 0.05, r: 0.4, cor: "#d6302a" },
    { h: 0.04, r: 0.46, cor: "#5cb84a", tipo: "alface" },
    { h: 0.22, r: 0.42, cor: "#e3a454", tipo: "cupula" },
  ];
  let y = 0;
  const n = camadas.length;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {camadas.map((c, i) => {
        const k = ease.out(clamp01(monta * n - i));
        const yBase = y;
        y += c.h;
        if (k <= 0.001) return null;
        const cai = (1 - k) * 1.6;
        const m = lisoMat(c.cor, c.tipo === "queijo" ? 0.35 : 0.6);
        return (
          <group key={i} position={[0, yBase + cai, 0]}>
            {c.tipo === "cupula" ? (
              <>
                <mesh position={[0, 0.02, 0]} scale={[1, 0.55, 1]} castShadow material={m}>
                  <sphereGeometry args={[c.r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                </mesh>
                <mesh position={[0, 0.01, 0]} castShadow material={m}>
                  <cylinderGeometry args={[c.r, c.r * 0.98, 0.04, 32]} />
                </mesh>
                {Array.from({ length: 14 }, (_, j) => {
                  const a = hash(j) * Math.PI * 2;
                  const rr = 0.08 + hash(j + 3) * 0.26;
                  const yy = 0.02 + Math.sqrt(Math.max(0, 1 - (rr / c.r) ** 2)) * c.r * 0.55;
                  return (
                    <mesh key={j} position={[Math.cos(a) * rr, yy, Math.sin(a) * rr]} rotation={[0, a, 0.3]} scale={[1, 0.45, 0.6]} material={lisoMat("#fff4dc", 0.5)}>
                      <sphereGeometry args={[0.018, 6, 4]} />
                    </mesh>
                  );
                })}
              </>
            ) : c.tipo === "queijo" ? (
              <group rotation={[0, i * 0.4, 0]}>
                <B s={[c.r * 1.75, c.h, c.r * 1.75]} p={[0, c.h / 2, 0]} cor={c.cor} rough={0.35} />
                {[0, 1, 2, 3].map((j) => (
                  <mesh key={j} position={[Math.cos((j * Math.PI) / 2) * c.r * 0.88, -0.02, Math.sin((j * Math.PI) / 2) * c.r * 0.88]} material={m}>
                    <coneGeometry args={[0.06, 0.1, 6]} />
                  </mesh>
                ))}
              </group>
            ) : c.tipo === "alface" ? (
              <mesh position={[0, c.h / 2, 0]} castShadow material={m}>
                <cylinderGeometry args={[c.r, c.r * 0.9, c.h, 14]} />
              </mesh>
            ) : (
              <mesh position={[0, c.h / 2, 0]} castShadow receiveShadow material={m}>
                <cylinderGeometry args={[c.r, c.r, c.h, 32]} />
              </mesh>
            )}
          </group>
        );
      })}
      {monta >= 1 &&
        [0, 1, 2].map((i) => {
          const u = ((t * 0.45 + i / 3) % 1 + 1) % 1;
          return (
            <mesh key={`v${i}`} position={[Math.sin(u * 6 + i * 2) * 0.1, y + 0.03 + u * 0.55, 0]} scale={0.025 + u * 0.06} material={lisoMat("#ffffff", 0.9, 0, 0.32 * (1 - u))}>
              <sphereGeometry args={[1, 10, 8]} />
            </mesh>
          );
        })}
    </group>
  );
};

/** Caixinha de batata frita com palitos. `enche` 0..1 faz os palitos subirem. */
export const Fritas: React.FC<{ p?: V3; rotY?: number; s?: number; enche?: number; cor?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, enche = 1, cor = "#d6302a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.2, 0]} castShadow material={lisoMat(cor, 0.5)}>
        <cylinderGeometry args={[0.2, 0.14, 0.4, 4, 1, false, Math.PI / 4]} />
      </mesh>
      {Array.from({ length: 16 }, (_, i) => {
        const x = (hash(i) - 0.5) * 0.24;
        const z = (hash(i + 5) - 0.5) * 0.14;
        const h = 0.28 + hash(i + 9) * 0.12;
        return <B key={i} s={[0.035, h, 0.035]} p={[x, 0.24 + h / 2 - (1 - ease.out(clamp01(enche))) * 0.3, z]} r={[(hash(i + 2) - 0.5) * 0.3, 0, (hash(i + 4) - 0.5) * 0.3]} cor="#ffcf4a" />;
      })}
    </group>
  );
};

/** Copo de refrigerante com tampa e canudo. */
export const Copo: React.FC<{ p?: V3; rotY?: number; s?: number; cor?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, cor = "#d6302a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.25, 0]} castShadow material={lisoMat(cor, 0.4)}>
        <cylinderGeometry args={[0.15, 0.11, 0.5, 24]} />
      </mesh>
      <mesh position={[0, 0.25, 0]} material={lisoMat("#ffffff", 0.5)}>
        <cylinderGeometry args={[0.152, 0.13, 0.12, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.51, 0]} material={lisoMat("#f2efe8", 0.4)}>
        <cylinderGeometry args={[0.158, 0.155, 0.03, 24]} />
      </mesh>
      <B s={[0.03, 0.3, 0.03]} p={[0.04, 0.62, 0]} r={[0, 0, -0.15]} cor="#ffffff" />
    </group>
  );
};

/** Pizza inteira com fatia saindo (`fatia` 0..1) e queijo esticando. */
export const Pizza: React.FC<{ p?: V3; rotY?: number; s?: number; fatia?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, fatia = 0 }) => {
  if (s <= 0.002) return null;
  const ang = Math.PI / 4;
  const disco = (ini: number, len: number, key: string, off: V3 = [0, 0, 0]) => (
    <group key={key} position={off}>
      <mesh position={[0, 0.03, 0]} castShadow material={lisoMat("#e0a458", 0.7)}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 40, 1, false, ini, len]} />
      </mesh>
      <mesh position={[0, 0.065, 0]} material={lisoMat("#ffd04d", 0.45)}>
        <cylinderGeometry args={[0.49, 0.49, 0.02, 40, 1, false, ini, len]} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = ini + hash(i + key.length) * len;
        const r = 0.12 + hash(i + 7) * 0.3;
        return (
          <mesh key={i} position={[Math.sin(a) * r, 0.08, Math.cos(a) * r]} material={lisoMat("#b8322a", 0.6)}>
            <cylinderGeometry args={[0.05, 0.05, 0.015, 14]} />
          </mesh>
        );
      })}
    </group>
  );
  const k = ease.out(clamp01(fatia));
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {disco(ang, Math.PI * 2 - ang, "corpo")}
      {disco(0, ang, "fatia", [Math.sin(ang / 2) * 0.35 * k, 0.25 * k, Math.cos(ang / 2) * 0.35 * k])}
      {k > 0.05 && k < 0.95 ? (
        <mesh position={[Math.sin(ang / 2) * 0.17 * k, 0.07 + 0.12 * k, Math.cos(ang / 2) * 0.17 * k]} material={lisoMat("#ffd04d", 0.45)}>
          <cylinderGeometry args={[0.012, 0.012, 0.25 * k, 6]} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Xícara de café com pires e vapor (`t`). */
export const Cafe: React.FC<{ p?: V3; rotY?: number; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <mesh position={[0, 0.015, 0]} receiveShadow material={lisoMat("#f4f6f8", 0.35)}>
        <cylinderGeometry args={[0.28, 0.24, 0.03, 32]} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow material={lisoMat("#f4f6f8", 0.35)}>
        <cylinderGeometry args={[0.16, 0.12, 0.24, 28]} />
      </mesh>
      <mesh position={[0, 0.262, 0]} material={lisoMat("#5a3420", 0.3)}>
        <cylinderGeometry args={[0.145, 0.145, 0.01, 28]} />
      </mesh>
      <mesh position={[0.17, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]} material={lisoMat("#f4f6f8", 0.35)}>
        <torusGeometry args={[0.06, 0.018, 8, 16]} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.4 + i / 3) % 1 + 1) % 1;
        return (
          <mesh key={i} position={[Math.sin(u * 7 + i) * 0.05, 0.3 + u * 0.5, 0]} scale={0.03 + u * 0.08} material={lisoMat("#ffffff", 0.9, 0, 0.5 * (1 - u))}>
            <sphereGeometry args={[1, 8, 6]} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Celular com conversa de mensagem (genérico, sem logotipo): bolhas aparecendo com `k` 0..1. */
export const CelularPedido: React.FC<{ p?: V3; rotY?: number; s?: number; k?: number; linhas?: string[]; cor?: string }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, k = 1, linhas = ["Oi! Quero 1 combo", "Chega em 30 min 🛵"], cor = "#25a35a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.95, 0.05]} p={[0, 0.48, 0]} cor="#16191e" rough={0.3} />
      <mesh position={[0, 0.48, 0.026]} material={lisoMat("#ece5dc", 0.6)}>
        <planeGeometry args={[0.44, 0.86]} />
      </mesh>
      <mesh position={[0, 0.86, 0.027]} material={lisoMat(cor, 0.5)}>
        <planeGeometry args={[0.44, 0.1]} />
      </mesh>
      {linhas.map((l, i) => {
        const ki = ease.back(clamp01(k * linhas.length - i));
        if (ki <= 0.01) return null;
        const meu = i % 2 === 0;
        return (
          <group key={i} position={[meu ? 0.03 : -0.03, 0.7 - i * 0.2, 0.03]} scale={ki}>
            <PlanoTexto linhas={[[l, 1, "#1d2230"]]} fundo={meu ? "#d9fdd3" : "#ffffff"} tam={[0.4, 0.14]} px={[560, 196]} />
          </group>
        );
      })}
    </group>
  );
};


/* ------------------------------------------------------------------ venda do kit (vendakit1) */

/** Tomate (esfera achatada vermelha com cabinho verde). */
export const Tomate: React.FC<{ p?: V3; s?: number; rot?: number }> = ({ p: pos = [0, 0, 0], s = 1, rot = 0 }) => (
  <group position={pos} rotation={[0, rot, 0]} scale={s}>
    <mesh position={[0, 0.09, 0]} scale={[1, 0.82, 1]} castShadow material={lisoMat("#e2342a", 0.3)}>
      <sphereGeometry args={[0.11, 18, 14]} />
    </mesh>
    <mesh position={[0, 0.18, 0]} material={lisoMat("#3f8f3a", 0.6)}>
      <coneGeometry args={[0.04, 0.03, 5]} />
    </mesh>
  </group>
);

/** Caixa de feira (madeira) cheia de tomates. `sai` 0..1: um terço dos tomates pula para fora (para `destino`, relativo). */
export const CaixaTomate: React.FC<{ p?: V3; rotY?: number; s?: number; sai?: number; destino?: V3 }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, sai = 0, destino = [1.6, 0, 0] }) => {
  if (s <= 0.002) return null;
  const madeira = mat("#b9864f", 0.9);
  const tomates: { x: number; z: number; y: number; i: number }[] = [];
  for (let i = 0; i < 18; i++) tomates.push({ x: -0.32 + (i % 6) * 0.13, z: -0.14 + (Math.floor(i / 6) % 3) * 0.14, y: 0.3 + (i >= 12 ? 0.05 : 0) + hash(i) * 0.02, i });
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {[0, 1, 2].map((r) => (
        <React.Fragment key={r}>
          <mesh position={[0, 0.06 + r * 0.11, 0.24]} castShadow material={madeira}><boxGeometry args={[0.9, 0.08, 0.03]} /></mesh>
          <mesh position={[0, 0.06 + r * 0.11, -0.24]} castShadow material={madeira}><boxGeometry args={[0.9, 0.08, 0.03]} /></mesh>
        </React.Fragment>
      ))}
      {[-1, 1].map((i) => (
        <mesh key={i} position={[i * 0.44, 0.17, 0]} castShadow material={madeira}><boxGeometry args={[0.04, 0.34, 0.5]} /></mesh>
      ))}
      <mesh position={[0, 0.02, 0]} receiveShadow material={madeira}><boxGeometry args={[0.9, 0.03, 0.5]} /></mesh>
      {tomates.map(({ x, z, y, i }) => {
        const voa = i % 3 === 0; // 6 de 18 = um terço
        const k = voa ? ease.inOut(clamp01((sai - (i / 18) * 0.4) / 0.6)) : 0;
        const px = lerp(x, destino[0] + ((i / 3) % 3 - 1) * 0.14, k);
        const pz = lerp(z, destino[2] + (i % 2 ? 0.07 : -0.07), k);
        const py = lerp(y - 0.09, destino[1] + (i > 9 ? 0.12 : 0), k) + Math.sin(k * Math.PI) * 0.9;
        return <Tomate key={i} p={[px, py, pz]} rot={i} s={1} />;
      })}
    </group>
  );
};

/** Cubo amarelo do Estúdio Miniatura (a marca do kit), com brilho. `gira` = t. */
export const CuboKit: React.FC<{ p?: V3; s?: number; gira?: number }> = ({ p: pos = [0, 0, 0], s = 1, gira = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s}>
      <group position={[0, 0.32, 0]} rotation={[0.55, gira * 0.8 + 0.6, 0.35]}>
        <mesh castShadow material={lisoMat("#ffcf3a", 0.3, 0.1)}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
        </mesh>
        <mesh position={[0, 0.201, 0]} material={lisoMat("#ffe27a", 0.3)}>
          <planeGeometry args={[0.39, 0.39]} />
        </mesh>
      </group>
    </group>
  );
};

/** Balança de dois pratos. `incl` -1..1 inclina (positivo desce o prato direito). Filhos: [esquerda, direita]. */
export const Balanca: React.FC<{ p?: V3; s?: number; incl?: number; esq?: React.ReactNode; dir?: React.ReactNode }> = ({ p: pos = [0, 0, 0], s = 1, incl = 0, esq, dir }) => {
  if (s <= 0.002) return null;
  const a = incl * 0.22;
  const L = 0.95;
  const m = lisoMat("#c9ced6", 0.3, 0.7);
  const prato = (lado: number, filho: React.ReactNode) => {
    const x = Math.cos(a) * L * lado;
    const y = 1.2 - Math.sin(a) * L * lado;
    return (
      <group position={[x, y, 0]}>
        {[-1, 1].map((i) => (
          <B key={i} s={[0.012, 0.42, 0.012]} p={[i * 0.2, -0.21, 0]} r={[0, 0, i * 0.4]} cor="#9aa1ab" />
        ))}
        <mesh position={[0, -0.42, 0]} castShadow receiveShadow material={m}>
          <cylinderGeometry args={[0.4, 0.34, 0.04, 32]} />
        </mesh>
        <group position={[0, -0.4, 0]}>{filho}</group>
      </group>
    );
  };
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.03, 0]} castShadow material={m}><cylinderGeometry args={[0.32, 0.38, 0.06, 32]} /></mesh>
      <mesh position={[0, 0.62, 0]} castShadow material={m}><cylinderGeometry args={[0.035, 0.05, 1.2, 12]} /></mesh>
      <group position={[0, 1.2, 0]} rotation={[0, 0, -a]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={m}><cylinderGeometry args={[0.03, 0.03, L * 2, 12]} /></mesh>
      </group>
      <mesh position={[0, 1.24, 0]} material={lisoMat("#ffcf3a", 0.3, 0.4)}><sphereGeometry args={[0.06, 16, 12]} /></mesh>
      {prato(-1, esq)}
      {prato(1, dir)}
    </group>
  );
};

/** Escudo de garantia (verde, com "✓" e texto). */
export const Escudo: React.FC<{ p?: V3; s?: number; txt?: string; gira?: number }> = ({ p: pos = [0, 0, 0], s = 1, txt = "GARANTIA", gira = 0 }) => {
  const forma = useMemo(() => {
    const sh = new THREE.Shape();
    sh.moveTo(0, 0.5);
    sh.quadraticCurveTo(0.22, 0.42, 0.42, 0.44);
    sh.lineTo(0.4, 0.05);
    sh.quadraticCurveTo(0.36, -0.32, 0, -0.52);
    sh.quadraticCurveTo(-0.36, -0.32, -0.4, 0.05);
    sh.lineTo(-0.42, 0.44);
    sh.quadraticCurveTo(-0.22, 0.42, 0, 0.5);
    return new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 });
  }, []);
  if (s <= 0.002) return null;
  return (
    <group position={pos} scale={s} rotation={[0, Math.sin(gira) * 0.35, 0]}>
      <mesh geometry={forma} position={[0, 0.55, -0.04]} castShadow material={lisoMat("#25a35a", 0.35, 0.1)} />
      <PlanoTexto linhas={[["✓", 1.6, "#ffffff"], [txt, 0.7, "#ffffff"]]} fundo={null} tam={[0.6, 0.6]} p={[0, 0.58, 0.07]} px={[400, 400]} />
    </group>
  );
};

/** Celular mostrando uma imagem (quadro de um vídeo) de public/. `liga` 0..1 acende a tela. */
export const CelularImagem: React.FC<{ p?: V3; rotY?: number; s?: number; img: string; liga?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, img, liga = 1 }) => {
  const tex = useTexture(staticFile(img));
  tex.colorSpace = THREE.SRGBColorSpace;
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.5, 0.92, 0.04]} p={[0, 0.46, 0]} cor="#16191e" rough={0.3} />
      <mesh position={[0, 0.46, 0.021]}>
        <planeGeometry args={[0.46, 0.82]} />
        <meshBasicMaterial map={tex} color={new THREE.Color(0.25 + 0.75 * clamp01(liga), 0.25 + 0.75 * clamp01(liga), 0.25 + 0.75 * clamp01(liga))} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Caixa de presente que abre (tampa sobe) revelando um rótulo. */
export const CaixaAbre: React.FC<{ p?: V3; s?: number; abre?: number; cor?: string; rotulo: string }> = ({ p: pos = [0, 0, 0], s = 1, abre = 0, cor = "#5b3a8c", rotulo }) => {
  if (s <= 0.002) return null;
  const k = ease.back(clamp01(abre));
  return (
    <group position={pos} scale={s}>
      <B s={[0.6, 0.4, 0.6]} p={[0, 0.2, 0]} cor={cor} />
      <B s={[0.1, 0.41, 0.61]} p={[0, 0.2, 0]} cor="#ffcf3a" />
      <group position={[0, 0.42 + k * 0.45, 0]} rotation={[k * -0.5, 0, k * 0.3]}>
        <B s={[0.66, 0.1, 0.66]} cor={escurece(cor, 1.2)} />
        <B s={[0.11, 0.11, 0.67]} cor="#ffcf3a" />
      </group>
      {abre > 0.2 ? <PlanoTexto linhas={[[rotulo, 1, "#1d2230"]]} fundo="#ffffff" tam={[0.62 * k, 0.2 * k]} p={[0, 0.62 + k * 0.1, 0.1]} px={[440, 142]} /> : null}
    </group>
  );
};

/* ------------------------------------------------------------------ marcos do mundo (gta4) — estilizados, feitos em código */

/** Torre Eiffel treliçada (4 pés em arco, 2 plataformas, agulha). `acesa` 0..1 = luzes douradas. Altura ~2.4 com s=1. */
export const TorreEiffel: React.FC<{ p?: V3; rotY?: number; s?: number; acesa?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, acesa = 0 }) => {
  if (s <= 0.002) return null;
  const ferro = acesa > 0.05 ? luzMat("#e8a93a", 0.25 + acesa * 0.9) : lisoMat("#6b5a48", 0.6, 0.3);
  const perna = (sx: number, sz: number) => {
    const segs = 6;
    return Array.from({ length: segs }, (_, i) => {
      const y0 = (i / segs) * 1.2;
      const y1 = ((i + 1) / segs) * 1.2;
      const r0 = 0.62 * (1 - y0 / 1.6) ** 1.6;
      const r1 = 0.62 * (1 - y1 / 1.6) ** 1.6;
      const x0 = sx * r0, z0 = sz * r0, x1 = sx * r1, z1 = sz * r1;
      const len = Math.hypot(x1 - x0, y1 - y0, z1 - z0);
      const mid: V3 = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
      const dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      const e = new THREE.Euler().setFromQuaternion(q);
      return (
        <mesh key={`${sx}${sz}${i}`} position={mid} rotation={e} castShadow material={ferro}>
          <boxGeometry args={[0.07, len, 0.07]} />
        </mesh>
      );
    });
  };
  const anel = (y: number, r: number, h = 0.05) => (
    <mesh position={[0, y, 0]} castShadow material={ferro}>
      <boxGeometry args={[r * 2, h, r * 2]} />
    </mesh>
  );
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {perna(1, 1)}
      {perna(-1, 1)}
      {perna(1, -1)}
      {perna(-1, -1)}
      {/* arcos da base */}
      {[0, Math.PI / 2].map((a) => (
        <mesh key={a} position={[0, 0.2, 0]} rotation={[0, a, 0]} material={ferro}>
          <torusGeometry args={[0.36, 0.022, 6, 16, Math.PI]} />
        </mesh>
      ))}
      {anel(0.42, 0.42, 0.06)}
      {anel(0.85, 0.22, 0.05)}
      {/* corpo superior afunilado + treliça em X */}
      <mesh position={[0, 1.55, 0]} castShadow material={ferro}>
        <cylinderGeometry args={[0.035, 0.17, 1.4, 4, 1, true]} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 1.0 + i * 0.26, 0]} rotation={[0, Math.PI / 4, 0]} material={ferro}>
          <boxGeometry args={[0.3 - i * 0.05, 0.02, 0.3 - i * 0.05]} />
        </mesh>
      ))}
      {anel(2.22, 0.05, 0.06)}
      <mesh position={[0, 2.38, 0]} material={ferro}>
        <cylinderGeometry args={[0.008, 0.02, 0.3, 6]} />
      </mesh>
      {acesa > 0.3 ? (
        <mesh position={[0, 2.55, 0]} material={luzMat("#fff2c2", 3)}>
          <sphereGeometry args={[0.03, 8, 6]} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Empire State estilizado (art déco em degraus + antena). Altura ~2.6 com s=1. */
export const EmpireState: React.FC<{ p?: V3; rotY?: number; s?: number; janelas?: boolean }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, janelas = true }) => {
  if (s <= 0.002) return null;
  const cor = "#c9c1b0";
  const blocos: [number, number, number][] = [
    [0.9, 0.35, 0.6], [0.7, 0.9, 0.5], [0.5, 0.45, 0.36], [0.34, 0.25, 0.26], [0.22, 0.18, 0.18],
  ];
  let y = 0;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {blocos.map(([l, h, pz], i) => {
        const y0 = y;
        y += h;
        return (
          <group key={i}>
            <B s={[l, h, pz]} p={[0, y0 + h / 2, 0]} cor={cor} rough={0.7} />
            {janelas && h > 0.3
              ? Array.from({ length: Math.floor(l / 0.08) }, (_, j) => (
                  <B key={j} s={[0.025, h * 0.9, 0.01]} p={[-l / 2 + 0.05 + j * 0.08, y0 + h / 2, pz / 2 + 0.003]} cor="#7f8fa6" />
                ))
              : null}
          </group>
        );
      })}
      <mesh position={[0, y + 0.18, 0]} castShadow material={lisoMat(cor, 0.5)}>
        <cylinderGeometry args={[0.04, 0.08, 0.36, 8]} />
      </mesh>
      <mesh position={[0, y + 0.55, 0]} material={lisoMat("#9aa1ab", 0.4, 0.6)}>
        <cylinderGeometry args={[0.006, 0.014, 0.42, 6]} />
      </mesh>
      <mesh position={[0, y + 0.78, 0]} material={luzMat("#ff4a3a", 2)}>
        <sphereGeometry args={[0.018, 8, 6]} />
      </mesh>
    </group>
  );
};

/** Burj Khalifa estilizado (cilindros afunilando em degraus + agulha). Altura ~3.4 com s=1. */
export const BurjKhalifa: React.FC<{ p?: V3; s?: number }> = ({ p: pos = [0, 0, 0], s = 1 }) => {
  if (s <= 0.002) return null;
  const vidro = lisoMat("#9fc3dd", 0.15, 0.6);
  const n = 9;
  let y = 0;
  return (
    <group position={pos} scale={s}>
      {Array.from({ length: n }, (_, i) => {
        const r = 0.32 * (1 - i / (n + 1.5));
        const h = 0.34 - i * 0.008;
        const y0 = y;
        y += h;
        return (
          <group key={i}>
            <mesh position={[0, y0 + h / 2, 0]} castShadow receiveShadow material={vidro}>
              <cylinderGeometry args={[r * 0.92, r, h, 3]} />
            </mesh>
            <mesh position={[0, y0 + h / 2, 0]} rotation={[0, Math.PI / 3, 0]} material={lisoMat("#c7dbe9", 0.2, 0.5)}>
              <cylinderGeometry args={[r * 0.72, r * 0.8, h * 0.98, 3]} />
            </mesh>
          </group>
        );
      })}
      <mesh position={[0, y + 0.3, 0]} material={lisoMat("#d8e3ea", 0.2, 0.7)}>
        <cylinderGeometry args={[0.012, 0.05, 0.6, 6]} />
      </mesh>
    </group>
  );
};

/** Palmeira (tronco em gomos + folhas). */
export const Palmeira: React.FC<{ p?: V3; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  const tronco = mat("#8a6a44");
  const folha = mat("#3f9a46");
  return (
    <group position={pos} scale={s}>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.25) * 0.05, 0.08 + i * 0.15, 0]} castShadow material={tronco}>
          <cylinderGeometry args={[0.045, 0.055, 0.15, 7]} />
        </mesh>
      ))}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + Math.sin(t * 1.5 + i) * 0.05;
        return (
          <group key={i} position={[0.08, 1.1, 0]} rotation={[0, a, 0]}>
            <mesh position={[0.28, -0.06, 0]} rotation={[0, 0, -0.45]} scale={[1, 0.12, 0.35]} castShadow material={folha}>
              <sphereGeometry args={[0.3, 8, 6]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/** Telescópio James Webb estilizado: espelho de 18 hexágonos dourados, secundário em tripé e escudo térmico em camadas. */
export const JamesWebb: React.FC<{ p?: V3; rotY?: number; s?: number; abre?: number }> = ({ p: pos = [0, 0, 0], rotY = 0, s = 1, abre = 1 }) => {
  const hexGeo = useMemo(() => new THREE.CylinderGeometry(0.13, 0.13, 0.03, 6), []);
  if (s <= 0.002) return null;
  const k = ease.out(clamp01(abre));
  const ouro = lisoMat("#f3c03a", 0.18, 0.85);
  const W = 0.13 * Math.sqrt(3);
  const hexes: [number, number][] = [];
  // anel 1 (6) + anel 2 (12) em volta de um centro vazio (como no Webb)
  for (let q = -2; q <= 2; q++)
    for (let r = -2; r <= 2; r++) {
      const s3 = -q - r;
      const d = Math.max(Math.abs(q), Math.abs(r), Math.abs(s3));
      if (d === 0 || d > 2) continue;
      hexes.push([W * (q + r / 2), 0.13 * 1.5 * r]);
    }
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      {/* escudo térmico (5 camadas em losango) */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.1 + i * 0.035, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} scale={[1.6 * k, 1.0 * k, 1]} material={lisoMat(i % 2 ? "#b58cff" : "#d9c2ff", 0.4, 0.3, 0.95)}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
      {/* espelho primário */}
      <group position={[0, 0.95, 0]} rotation={[-0.25, 0, 0]}>
        {hexes.map(([x, y], i) => (
          <mesh key={i} geometry={hexGeo} position={[x * k, y * k, 0]} rotation={[Math.PI / 2, 0, Math.PI / 6]} castShadow material={ouro} />
        ))}
        <B s={[0.12, 0.12, 0.08]} p={[0, 0, -0.06]} cor="#2a2f3a" />
        {/* secundário e tripé */}
        {[0, 2.1, 4.2].map((a) => (
          <mesh key={a} position={[Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0.32]} rotation={[0.35 * Math.sin(a), -0.35 * Math.cos(a), 0]} material={lisoMat("#2a2f3a", 0.5)}>
            <cylinderGeometry args={[0.008, 0.008, 0.7, 6]} />
          </mesh>
        ))}
        <mesh position={[0, 0, 0.64]} rotation={[Math.PI / 2, 0, 0]} material={ouro}>
          <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
        </mesh>
      </group>
      <B s={[0.08, 0.6, 0.08]} p={[0, 0.5, -0.15]} cor="#2a2f3a" />
    </group>
  );
};

/** Céu estrelado determinístico (esferinhas espalhadas numa casca ao redor de `centro`). */
export const Estrelas: React.FC<{ centro?: V3; n?: number; raio?: number }> = ({ centro = [0, 0, 0], n = 220, raio = 18 }) => {
  const pts = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const u = hash(i * 3 + 1) * 2 - 1;
        const a = hash(i * 3 + 2) * Math.PI * 2;
        const r = raio * (0.7 + hash(i * 3 + 3) * 0.3);
        const sq = Math.sqrt(1 - u * u);
        return [Math.cos(a) * sq * r, Math.abs(u) * r * 0.8 + 0.5, -Math.abs(Math.sin(a) * sq * r)] as V3;
      }),
    [n, raio],
  );
  return (
    <group position={centro}>
      {pts.map((p0, i) => (
        <mesh key={i} position={p0} material={luzMat(i % 7 === 0 ? "#ffe9b0" : "#ffffff", 1.5 + hash(i) * 2)}>
          <sphereGeometry args={[0.025 + hash(i + 9) * 0.035, 5, 4]} />
        </mesh>
      ))}
    </group>
  );
};

/** Terra pequena (oceano + manchas de continente). */
export const Terra: React.FC<{ p?: V3; s?: number; t?: number }> = ({ p: pos = [0, 0, 0], s = 1, t = 0 }) => (
  <group position={pos} scale={s} rotation={[0.3, t * 0.2, 0]}>
    <mesh material={lisoMat("#2f6fd6", 0.5)}>
      <sphereGeometry args={[0.5, 32, 24]} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => {
      const a = hash(i) * Math.PI * 2;
      const b = (hash(i + 4) - 0.5) * 2.2;
      return (
        <mesh key={i} position={[Math.cos(a) * Math.cos(b) * 0.47, Math.sin(b) * 0.47, Math.sin(a) * Math.cos(b) * 0.47]} scale={[1, 0.6, 1]} material={lisoMat("#3fa14a", 0.7)}>
          <sphereGeometry args={[0.1 + hash(i + 2) * 0.08, 10, 8]} />
        </mesh>
      );
    })}
  </group>
);
