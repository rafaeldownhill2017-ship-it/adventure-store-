import { Environment, Lightformer } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, HueSaturation, N8AO, TiltShift2, Vignette } from "@react-three/postprocessing";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { H, W } from "../brand";
import type { CamPose } from "./camera";

// Palco do "mundo contínuo" (formato "como funciona"): céu azul, sol que acompanha o ponto de vista
// (sombras nítidas em qualquer estação do mapa) e pouco desfoque de miniatura.
// QUALIDADE=leve (env do render): efeitos mais baratos para máquinas sem placa de vídeo.
const QUAL = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.QUALIDADE;
const LEVE = QUAL === "leve" || QUAL === "minima";
const SEM_AO = QUAL === "minima";

export const MUNDO = { ceu: "#a9d6f2", grama: "#86c06a", asfalto: "#8f949a", terra: "#b98a5e" };

const Cam: React.FC<CamPose> = ({ pos, look, fov = 32 }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const dx = Math.sin(t * 0.6) * 0.02;
  const dy = Math.sin(t * 0.8 + 1) * 0.015;
  useLayoutEffect(() => {
    camera.position.set(pos[0] + dx, pos[1] + dy, pos[2]);
    camera.fov = fov;
    camera.lookAt(look[0], look[1], look[2]);
    camera.updateProjectionMatrix();
  });
  return null;
};

const Sol: React.FC<{ alvo: [number, number, number]; cor: string; intensidade: number }> = ({ alvo, cor, intensidade }) => {
  const luz = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const l = luz.current;
    if (!l) return;
    l.position.set(alvo[0] + 6, 11, alvo[2] + 5);
    l.target.position.set(alvo[0], 0, alvo[2]);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight
      ref={luz}
      intensity={intensidade}
      color={cor}
      castShadow
      shadow-mapSize={LEVE ? [1024, 1024] : [2048, 2048]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
      shadow-radius={4}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-near={1}
      shadow-camera-far={40}
    />
  );
};

export const StageMundo: React.FC<{ cam: CamPose; children: React.ReactNode; ceu?: string; sol?: string; luz?: number; miniatura?: number; saturacao?: number; neblina?: [number, number] }> = ({
  cam,
  children,
  ceu = MUNDO.ceu,
  sol = "#fff4dc",
  luz = 2.7,
  miniatura = 0.35,
  saturacao = 0.05,
  neblina = [18, 55],
}) => (
  <ThreeCanvas
    width={W}
    height={H}
    shadows
    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05, preserveDrawingBuffer: true }}
    dpr={1}
    camera={{ fov: 32, near: 0.1, far: 200 }}
  >
    <color attach="background" args={[ceu]} />
    <fog attach="fog" args={[ceu, neblina[0], neblina[1]]} />
    <Cam {...cam} />
    <hemisphereLight args={["#f4fbff", "#6d9a52", 1.2]} />
    <ambientLight intensity={0.22} />
    <Sol alvo={cam.look} cor={sol} intensidade={luz} />
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={2} position={[0, 6, -6]} scale={[14, 5, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={1} position={[-7, 2, 3]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#e3f1ff" />
    </Environment>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.001, 0]}>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color={MUNDO.grama} roughness={0.95} />
    </mesh>
    {children}
    <EffectComposer multisampling={LEVE ? 0 : 4}>
      {SEM_AO ? <></> : <N8AO aoRadius={0.5} intensity={1.8} distanceFalloff={0.6} quality={LEVE ? "performance" : "high"} />}
      <TiltShift2 blur={0.12 * miniatura} taper={0.6} start={[0, 0.45]} end={[1, 0.45]} samples={LEVE ? 5 : 10} />
      <Bloom intensity={0.2} luminanceThreshold={0.92} mipmapBlur />
      <HueSaturation saturation={saturacao} />
      <Vignette offset={0.3} darkness={0.3} />
    </EffectComposer>
  </ThreeCanvas>
);
