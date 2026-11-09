import { useGLTF } from "@react-three/drei";
import React, { useLayoutEffect, useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

// Modelos Kenney (CC0) em public/models. Licenças em public/models/LICENSES-kenney.txt.
// Cada modelo é normalizado pela caixa envolvente: apoiado no chão, centrado em XZ e escalado para um tamanho-alvo.
type V3 = [number, number, number];
export const MODELO = (caminho: string) => staticFile(`models/${caminho}.glb`);

type Alvo = { altura?: number; comp?: number; largura?: number; escala?: number };

const normalizar = (obj: THREE.Object3D, alvo: Alvo) => {
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj, true);
  const tam = box.getSize(new THREE.Vector3());
  const s = alvo.escala ?? (alvo.altura ? alvo.altura / tam.y : alvo.comp ? alvo.comp / Math.max(tam.x, tam.z) : alvo.largura ? alvo.largura / tam.x : 1);
  const centro = box.getCenter(new THREE.Vector3());
  return { s, off: [-centro.x * s, -box.min.y * s, -centro.z * s] as V3 };
};

const sombras = (obj: THREE.Object3D) =>
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
      m.frustumCulled = false;
    }
  });

/** Modelo estático (prédios, carros, móveis, natureza). */
export const Modelo: React.FC<{ url: string; p?: V3; rotY?: number; alvo: Alvo; s?: number; tinta?: string }> = ({ url, p = [0, 0, 0], rotY = 0, alvo, s = 1, tinta }) => {
  const gltf = useGLTF(MODELO(url));
  const { obj, n } = useMemo(() => {
    const o = gltf.scene.clone(true);
    if (tinta)
      o.traverse((m) => {
        const mesh = m as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
          (mesh.material as THREE.MeshStandardMaterial).color.multiply(new THREE.Color(tinta));
        }
      });
    sombras(o);
    return { obj: o, n: normalizar(o, alvo) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, tinta, alvo.altura, alvo.comp, alvo.largura, alvo.escala]);
  if (s <= 0.002) return null;
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={s}>
      <primitive object={obj} position={n.off} scale={n.s} />
    </group>
  );
};

/** Personagem Kenney animado. A animação é posicionada por tempo (mixer.setTime), então o render é determinístico. */
export const Boneco: React.FC<{ url: string; p: V3; rotY?: number; altura?: number; anim: string; tAnim: number; s?: number }> = ({ url, p, rotY = 0, altura = 0.55, anim, tAnim, s = 1 }) => {
  const gltf = useGLTF(MODELO(url));
  const { obj, n, mixer } = useMemo(() => {
    const o = cloneSkinned(gltf.scene);
    sombras(o);
    const nn = normalizar(o, { altura });
    return { obj: o, n: nn, mixer: new THREE.AnimationMixer(o) };
  }, [gltf, altura]);
  useLayoutEffect(() => {
    const clip = gltf.animations.find((a) => a.name === anim) ?? gltf.animations.find((a) => a.name === "idle");
    if (!clip) return;
    mixer.stopAllAction();
    const act = mixer.clipAction(clip);
    act.reset().play();
    mixer.setTime(Math.max(0, tAnim) % clip.duration);
  });
  if (s <= 0.002) return null;
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={s}>
      <primitive object={obj} position={n.off} scale={n.s} />
    </group>
  );
};

/**
 * Ação de um Ator: a partir de `de` (segundos do filme), toca `anim`.
 * Gestos (emote-yes, emote-no, jump, pick-up, interact-*, attack-*, die...) tocam uma vez, do começo,
 * e voltam sozinhos para `depois` (padrão "idle"); andar/correr/idle repetem. `vel` acelera ou desacelera.
 */
export type Acao = { de: number; anim: string; vel?: number; vezes?: number; depois?: string };
const REPETE = new Set(["idle", "walk", "sprint", "sit", "crouch", "drive", "static", "holding-right", "holding-left", "holding-both"]);
const FADE = 0.22;

type Faixa = { de: number; anim: string; vel: number; repete: boolean; segura: boolean };

