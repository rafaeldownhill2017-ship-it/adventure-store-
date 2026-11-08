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

export const precarregar = (urls: string[]) => urls.forEach((u) => useGLTF.preload(MODELO(u)));
