import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Modelo, precarregar } from "../lib/kenney";
import { Carimbo, CardNumero, corBloco, Fabrica, PalcoCor, Pedestal, PilhaMoedas, PlanoTexto, TOPO_PEDESTAL } from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · picape1 · "A picape feita no Brasil sai mais barata na Argentina" (BR × AR × PY, preços de TABELA).
// Dados: docs/dossies/picape1.md. Picape GENÉRICA feita em código (sem logo/grade da montadora).
precarregar(["natureza/tree_oak", "natureza/tree_default"]);

const FA: V3 = [0, 0, 0];
const BRp: V3 = [25, 0, 0];
const AR: V3 = [50, 0, 0];
const PY: V3 = [75, 0, 0];
const CO: V3 = [100, 0, 0];
const FI: V3 = [125, 0, 0];
const DESTAQUE = /Brasil|Argentina|Sério|S10|High|Country|tabela|trezentos|duzentos|Paraguai|cinquenta|sessenta|fabrica|porra|imposto|margem|Comenta|manda/i;

/** Picape genérica cabine dupla. Comprimento ~1.0 com s=1, frente para +x. */
const Picape: React.FC<{ p: V3; rotY?: number; s?: number; cor?: string; roda?: number }> = ({ p: pos, rotY = 0, s = 1, cor = "#c8302c", roda = 0 }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[1.0, 0.16, 0.46]} p={[0, 0.2, 0]} cor={cor} />
      <B s={[0.5, 0.2, 0.44]} p={[0.08, 0.38, 0]} cor={cor} />
      <B s={[0.44, 0.13, 0.45]} p={[0.08, 0.39, 0]} cor="#2a3440" />
      <B s={[0.4, 0.03, 0.42]} p={[-0.28, 0.28, 0]} cor="#2a2f3a" />
      <B s={[0.36, 0.1, 0.03]} p={[-0.3, 0.33, 0.215]} cor={cor} />
      <B s={[0.36, 0.1, 0.03]} p={[-0.3, 0.33, -0.215]} cor={cor} />
      <B s={[0.03, 0.12, 0.46]} p={[-0.49, 0.32, 0]} cor={cor} />
      <B s={[0.02, 0.06, 0.38]} p={[0.505, 0.22, 0]} cor="#1d1d1d" />
      {[-0.15, 0.15].map((z) => (
        <mesh key={z} position={[0.505, 0.24, z]}>
          <boxGeometry args={[0.012, 0.035, 0.08]} />
          <meshStandardMaterial color="#fff6d8" emissive="#fff3c4" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      ))}
      <B s={[1.02, 0.05, 0.47]} p={[0, 0.13, 0]} cor="#2a2f3a" />
      {[-0.3, 0.32].map((x) =>
        [-0.23, 0.23].map((z) => (
          <group key={`${x}${z}`} position={[x, 0.13, z]} rotation={[Math.PI / 2, roda, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.13, 0.13, 0.09, 18]} />
              <meshStandardMaterial color="#1c2026" roughness={0.7} />
            </mesh>
            <mesh>
              <cylinderGeometry args={[0.055, 0.055, 0.085, 12]} />
              <meshStandardMaterial color="#b8bec7" roughness={0.3} metalness={0.6} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
};

/** Bandeira (mastro + pano com leve ondulação). Desenhada em código: BR, AR, PY. */
const Bandeira: React.FC<{ p: V3; pais: "BR" | "AR" | "PY"; s?: number; t?: number }> = ({ p: pos, pais, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  const onda = Math.sin(t * 3) * 0.08;
  const pano =
    pais === "BR" ? (
      <>
        <B s={[0.5, 0.34, 0.01]} cor="#1f9a4a" />
        <mesh position={[0, 0, 0.007]} rotation={[0, 0, Math.PI / 4]} scale={[1.45, 1, 1]}>
          <planeGeometry args={[0.2, 0.2]} />
          <meshStandardMaterial color="#ffd23a" side={2} />
        </mesh>
        <mesh position={[0, 0, 0.009]}>
          <circleGeometry args={[0.075, 24]} />
          <meshStandardMaterial color="#1f3c8a" side={2} />
        </mesh>
      </>
    ) : pais === "AR" ? (
      <>
        <B s={[0.5, 0.113, 0.01]} p={[0, 0.113, 0]} cor="#74acdf" />
        <B s={[0.5, 0.114, 0.01]} p={[0, 0, 0]} cor="#ffffff" />
        <B s={[0.5, 0.113, 0.01]} p={[0, -0.113, 0]} cor="#74acdf" />
        <mesh position={[0, 0, 0.007]}>
          <circleGeometry args={[0.035, 16]} />
          <meshStandardMaterial color="#f6b40e" side={2} />
        </mesh>
      </>
    ) : (
      <>
        <B s={[0.5, 0.113, 0.01]} p={[0, 0.113, 0]} cor="#d52b1e" />
        <B s={[0.5, 0.114, 0.01]} p={[0, 0, 0]} cor="#ffffff" />
        <B s={[0.5, 0.113, 0.01]} p={[0, -0.113, 0]} cor="#0038a8" />
      </>
    );
  return (
    <group position={pos} scale={s}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.2, 10]} />
        <meshStandardMaterial color="#d7dbe0" metalness={0.5} roughness={0.3} />
      </mesh>
      <group position={[0.26, 1.0, 0]} rotation={[0, onda, Math.sin(t * 2.3) * 0.03]}>
        {pano}
      </group>
    </group>
  );
};

/** Concessionária: vitrine com toldo e letreiro. Largura ~1.8 com s=1. */
const Concessionaria: React.FC<{ p: V3; s?: number; txt: string; cor?: string }> = ({ p: pos, s = 1, txt, cor = "#1d2f5c" }) => (
  <group position={pos} scale={s}>
    <B s={[1.9, 1.05, 0.5]} p={[0, 0.52, -0.3]} cor="#eef0f2" />
    <B s={[1.6, 0.7, 0.02]} p={[0, 0.42, -0.04]} cor="#9cc3dc" />
    {[-0.8, -0.27, 0.27, 0.8].map((x) => (
      <B key={x} s={[0.04, 0.72, 0.04]} p={[x, 0.42, -0.02]} cor="#2a2f3a" />
    ))}
    <B s={[1.95, 0.24, 0.06]} p={[0, 1.0, -0.02]} cor={cor} />
    <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo={null} tam={[1.7, 0.18]} p={[0, 1.0, 0.012]} px={[900, 96]} />
  </group>
);

/** Caminhão-cegonha simples: cavalo + carreta com uma picape em cima. Frente para +x. */
const Cegonha: React.FC<{ p: V3; s?: number; t: number }> = ({ p: pos, s = 1, t }) => (
  <group position={pos} scale={s}>
    <B s={[0.42, 0.42, 0.5]} p={[0.95, 0.33, 0]} cor="#c8262c" />
    <B s={[0.18, 0.2, 0.46]} p={[1.08, 0.46, 0]} cor="#2a3440" />
    <B s={[1.3, 0.06, 0.5]} p={[0.05, 0.3, 0]} cor="#3a3f4a" />
    <B s={[1.3, 0.04, 0.5]} p={[0.05, 0.72, 0]} cor="#7a808a" />
    {[-0.55, 0.65].map((x) => (
      <B key={x} s={[0.04, 0.42, 0.04]} p={[x, 0.51, 0.23]} cor="#7a808a" />
    ))}
    {[-0.4, 0.0, 0.95].map((x) =>
      [-0.24, 0.24].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.12, z]} rotation={[Math.PI / 2, t * 6, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#1c2026" />
        </mesh>
      )),
    )}
    <Picape p={[-0.05, 0.33, 0]} s={0.75} roda={t * 6} />
    <Picape p={[0.05, 0.74, 0]} s={0.75} cor="#c9cdd3" roda={t * 6} />
  </group>
);