/** Expande as ações em faixas contínuas: cada gesto ganha a volta automática ao repouso. */
const faixas = (acoes: Acao[], dur: (a: string) => number): Faixa[] => {
  const ord = [...acoes].sort((a, b) => a.de - b.de);
  const out: Faixa[] = [];
  ord.forEach((a, i) => {
    const vel = a.vel ?? 1;
    const repete = REPETE.has(a.anim);
    out.push({ de: a.de, anim: a.anim, vel, repete, segura: a.anim === "die" });
    if (!repete && a.anim !== "die") {
      const fim = a.de + (dur(a.anim) * (a.vezes ?? 1)) / vel;
      const prox = ord[i + 1]?.de ?? Infinity;
      if (fim < prox) out.push({ de: fim, anim: a.depois ?? "idle", vel: 1, repete: true, segura: false });
    }
  });
  return out;
};

/**
 * Personagem com roteiro de ações ancoradas no tempo: transição suave (crossfade) entre animações,
 * gestos que começam do início e "pulinho" de entrada. Determinístico (tudo derivado de t).
 */
export const Ator: React.FC<{
  url: string;
  p: V3;
  rotY?: number;
  altura?: number;
  t: number;
  acoes: Acao[];
  s?: number;
  /** instante em que o ator "entra" (pulinho + escala); omita para já estar em cena */
  entra?: number;
  /** defasagem para multidões não ficarem sincronizadas */
  fase?: number;
}> = ({ url, p, rotY = 0, altura = 0.55, t, acoes, s = 1, entra, fase = 0 }) => {
  const gltf = useGLTF(MODELO(url));
  const { obj, n, mixer } = useMemo(() => {
    const o = cloneSkinned(gltf.scene);
    sombras(o);
    const nn = normalizar(o, { altura });
    return { obj: o, n: nn, mixer: new THREE.AnimationMixer(o) };
  }, [gltf, altura]);
  const clip = (nome: string) => gltf.animations.find((a) => a.name === nome) ?? gltf.animations.find((a) => a.name === "idle")!;
  const lista = faixas(acoes.length ? acoes : [{ de: 0, anim: "idle" }], (a) => clip(a).duration);
  let k = lista.findIndex((f, i) => t >= f.de && t < (lista[i + 1]?.de ?? Infinity));
  if (k < 0) k = 0;
  const atual = lista[k];
  const ant = lista[k - 1];
  const w = ant ? Math.min(1, Math.max(0, (t - atual.de) / FADE)) : 1;
  const tempo = (f: Faixa) => {
    const d = clip(f.anim).duration;
    const x = Math.max(0, t - f.de) * f.vel + (f.repete ? fase : 0);
    return f.repete ? x % d : Math.min(x, d - 1e-3) % d;
  };
  useLayoutEffect(() => {
    mixer.stopAllAction();
    const usa = (f: Faixa, peso: number) => {
      if (peso <= 0.001) return;
      const act = mixer.clipAction(clip(f.anim));
      act.reset();
      act.enabled = true;
      act.setEffectiveWeight(peso);
      act.play();
      act.time = tempo(f);
    };
    if (ant && w < 1) usa(ant, 1 - w);
    usa(atual, w);
    mixer.update(0);
  });
  // entrada: escala com sobra + pulinho
  let esc = s;
  let y = 0;
  if (entra !== undefined) {
    const e = Math.min(1, Math.max(0, (t - entra) / 0.35));
    if (t < entra) return null;
    esc = s * (e < 1 ? 0.6 + 0.4 * (1 - Math.pow(1 - e, 3)) + Math.sin(e * Math.PI) * 0.12 : 1);
    y = Math.sin(Math.min(1, e) * Math.PI) * 0.12;
  }
  if (esc <= 0.002) return null;
  return (
    <group position={[p[0], p[1] + y, p[2]]} rotation={[0, rotY, 0]} scale={esc}>
      <primitive object={obj} position={n.off} scale={n.s} />
    </group>
  );
};

export const precarregar = (urls: string[]) => urls.forEach((u) => useGLTF.preload(MODELO(u)));
