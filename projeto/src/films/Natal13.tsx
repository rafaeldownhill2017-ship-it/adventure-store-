import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Boneco, precarregar } from "../lib/kenney";
import {
  Calendario,
  Carimbo,
  CardNumero,
  corBloco,
  Fabrica,
  NotasVoando,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  PlanoTexto,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { clamp01, ease, hash, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · natal13 · "Se o Papai Noel tivesse carteira assinada" (13º = gratificação de Natal, Lei 4.090/1962).
// Dados: docs/dossies/natal13.md. Papai Noel GENÉRICO feito em código (sem marca/personagem protegido).
precarregar(["personagens/character-male-a", "personagens/character-female-d", "personagens/character-male-b", "personagens/character-male-f"]);

const N0: V3 = [0, 0, 0];
const SE: V3 = [25, 0, 0];
const DI: V3 = [50, 0, 0];
const CA: V3 = [75, 0, 0];
const EN: V3 = [100, 0, 0];
const FI: V3 = [125, 0, 0];
const DESTAQUE = /Papai|Noel|susto|primeira|segunda|menor|Natal|gratificação|sessenta|prejuízo|passou|Dieese|trezentos|bilhões|média|setecentos|trinta|dezoito|INSS|imposto|Aposentado|abril|gasta|sobra|Manda|segue/i;

const VERMELHO = "#c8262c";
const PELE = "#f1c7a5";

/** Papai Noel genérico (blocos): corpo vermelho, cinto, barba branca, gorro. Altura ~0.9 com s=1. `pulo` 0..1 = susto. */
const PapaiNoel: React.FC<{ p: V3; rotY?: number; s?: number; pulo?: number; braco?: number; t?: number }> = ({ p: pos, rotY = 0, s = 1, pulo = 0, braco = 0, t = 0 }) => {
  if (s <= 0.002) return null;
  const y = Math.sin(clamp01(pulo) * Math.PI) * 0.18;
  const resp = Math.sin(t * 2.2) * 0.01;
  return (
    <group position={[pos[0], pos[1] + y, pos[2]]} rotation={[0, rotY, 0]} scale={s}>
      {/* pernas e botas */}
      {[-1, 1].map((i) => (
        <group key={i}>
          <B s={[0.13, 0.2, 0.14]} p={[i * 0.08, 0.14, 0]} cor={VERMELHO} />
          <B s={[0.15, 0.08, 0.2]} p={[i * 0.08, 0.04, 0.02]} cor="#1d1d1d" />
        </group>
      ))}
      {/* corpo */}
      <mesh position={[0, 0.42 + resp, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.38, 20]} />
        <meshStandardMaterial color={VERMELHO} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.06, 20]} />
        <meshStandardMaterial color="#f6f3ec" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.36 + resp, 0]}>
        <cylinderGeometry args={[0.235, 0.235, 0.05, 20]} />
        <meshStandardMaterial color="#1d1d1d" roughness={0.5} />
      </mesh>
      <B s={[0.09, 0.07, 0.03]} p={[0, 0.36 + resp, 0.235]} cor="#e5b93a" />
      {/* braços (o direito sobe com `braco`) */}
      <B s={[0.09, 0.3, 0.09]} p={[-0.26, 0.44, 0]} r={[0, 0, 0.25]} cor={VERMELHO} />
      <group position={[0.24, 0.58, 0]} rotation={[-braco * 1.6, 0, -0.25]}>
        <B s={[0.09, 0.3, 0.09]} p={[0, -0.14, 0]} cor={VERMELHO} />
        <B s={[0.1, 0.06, 0.1]} p={[0, -0.3, 0]} cor="#f6f3ec" />
      </group>
      {/* cabeça, barba, nariz, olhos */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <sphereGeometry args={[0.15, 20, 16]} />
        <meshStandardMaterial color={PELE} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.66, 0.06]} scale={[1, 0.9, 0.8]}>
        <sphereGeometry args={[0.15, 20, 16]} />
        <meshStandardMaterial color="#f6f3ec" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.74, 0.15]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial color="#e08a7a" roughness={0.6} />
      </mesh>
      {[-1, 1].map((i) => (
        <mesh key={i} position={[i * 0.05, 0.79, 0.135]}>
          <sphereGeometry args={[0.016 + clamp01(pulo) * 0.01, 8, 6]} />
          <meshStandardMaterial color="#1d1d1d" />
        </mesh>
      ))}
      {/* gorro */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.05, 20]} />
        <meshStandardMaterial color="#f6f3ec" roughness={0.95} />
      </mesh>
      <mesh position={[0.03, 0.98, -0.02]} rotation={[0, 0, -0.35]}>
        <coneGeometry args={[0.14, 0.26, 20]} />
        <meshStandardMaterial color={VERMELHO} roughness={0.7} />
      </mesh>
      <mesh position={[0.1, 1.08, -0.02]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#f6f3ec" roughness={0.95} />
      </mesh>
    </group>
  );
};

