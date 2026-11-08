import { ease, clamp01, lerp } from "./time";

export type V3 = [number, number, number];
export type CamPose = { pos: V3; look: V3; fov?: number; roll?: number };
/** Keyframe de câmera: [tempo em s, posição, alvo do olhar, fov]. */
export type Key = [number, V3, V3, number?];

const mix3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

/**
 * Câmera por keyframes. Dois keyframes seguidos com a MESMA posição são um "segurar"; dois com
 * posições diferentes são um voo suave (ease in-out). Para um corte seco, repita o tempo:
 * [T, posA, olharA], [T, posB, olharB]. É assim que a câmera "viaja" entre as estações do mapa.
 */
export const camPorKeys = (t: number, K: Key[]): CamPose => {
  let cam: CamPose = { pos: K[0][1], look: K[0][2], fov: K[0][3] ?? 34 };
  for (let i = 0; i < K.length - 1; i++) {
    const [ta, pa, la, fa = 34] = K[i];
    const [tb, pb, lb, fb = 34] = K[i + 1];
    if (t >= ta && t < tb) {
      const k = ease.inOut(clamp01((t - ta) / Math.max(0.001, tb - ta)));
      cam = { pos: mix3(pa, pb, k), look: mix3(la, lb, k), fov: lerp(fa, fb, k) };
    }
  }
  const u = K[K.length - 1];
  if (t >= u[0]) cam = { pos: u[1], look: u[2], fov: u[3] ?? 34 };
  return cam;
};