/** Placa de duas setas: IMPOSTO ← → MARGEM. */
const PlacaEscolha: React.FC<{ p: V3; s?: number; k: number; lado: number }> = ({ p: pos, s = 1, k, lado }) => {
  const e = s * ease.back(clamp01(k));
  if (e <= 0.002) return null;
  return (
    <group position={pos} scale={e}>
      <B s={[0.05, 1.2, 0.05]} p={[0, 0.6, 0]} cor="#2a2f3a" />
      <group position={[-0.42, 1.05, 0]} rotation={[0, 0, lado < 0 ? Math.sin(lado * 20) * 0.04 : 0]}>
        <B s={[0.8, 0.22, 0.04]} cor={lado < 0 ? "#ffcf3a" : "#c8262c"} />
        <PlanoTexto linhas={[["◀ IMPOSTO", 1, lado < 0 ? "#14211d" : "#ffffff"]]} fundo={null} tam={[0.74, 0.17]} p={[0, 0, 0.022]} px={[600, 136]} />
      </group>
      <group position={[0.42, 0.78, 0]}>
        <B s={[0.8, 0.22, 0.04]} cor={lado > 0 ? "#ffcf3a" : "#1d3c7a"} />
        <PlanoTexto linhas={[["MARGEM ▶", 1, lado > 0 ? "#14211d" : "#ffffff"]]} fundo={null} tam={[0.74, 0.17]} p={[0, 0, 0.022]} px={[600, 136]} />
      </group>
    </group>
  );
};