/** Árvore de Natal: 3 cones, estrela que brilha e bolas coloridas. Altura ~1.3 com s=1. */
const Arvore: React.FC<{ p: V3; s?: number; t?: number }> = ({ p: pos, s = 1, t = 0 }) => {
  if (s <= 0.002) return null;
  const cores = ["#e23b2e", "#ffcf3a", "#3a8fe2", "#f6f3ec"];
  return (
    <group position={pos} scale={s}>
      <B s={[0.12, 0.16, 0.12]} p={[0, 0.08, 0]} cor="#6b4426" />
      {[
        [0.5, 0.45, 0.42],
        [0.4, 0.4, 0.74],
        [0.28, 0.34, 1.02],
      ].map(([r, h, y], i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <coneGeometry args={[r, h, 20]} />
          <meshStandardMaterial color={["#1f6b3a", "#237a42", "#2a8a4b"][i]} roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * 2.4;
        const y = 0.3 + (i / 12) * 0.85;
        const r = 0.46 - (i / 12) * 0.3;
        return (
          <mesh key={i} position={[Math.sin(a) * r, y, Math.cos(a) * r]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <meshStandardMaterial color={cores[i % 4]} emissive={cores[i % 4]} emissiveIntensity={0.3 + 0.3 * Math.sin(t * 4 + i)} roughness={0.3} />
          </mesh>
        );
      })}
      <mesh position={[0, 1.24, 0]} rotation={[0, t, 0]}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color="#ffd84a" emissive="#ffcf3a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Presente: caixa com fita e laço. Lado ~0.3 com s=1. */
const Presente: React.FC<{ p: V3; rotY?: number; s?: number; cor?: string; fita?: string }> = ({ p: pos, rotY = 0, s = 1, cor = "#3a8fe2", fita = "#ffcf3a" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={[0, rotY, 0]} scale={s}>
      <B s={[0.3, 0.26, 0.3]} p={[0, 0.13, 0]} cor={cor} />
      <B s={[0.31, 0.27, 0.05]} p={[0, 0.13, 0]} cor={fita} />
      <B s={[0.05, 0.27, 0.31]} p={[0, 0.13, 0]} cor={fita} />
      {[-1, 1].map((i) => (
        <mesh key={i} position={[i * 0.05, 0.3, 0]} rotation={[0, 0, i * 0.6]}>
          <torusGeometry args={[0.04, 0.014, 8, 16]} />
          <meshStandardMaterial color={fita} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

/** Envelope de pagamento com texto (em pé). Largura ~0.5 com s=1. */
const Envelope: React.FC<{ p: V3; rot?: V3; s?: number; txt: string; sub?: string; cor?: string }> = ({ p: pos, rot = [0, 0, 0], s = 1, txt, sub, cor = "#f4ecd8" }) => {
  if (s <= 0.002) return null;
  return (
    <group position={pos} rotation={rot} scale={s}>
      <B s={[0.5, 0.32, 0.03]} p={[0, 0.16, 0]} cor={cor} />
      <mesh position={[0, 0.25, 0.017]} rotation={[0, 0, Math.PI / 4]} scale={[1, 0.6, 1]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color="#e3d8bd" roughness={0.9} />
      </mesh>
      <PlanoTexto linhas={sub ? [[txt, 1.3, "#1d2230"], [sub, 0.8, VERMELHO]] : [[txt, 1, "#1d2230"]]} fundo={null} tam={[0.42, 0.2]} p={[0, 0.12, 0.02]} px={[520, 250]} />
    </group>
  );
};

/** Engrenagem com dentes; rótulo no centro. Raio ~0.45 com s=1. Gira com `ang`. */
const Engrenagem: React.FC<{ p: V3; s?: number; ang: number; txt: string; cor?: string }> = ({ p: pos, s = 1, ang, txt, cor = "#8a929e" }) => (
  <group position={pos} scale={s}>
    <group rotation={[0, 0, ang]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.1, 32]} />
        <meshStandardMaterial color={cor} roughness={0.4} metalness={0.3} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <B key={i} s={[0.12, 0.12, 0.1]} p={[Math.cos(a) * 0.43, Math.sin(a) * 0.43, 0]} r={[0, 0, a]} cor={cor} />;
      })}
    </group>
    <mesh position={[0, 0, 0.055]}>
      <circleGeometry args={[0.24, 32]} />
      <meshStandardMaterial color="#1d2230" />
    </mesh>
    <PlanoTexto linhas={[[txt, 1, "#ffffff"]]} fundo={null} tam={[0.42, 0.18]} p={[0, 0, 0.06]} px={[480, 200]} />
  </group>
);

/** Carrinho de compras simples (arame em blocos). */
const Carrinho: React.FC<{ p: V3; rotY?: number; s?: number; children?: React.ReactNode }> = ({ p: pos, rotY = 0, s = 1, children }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={s}>
    <B s={[0.7, 0.03, 0.45]} p={[0, 0.25, 0]} cor="#c9ced6" />
    {[-1, 1].map((i) => (
      <B key={i} s={[0.7, 0.28, 0.02]} p={[0, 0.39, i * 0.22]} cor="#c9ced6" />
    ))}
    {[-1, 1].map((i) => (
      <B key={`x${i}`} s={[0.02, 0.28, 0.45]} p={[i * 0.35, 0.39, 0]} cor="#c9ced6" />
    ))}
    <B s={[0.03, 0.3, 0.03]} p={[-0.42, 0.55, 0]} r={[0, 0, 0.4]} cor="#9aa1ab" />
    <B s={[0.04, 0.04, 0.5]} p={[-0.48, 0.68, 0]} cor={VERMELHO} />
    {[-0.28, 0.28].map((x) =>
      [-0.18, 0.18].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.06, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 14]} />
          <meshStandardMaterial color="#20252c" />
        </mesh>
      )),
    )}
    <group position={[0, 0.27, 0]}>{children}</group>
  </group>
);

/** Neve caindo (pontos determinísticos), em volta de `centro`. */
const Neve: React.FC<{ centro: V3; t: number; n?: number }> = ({ centro, t, n = 60 }) => (
  <group position={centro}>
    {Array.from({ length: n }, (_, i) => {
      const x = (hash(i) - 0.5) * 4;
      const z = (hash(i + 5) - 0.5) * 3 - 0.5;
      const y = 3 - ((t * (0.25 + hash(i + 9) * 0.2) + hash(i + 2) * 3) % 3);
      return (
        <mesh key={i} position={[x + Math.sin(t + i) * 0.05, y, z]}>
          <sphereGeometry args={[0.015, 6, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      );
    })}
  </group>
);

export const Natal13: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.lei - 1.5; // "E tudo começou com uma lei de Natal"
  const T2 = c.dieese - 1.4; // "E agora, segundo o Dieese"
  const T3 = c.primeira2 - 0.4; // "A primeira parcela cai até segunda"
  const T4 = c.inss - 1.25; // "E é dela que saem o INSS"
  const T5 = c.gasta - 0.65; // "Então não gasta a segunda"

  const blocos: [number, V3, V3, V3][] = [
    [0, N0, [N0[0], 1.0, 2.6], [N0[0], 0.72, 0]],
    [2.2, N0, [N0[0], 1.4, 6.0], [N0[0], 0.55, 0]],
    [T1, SE, [SE[0], 1.7, 7.2], [SE[0], 0.45, -0.3]],
    [T2, DI, [DI[0], 1.6, 5.6], [DI[0], 0.5, 0]],
    [T3, CA, [CA[0], 1.4, 5.6], [CA[0], 0.42, 0]],
    [T4, EN, [EN[0], 1.4, 5.8], [EN[0], 0.42, 0]],
    [T5, FI, [FI[0], 1.5, 6.4], [FI[0], 0.45, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    if (i === 0) return; // close do gancho → pose aberta
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(
    t,
    [
      [0, "#1f4a3a"],
      [T1, "#6b5638"],
      [T2, "#2a4466"],
      [T3, "#7a2a2e"],
      [T4, "#3a3a4a"],
      [T5, "#1f4a3a"],
    ],
    0.25,
  );
  const em = (i: number) => {
    const j = i === 0 ? 0 : i + 1; // bloco 0 tem duas poses de câmera
    const t0 = blocos[j][0];
    const prox = i === 0 ? 2 : j + 1;
    const t1 = prox < blocos.length ? blocos[prox][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  // gancho: envelope 13º parte ao meio; a 2ª metade encolhe
  const kParte = p(t, c.primeira - 0.15, 0.6, ease.inOut);
  const kMenor = p(t, c.menor - 0.1, 0.5, ease.inOut);
  // engrenagem: envelope 2ª entra cheio e sai menor
  const kPassa = p(t, T4 + 0.4, 2.4, ease.inOut);

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} luz={2.3} quente={em(1)}>
        {/* GANCHO: Papai Noel de carteira assinada recebe o 13º e leva um susto */}
        {em(0) ? (
          <group position={N0}>
            <Neve centro={[0, 0, 0]} t={t} />
            <Arvore p={[-0.62, 0, -0.95]} s={0.9 * mola(0.05, 220, 12)} t={t} />
            <Presente p={[-0.45, 0, -0.35]} rotY={0.4} s={0.75} cor="#e23b2e" />
            <Presente p={[-0.85, 0, -0.3]} rotY={-0.3} s={0.65} cor="#3a8fe2" />
            <PapaiNoel p={[0.1, 0, -0.2]} rotY={-0.25} s={1.0 * mola(0.1, 220, 12)} pulo={p(t, c.susto - 0.1, 0.5)} braco={0.3} t={t} />
            {/* carteira de trabalho (placa) */}
            <group position={[0.72, 0, -1.0]} rotation={[0, -0.4, 0]} scale={0.8 * mola(0.4, 220, 12)}>
              <B s={[0.04, 0.6, 0.04]} p={[0, 0.3, 0]} cor="#2a2f3a" />
              <PlanoTexto linhas={[["CARTEIRA", 1, "#ffffff"], ["ASSINADA ✓", 1, "#ffcf3a"]]} fundo="#1d3c7a" tam={[0.5, 0.3]} p={[0, 0.75, 0.03]} px={[500, 300]} />
            </group>
            {/* envelope do 13º: inteiro → duas metades; a 2ª encolhe */}
            {kParte < 0.02 ? (
              <Envelope p={[0.42, 0.38 + Math.sin(t * 2) * 0.02, 0.4]} s={0.8 * mola(1.2, 220, 12)} txt="13º" sub="DÉCIMO TERCEIRO" />
            ) : (
              <>
                <Envelope p={[lerp(0.42, -0.4, kParte), 0.38, 0.5]} rot={[0, 0, kParte * 0.1]} s={0.72} txt="1ª" sub="SEM DESCONTO" cor="#e9f5e3" />
                <Envelope p={[lerp(0.42, 0.58, kParte), 0.38, 0.5]} rot={[0, 0, -kParte * 0.1]} s={0.72 * lerp(1, 0.62, kMenor)} txt="2ª" sub="MENOR" cor="#f5e3e3" />
              </>
            )}
          </group>
        ) : null}

        {/* 1962 (sépia): a lei da gratificação de Natal */}
        {em(1) ? (
          <group position={SE}>
            <Fabrica p={[0.45, 0, -1.4]} s={0.7} cor="#cbb894" placa="FÁBRICA" t={t} />
            {[0, 1, 2].map((i) => {
              const urls = ["personagens/character-male-a", "personagens/character-male-b", "personagens/character-male-f"];
              return <Boneco key={i} url={urls[i]} p={[0.2 + i * 0.26, 0, -0.45 + i * 0.05]} rotY={-0.4} altura={0.5} anim={t >= c.passou ? "emote-yes" : "idle"} tAnim={t + i} s={mola(T1 + 0.3 + i * 0.1, 220, 12)} />;
            })}
            {/* escrivaninha com a lei */}
            <B s={[1.1, 0.06, 0.6]} p={[-0.4, 0.5, 0.15]} cor="#5a3b24" />
            {[-1, 1].map((i) => (
              <B key={i} s={[0.06, 0.5, 0.5]} p={[-0.4 + i * 0.5, 0.25, 0.15]} cor="#4a3020" />
            ))}
            <group position={[-0.4, 0.535, 0.2]} rotation={[-1.1, 0, 0.05]} scale={mola(T1 + 0.2, 220, 12)}>
              <B s={[0.62, 0.8, 0.01]} p={[0, 0.4, 0]} cor="#f3ead2" />
              <PlanoTexto
                linhas={[["LEI Nº 4.090", 0.9, "#1d2230"], ["GRATIFICAÇÃO", 1, "#8a1f24"], ["DE NATAL", 1, "#8a1f24"], ["13/07/1962", 0.8, "#4a4f5c"]]}
                fundo={null}
                tam={[0.56, 0.6]}
                p={[0, 0.42, 0.007]}
                px={[480, 520]}
              />
              {t >= c.passou - 0.1 ? (
                <group position={[0.08, 0.12, 0.012]} rotation={[0, 0, 0.2]} scale={lerp(2, 1, ease.in(p(t, c.passou - 0.1, 0.2, (x) => x)))}>
                  <PlanoTexto linhas={[["APROVADA", 1, "#2a7f4f"]]} fundo={null} tam={[0.48, 0.13]} px={[700, 190]} />
                </group>
              ) : null}
            </group>
          </group>
        ) : null}

        {/* DIEESE: 399,1 bi em moedas, depois a média por pessoa */}
        {em(2) ? (
          <group position={DI}>
            <Pedestal p={[0, 0, 0]} raio={0.9} aro="#ffcf3a" acende={p(t, c.trezentos, 0.5)} />
            {[-0.45, -0.15, 0.15, 0.45].map((x, i) => (
              <PilhaMoedas key={i} p={[x, TOPO_PEDESTAL, i % 2 ? -0.25 : 0.05]} k={p(t, T2 + 0.15 + i * 0.12, c.trezentos - T2 + 0.8)} max={12} s={1.05} />
            ))}
            <NotasVoando de={[0, 0.6, 0.1]} k={p(t, c.trezentos + 0.3, 2.4, (x) => x)} alcance={1.3} n={12} />
            {t >= c.media - 0.4 ? (
              <>
                <Boneco url="personagens/character-female-d" p={[0.0, TOPO_PEDESTAL, 0.4]} rotY={0} altura={0.6} anim="idle" tAnim={t} s={mola(c.media - 0.4, 220, 12)} />
              </>
            ) : null}
          </group>
        ) : null}

        {/* CALENDÁRIO: 30/11 → 18/12 */}
        {em(3) ? (
          <group position={CA}>
            <Calendario p={[-0.05, 0, 0]} s={0.92 * mola(T3 + 0.1, 220, 12)} mes="DEZEMBRO" dia="18" ano="2ª PARCELA" antes={{ mes: "NOVEMBRO", dia: "30", ano: "1ª PARCELA" }} vira={p(t, c.dezoito - 0.45, 0.6, (x) => x)} cor={VERMELHO} />
            <Presente p={[0.62, 0, 0.25]} rotY={-0.4} s={0.7} cor="#2a8a4b" />
            <Presente p={[-0.65, 0, 0.3]} rotY={0.3} s={0.6} cor="#ffcf3a" fita={VERMELHO} />
          </group>
        ) : null}

        {/* ENGRENAGEM: a 2ª parcela passa pelo INSS e (se paga) IR e sai menor */}
        {em(4) ? (
          <group position={EN}>
            <Engrenagem p={[-0.28, 0.85, -0.3]} s={0.85 * mola(T4 + 0.1, 220, 12)} ang={t * 1.2} txt="INSS" />
            <Engrenagem p={[0.48, 0.62, -0.32]} s={0.6 * mola(c.imposto - 0.3, 220, 12)} ang={-t * 1.7 + 0.3} txt="IR" cor="#a0717a" />
            <B s={[1.9, 0.06, 0.4]} p={[0, 0.3, 0.25]} cor="#2a2f3a" />
            <Envelope p={[lerp(-0.6, 0.62, kPassa), 0.33, 0.3]} s={1.2 * lerp(1, 0.55, p(t, T4 + 1.2, 0.8))} txt="2ª" sub={kPassa > 0.45 ? "MENOR" : "PARCELA"} cor={kPassa > 0.45 ? "#f5e3e3" : "#f4ecd8"} />
            {t >= c.aposentado - 0.3 ? (
              <Boneco url="personagens/character-male-b" p={[-0.35, 0, 0.45]} rotY={0.4} altura={0.5} anim="idle" tAnim={t} s={mola(c.aposentado - 0.3, 220, 12)} />
            ) : null}
          </group>
        ) : null}

        {/* FECHO: Papai Noel devolve um presente do carrinho ("Nem o Papai Noel") */}
        {em(5) ? (
          <group position={FI}>
            <Neve centro={[0, 0, 0]} t={t} />
            <B s={[0.8, 0.04, 0.35]} p={[-0.6, 0.7, -0.7]} cor="#8a5a34" />
            <B s={[0.04, 0.7, 0.35]} p={[-0.98, 0.35, -0.7]} cor="#6b4426" />
            <B s={[0.04, 0.7, 0.35]} p={[-0.22, 0.35, -0.7]} cor="#6b4426" />
            <Presente p={[-0.8, 0.72, -0.7]} s={0.6} cor="#3a8fe2" />
            <Carrinho p={[0.3, 0, 0.0]} rotY={-0.3} s={0.85 * mola(T5 + 0.1, 220, 12)}>
              <Presente p={[-0.18, 0, 0]} s={0.7} cor="#e23b2e" />
              <Presente p={[0.15, 0, -0.05]} rotY={0.4} s={0.75} cor="#2a8a4b" />
              <Presente p={[0.0, 0.2, 0.05]} rotY={-0.2} s={0.6} cor="#ffcf3a" fita={VERMELHO} />
            </Carrinho>
            {/* o presente devolvido: sai do carrinho e vai pra prateleira */}
            {(() => {
              const k = p(t, c.nem - 0.2, 0.9, ease.inOut);
              const x = lerp(0.28, -0.45, k);
              const y = lerp(0.75, 0.72, k) + Math.sin(k * Math.PI) * 0.45;
              const z = lerp(0.05, -0.7, k);
              return <Presente p={[x, y, z]} rotY={k * 2} s={0.6} cor="#b04ac8" />;
            })()}
            <PapaiNoel p={[-0.35, 0, 0.3]} rotY={lerp(0.5, 0, p(t, c.manda - 0.2, 0.5))} s={0.95 * mola(T5 + 0.2, 220, 12)} braco={0.4 + p(t, c.nem - 0.3, 0.5) * 0.6 - p(t, c.nem + 0.8, 0.4) * 0.4 + p(t, c.manda, 0.4) * 0.5} t={t} />
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo: um card por vez */}
      <CardNumero t={t} de={-0.6} ate={c.primeira - 0.45} titulo="SE O PAPAI NOEL TIVESSE" valor="carteira assinada 🎅" cor={C.destaque} />
      <CardNumero t={t} de={c.primeira - 0.25} ate={c.segunda - 0.45} titulo="1ª PARCELA DO 13º" valor="sem desconto" />
      <CardNumero t={t} de={c.segunda - 0.25} ate={T1 - 0.4} titulo="2ª PARCELA" valor="vem menor" cor={C.destaque} />
      <CardNumero t={t} de={T1 + 0.1} ate={c.entidades - 0.4} titulo="NOME OFICIAL DO 13º" valor="gratificação de Natal" />
      <CardNumero t={t} de={c.entidades - 0.2} ate={c.passou - 0.4} titulo="ENTIDADES DE EMPRESÁRIOS, 1962" valor="“vai dar prejuízo”" />
      <Carimbo t={t} de={c.passou - 0.1} ate={T2 - 0.4} txt="LEI 4.090 · APROVADA" cor="#2a7f4f" />
      <CardNumero t={t} de={T2 + 0.1} ate={c.trezentos - 0.35} titulo="SEGUNDO O DIEESE" valor="13º em 2026" />
      <CardNumero t={t} de={c.trezentos - 0.15} ate={c.media - 0.45} titulo="13º NA ECONOMIA EM 2026" valor="R$ 399,1 bi" cor={C.destaque} />
      <CardNumero t={t} de={c.media - 0.25} ate={T3 - 0.4} titulo="MÉDIA POR PESSOA (DIEESE)" valor="R$ 3.720" />
      <CardNumero t={t} de={T3 + 0.1} ate={c.dezoito - 0.45} titulo="1ª PARCELA ATÉ" valor="30/11" />
      <CardNumero t={t} de={c.dezoito - 0.25} ate={T4 - 0.4} titulo="2ª PARCELA ATÉ" valor="18/12" cor={C.destaque} />
      <CardNumero t={t} de={T4 + 0.1} ate={c.aposentado - 0.45} titulo="SAEM DA 2ª PARCELA" valor="INSS + IR*" />
      <CardNumero t={t} de={c.aposentado - 0.25} ate={T5 - 0.4} titulo="APOSENTADO DO INSS" valor="já recebeu (abr–mai)" />
      <CardNumero t={t} de={T5 + 0.1} ate={c.manda - 0.45} titulo="NÃO GASTA A 2ª" valor="antes de ver quanto sobra" cor={C.destaque} />
      <CardNumero t={t} de={c.manda - 0.25} ate={99} titulo="MANDA PRA QUEM CONTA" valor="com o 13º inteiro 🎁" cor={C.destaque} />
      {/* nota do asterisco do IR */}
      {t >= T4 + 0.1 && t < c.aposentado - 0.2 ? (
        <div style={{ position: "absolute", top: 545, left: 0, right: 0, textAlign: "center", fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
          *IR só pra quem paga
        </div>
      ) : null}

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(2).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
