import React from "react";
import * as THREE from "three";
import { C, FONT, H, W } from "../brand";
import type { CamPose } from "./camera";

// Camada de rótulos "presos ao mundo, desenhados na tela" (regra de enquadramento, docs/playbook.md).
// O ponto vem do 3D; o rótulo é HTML, preso a uma margem segura, fora da faixa da legenda central,
// sem sobrepor outro rótulo; se o ponto sai do quadro, o rótulo some em vez de aparecer cortado.
type V3 = [number, number, number];
export type Rotulo = {
  p: V3;
  s: number;
  /** chip: uma linha; card: título + valor grande */
  tipo?: "chip" | "card";
  txt: string;
  titulo?: string;
  cor?: string;
  tinta?: string;
  tam?: number;
};

export const MARGEM = 56;
export const FAIXA_LEGENDA: [number, number] = [1215, 1420];

const projetor = new THREE.PerspectiveCamera(32, W / H, 0.1, 200);

const medir = (r: Rotulo) => {
  const k = r.tam ?? 1;
  if (r.tipo === "card") {
    const fonte = 70 * k;
    const larg = Math.max(r.txt.length * fonte * 0.56, (r.titulo?.length ?? 0) * 30 * k * 0.62) + 64 * k;
    return { larg, alt: 172 * k, fonte };
  }
  const alt = 76 * k;
  const fonte = alt * 0.5;
  return { larg: r.txt.length * fonte * 0.58 + alt * 0.9, alt, fonte };
};

export const TelaSegura: React.FC<{ itens: Rotulo[]; cam: CamPose }> = ({ itens, cam }) => {
  projetor.fov = cam.fov ?? 32;
  projetor.position.set(...cam.pos);
  projetor.lookAt(...cam.look);
  projetor.updateMatrixWorld();
  projetor.updateProjectionMatrix();
  const caixas: { r: Rotulo; x: number; y: number; larg: number; alt: number; fonte: number }[] = [];
  for (const r of itens) {
    if (r.s <= 0.02) continue;
    const v = new THREE.Vector3(...r.p).project(projetor);
    if (v.z > 1 || Math.abs(v.x) > 1.12 || Math.abs(v.y) > 1.12) continue;
    const m = medir(r);
    const larg = Math.min(W - 2 * MARGEM, m.larg);
    let x = ((v.x + 1) / 2) * W;
    let y = ((1 - v.y) / 2) * H;
    x = Math.min(W - MARGEM - larg / 2, Math.max(MARGEM + larg / 2, x));
    y = Math.min(H - MARGEM - m.alt / 2, Math.max(MARGEM + m.alt / 2, y));
    if (y + m.alt / 2 > FAIXA_LEGENDA[0] && y - m.alt / 2 < FAIXA_LEGENDA[1]) y = FAIXA_LEGENDA[0] - m.alt / 2 - 8;
    caixas.push({ r, x, y, larg, alt: m.alt, fonte: m.fonte });
  }
  // separa rótulos que se encostam (empurra o de cima para cima)
  for (let it = 0; it < 6; it++)
    for (let i = 0; i < caixas.length; i++)
      for (let j = i + 1; j < caixas.length; j++) {
        const a = caixas[i];
        const b = caixas[j];
        const sx = (a.larg + b.larg) / 2 + 14 - Math.abs(a.x - b.x);
        const sy = (a.alt + b.alt) / 2 + 12 - Math.abs(a.y - b.y);
        if (sx > 0 && sy > 0) {
          const [cima, baixo] = a.y <= b.y ? [a, b] : [b, a];
          cima.y = Math.max(MARGEM + cima.alt / 2, cima.y - sy / 2);
          baixo.y = baixo.y + sy / 2;
          if (baixo.y + baixo.alt / 2 > FAIXA_LEGENDA[0] && baixo.y - baixo.alt / 2 < FAIXA_LEGENDA[1]) baixo.y = FAIXA_LEGENDA[1] + baixo.alt / 2 + 8;
        }
      }
  return (
    <>
      {caixas.map(({ r, x, y, larg, alt, fonte }, i) => {
        const k = r.tam ?? 1;
        const sc = 0.82 + 0.18 * Math.min(1, r.s);
        const comum: React.CSSProperties = {
          position: "absolute",
          left: x - larg / 2,
          top: y - alt / 2,
          width: larg,
          height: alt,
          background: r.cor ?? C.paper,
          color: r.tinta ?? C.ink,
          fontFamily: FONT,
          boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
          opacity: Math.min(1, r.s * 2.5),
          transform: `scale(${sc})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          whiteSpace: "nowrap",
        };
        if (r.tipo === "card")
          return (
            <div key={i} style={{ ...comum, borderRadius: 34 * k, flexDirection: "column", gap: 4 * k }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 * k, fontSize: 30 * k, fontWeight: 700, letterSpacing: "0.04em", opacity: 0.8 }}>
                {r.titulo}
              </div>
              <div style={{ fontSize: fonte, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{r.txt}</div>
            </div>
          );
        return (
          <div key={i} style={{ ...comum, borderRadius: alt / 2, gap: 14 * k, fontSize: fonte, fontWeight: 800, letterSpacing: "-0.01em" }}>
            {r.txt}
          </div>
        );
      })}
    </>
  );
};