export const Picape1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.tabela - 0.4; // "Aqui, a tabela"
  const T2 = c.argentina2 - 0.6; // "Na Argentina, o preço de lista"
  const T3 = c.paraguai - 0.6; // "No Paraguai"
  const T4 = c.ouSeja - 0.35; // "Ou seja"
  const T5 = c.fala - 0.6; // "Mas me fala"

  // tremida no "porra" (câmera), congelamento no "Sério"
  const treme = t > c.como && t < c.porra + 0.9 ? Math.sin(t * 60) * 0.03 * (1 - clamp01((t - c.porra) / 0.9)) : 0;
  const congela = t >= c.serio - 0.1 && t < c.serio + 0.7;

  const blocos: [number, V3, V3, V3][] = [
    [0, FA, [FA[0] - 0.55, 0.8, 3.2], [FA[0] - 0.6, 0.3, 0.25]],
    [2.4, FA, [FA[0], 1.4, 5.6], [FA[0], 0.4, 0]],
    [T1, BRp, [BRp[0], 1.4, 5.6], [BRp[0], 0.5, 0]],
    [T2, AR, [AR[0], 1.4, 5.6], [AR[0], 0.45, 0]],
    [T3, PY, [PY[0], 1.6, 6.6], [PY[0], 0.5, 0]],
    [T4, CO, [CO[0], 1.05, 6.8], [CO[0], 0.4, 0]],
    [T5, FI, [FI[0], 1.4, 5.9], [FI[0], 0.75, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    if (i === 0) return;
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const cam0 = camPorKeys(t, K);
  const cam = { ...cam0, pos: [cam0.pos[0] + treme, cam0.pos[1] + treme * 0.6, cam0.pos[2]] as V3 };
  const cor = corBloco(
    t,
    [
      [0, "#2f6fae"],
      [T1, "#1f7a4a"],
      [T2, "#4f8fc8"],
      [T3, "#a8332e"],
      [T4, "#2a2f44"],
      [T5, "#3a3a4a"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const j = i === 0 ? 0 : i + 1;
    const t0 = blocos[j][0];
    const prox = i === 0 ? 2 : j + 1;
    const t1 = prox < blocos.length ? blocos[prox][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };
  const tSai = congela ? c.serio - 0.1 : t; // a picape para no "Sério"
  const xSai = lerp(-0.55, 0.25, p(tSai, 1.6, 3.0, ease.inOut));

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.4}>
        {/* FÁBRICA: São José dos Campos */}
        {em(0) ? (
          <group position={FA}>
            <Fabrica p={[-0.3, 0, -1.2]} s={0.62} cor="#e2ddd2" placa="SÃO JOSÉ DOS CAMPOS · SP" t={t} />
            <Bandeira p={[-0.9, 0, -0.35]} pais="BR" s={0.9 * mola(0.2, 220, 12)} t={t} />
            <B s={[3.0, 0.012, 0.6]} p={[0, 0.006, 0.25]} cor="#3a3f4a" />
            <Picape p={[xSai, 0.012, 0.25]} rotY={-0.35} s={0.8} roda={congela ? 0 : tSai * 5} />
            {t >= c.argentina - 0.2 ? <Bandeira p={[0.55, 0, -0.45]} pais="AR" s={0.9 * mola(c.argentina - 0.2, 220, 12)} t={t} /> : null}
          </group>
        ) : null}

        {/* BRASIL: tabela 2027 */}
        {em(1) ? (
          <group position={BRp}>
            <Pedestal raio={0.75} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.7) * 0.35 - 0.5, 0]}>
              <Picape p={[0, TOPO_PEDESTAL, 0]} s={1.05 * mola(T1 + 0.1, 220, 12)} />
            </group>
            <Bandeira p={[-0.75, 0, -0.55]} pais="BR" s={0.8} t={t} />
          </group>
        ) : null}

        {/* ARGENTINA: cegonha chega na concessionária */}
        {em(2) ? (
          <group position={AR}>
            <Concessionaria p={[0.32, 0, -1.0]} s={0.8} txt="CONCESIONARIA" cor="#3a78b8" />
            <Bandeira p={[-0.82, 0, -0.65]} pais="AR" s={0.8} t={t} />
            <B s={[4, 0.012, 0.75]} p={[0, 0.006, 0.45]} cor="#3a3f4a" />
            <Cegonha p={[lerp(-2.8, -0.45, p(t, T2, 2.4, ease.out)), 0.012, 0.45]} s={0.85} t={t < T2 + 2.4 ? t : T2 + 2.4} />
          </group>
        ) : null}

        {/* PARAGUAI: concessionária anuncia a linha 2025 */}
        {em(3) ? (
          <group position={PY}>
            <Concessionaria p={[0.3, 0, -1.0]} s={0.75} txt="CONCESIONARIA" cor="#a8332e" />
            <Bandeira p={[-0.78, 0, -0.6]} pais="PY" s={0.8} t={t} />
            <Pedestal p={[0.15, 0, 0.2]} raio={0.6} aro="#ffcf3a" acende={p(t, c.cinquenta - 0.2, 0.5)} />
            <Picape p={[0.15, TOPO_PEDESTAL, 0.2]} rotY={-0.45} s={0.95 * mola(T3 + 0.2, 220, 12)} />
          </group>
        ) : null}

        {/* COMPARAÇÃO: as três lado a lado; a do Brasil com a pilha mais alta */}
        {em(4) ? (
          <group position={CO}>
            {(
              [
                ["BR", -0.6, 14, "#1f7a4a"],
                ["AR", 0, 11, "#4f8fc8"],
                ["PY", 0.6, 12, "#a8332e"],
              ] as const
            ).map(([pais, x, alt, aro], i) => (
              <group key={pais} position={[x, 0, 0]}>
                <Pedestal raio={0.32} aro={aro} acende={1} s={mola(T4 + 0.1 + i * 0.1, 220, 12)} />
                <Picape p={[0, TOPO_PEDESTAL, 0.05]} rotY={-0.6} s={0.48 * mola(T4 + 0.15 + i * 0.1, 220, 12)} cor="#c8302c" />
                <PilhaMoedas p={[0.13, TOPO_PEDESTAL, -0.24]} k={p(t, c.sessenta - 0.4 + i * 0.1, 1.2)} max={alt} s={1.0} />
                <PlanoTexto linhas={[[["BRASIL", "ARGENTINA", "PARAGUAI"][i], 1, "#ffffff"]]} fundo={aro} tam={[0.56, 0.15]} p={[0, 0.12, 0.34]} px={[480, 128]} />
              </group>
            ))}
          </group>
        ) : null}

        {/* FECHO: imposto ou margem? */}
        {em(5) ? (
          <group position={FI}>
            <PlacaEscolha p={[0, 0, -0.3]} s={1.05} k={p(t, T5 + 0.2, 0.6, (x) => x)} lado={t >= c.margem2 ? 1 : t >= c.imposto2 ? -1 : 0} />
            <Picape p={[0.1, 0, 0.35]} rotY={-0.5} s={0.75 * mola(T5 + 0.1, 220, 12)} />
            <Modelo url="natureza/tree_oak" p={[-1.05, 0, -0.6]} alvo={{ altura: 0.8 }} />
            <Modelo url="natureza/tree_default" p={[1.05, 0, -0.7]} alvo={{ altura: 0.8 }} />
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.argentina - 0.45} titulo="FEITA NO BRASIL · SÃO JOSÉ DOS CAMPOS" valor="mais barata onde?" cor={C.destaque} />
      <CardNumero t={t} de={c.argentina - 0.25} ate={c.serio - 0.15} titulo="ONDE ELA SAI MAIS BARATA" valor="na Argentina" />
      <Carimbo t={t} de={c.serio - 0.05} ate={c.high - 0.5} txt="SÉRIO?!" />
      <CardNumero t={t} de={c.high - 0.3} ate={T1 - 0.4} titulo="A PICAPE" valor="S10 High Country" />
      <CardNumero t={t} de={T1 + 0.1} ate={T2 - 0.4} titulo="BRASIL · TABELA LINHA 2027" valor="R$ 348.790" cor={C.destaque} />
      <CardNumero t={t} de={T2 + 0.1} ate={c.duzentos - 0.45} titulo="ARGENTINA · LISTA NOV/2026" valor="$ 75,7 mi (pesos)" />
      <CardNumero t={t} de={c.duzentos - 0.25} ate={T3 - 0.4} titulo="ARGENTINA · NO CÂMBIO DESTA SEMANA" valor="≈ R$ 280 mil" cor={C.destaque} />
      <CardNumero t={t} de={T3 + 0.1} ate={c.duzentos2 - 0.45} titulo="PARAGUAI · ANÚNCIO · LINHA 2025 · À VISTA" valor="US$ 49.990" />
      <CardNumero t={t} de={c.duzentos2 - 0.25} ate={T4 - 0.4} titulo="PARAGUAI · NO CÂMBIO DESTA SEMANA" valor="≈ R$ 296 mil" cor={C.destaque} />
      <CardNumero t={t} de={T4 + 0.1} ate={c.sessenta - 0.4} titulo="NA TABELA, O BRASILEIRO PAGA" valor="mais caro" />
      <CardNumero t={t} de={c.sessenta - 0.2} ate={c.como - 0.3} titulo="QUE NA ARGENTINA · NA TABELA" valor="+ R$ 68 mil" cor="#ff5a4e" tinta="#ffffff" />
      <Carimbo t={t} de={c.porra - 0.05} ate={c.conta - 0.25} txt="COMO PODE?!" />
      <CardNumero t={t} de={c.conta - 0.05} ate={T5 - 0.4} titulo="CONTA APROXIMADA · CÂMBIO 19–20/11" valor="imposto, margem, ano" />
      <CardNumero t={t} de={T5 + 0.1} ate={c.manda - 0.4} titulo="COMENTA" valor="imposto ou margem?" cor={C.destaque} />
      <CardNumero t={t} de={c.manda - 0.2} ate={99} titulo="MANDA PRA QUEM" valor="vai trocar de carro 🚙" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(2).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Flash at={c.porra} cor="#ff3b30" max={0.25} />
      <Grain />
    </AbsoluteFill>
  );
};
