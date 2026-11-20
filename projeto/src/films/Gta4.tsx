import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Modelo, precarregar } from "../lib/kenney";
import {
  BurjKhalifa,
  CaixaJogo,
  Carimbo,
  CardNumero,
  ConsoleNovo,
  corBloco,
  EmpireState,
  Estrelas,
  JamesWebb,
  PalcoCor,
  Palmeira,
  Pedestal,
  Placa,
  Terra,
  TOPO_PEDESTAL,
  TorreEiffel,
} from "../lib/objetos";
import { lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// PESO NO BOLSO · gta4 · "O GTA 6 pode ter custado umas 30 Torres Eiffel" (conferimos um post viral com erros).
// Viagem: gancho (30 torrinhas) → Paris → Nova York → Dubai → espaço (James Webb) → Brasil. Dados: docs/dossies/gta4.md.
// O custo do GTA 6 é ESTIMATIVA de analistas (a Rockstar não divulga): o card diz isso sempre que o número aparece.
precarregar(["natureza/tree_oak", "comercial/building-a", "comercial/building-c", "carros/sedan"]);

const H: V3 = [0, 0, 0];
const PA: V3 = [25, 0, 0];
const NY: V3 = [50, 0, 0];
const DU: V3 = [75, 0, 0];
const ES: V3 = [100, 0, 0];
const BR: V3 = [125, 0, 0];
const DESTAQUE = /GTA|trinta|Eiffel|conferir|seis|Paris|quarenta|Rockstar|bilhão|nove|Nova|York|Empire|seiscentos|dois|Dubai|Burj|Khalifa|empata|Webb|dez|Brasil|cinco|Manda/i;

/** Táxi amarelo de Nova York (feito em código; o sedan Kenney tingido saía laranja). */
const Taxi: React.FC<{ p: V3; rotY?: number }> = ({ p: pos, rotY = 0 }) => (
  <group position={pos} rotation={[0, rotY, 0]} scale={0.55}>
    <B s={[1.0, 0.22, 0.46]} p={[0, 0.2, 0]} cor="#ffcc1a" />
    <B s={[0.55, 0.18, 0.42]} p={[-0.05, 0.4, 0]} cor="#ffcc1a" />
    <B s={[0.5, 0.13, 0.43]} p={[-0.05, 0.41, 0]} cor="#8fb6d6" />
    <B s={[0.22, 0.07, 0.12]} p={[-0.05, 0.53, 0]} cor="#1d1d1d" />
    <B s={[1.01, 0.04, 0.47]} p={[0, 0.2, 0]} cor="#1d1d1d" />
    {[-0.32, 0.32].map((x) =>
      [-0.24, 0.24].map((z) => (
        <mesh key={`${x}${z}`} position={[x, 0.09, z]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 14]} />
          <meshStandardMaterial color="#20252c" roughness={0.6} />
        </mesh>
      )),
    )}
  </group>
);

export const Gta4: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.paris - 0.55; // "Começa por Paris"
  const T2 = c.ny - 0.1; // "Nova York"
  const T3 = c.dubai - 0.1; // "Dubai"
  const T4 = c.obra - 0.3; // "E a obra que nem seis..."
  const T5 = c.brasil - 0.45; // "E aqui no Brasil?"
  const tGta = c.rockstar - 1.1; // "O GTA 6?"

  const blocos: [number, V3, V3, V3][] = [
    [0, H, [H[0], 3.9, 8.6], [H[0], 0.45, -0.6]],
    [T1, PA, [PA[0], 2.0, 9.4], [PA[0], 1.32, 0]],
    [T2, NY, [NY[0], 2.2, 10.2], [NY[0], 1.28, 0]],
    [T3, DU, [DU[0], 2.2, 10.8], [DU[0], 1.35, 0]],
    [T4, ES, [ES[0], 1.7, 7.8], [ES[0], 1.2, 0]],
    [T5, BR, [BR[0], 2.0, 6.2], [BR[0], 0.7, 0]],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, , pos, look], i) => {
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, pos, look, 34]);
    K.push([t1, [pos[0], pos[1] - 0.1, pos[2] * 0.92], look, 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, "#2a1f4a"], [T1, "#141b3a"], [T2, "#3a4a66"], [T3, "#d9894a"], [T4, "#05060f"], [T5, "#2f8f5b"]], 0.25);
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor} quente={em(3)} luz={em(4) ? 1.6 : 2.4} semPiso={em(4)}>
        {/* GANCHO: 30 torrinhas brotando em volta da caixa do GTA */}
        {em(0) ? (
          <group position={H}>
            <Pedestal p={[0, 0, 0.7]} raio={0.6} aro="#ffcf3a" />
            <CaixaJogo p={[0, TOPO_PEDESTAL, 0.7]} s={1.0} />
            {Array.from({ length: 30 }, (_, i) => {
              const arco = i < 13 ? 0 : 1; // 13 no arco de dentro, 17 no de fora
              const j = arco ? i - 13 : i;
              const n = arco ? 17 : 13;
              const ang = -1.15 + (j / (n - 1)) * 2.3;
              const r = arco ? 2.15 : 1.45;
              const t0 = 0.2 + (i / 30) * 2.0;
              return <TorreEiffel key={i} p={[Math.sin(ang) * r * 0.5, 0, 0.7 - Math.cos(ang) * r]} s={0.2 * mola(t0, 240, 11)} acesa={0.6} />;
            })}
          </group>
        ) : null}

        {/* PARIS */}
        {em(1) ? (
          <group position={PA}>
            <B s={[6, 0.012, 0.9]} p={[0, 0.006, 1.2]} cor="#2c5f9e" />
            <TorreEiffel p={[-0.15, 0, -0.3]} s={1.0} acesa={p(t, T1 + 0.2, 1.0)} />
            <Modelo url="natureza/tree_oak" p={[-1.15, 0, -0.9]} alvo={{ altura: 0.9 }} />
            <Modelo url="natureza/tree_oak" p={[1.1, 0, -1.2]} alvo={{ altura: 0.8 }} />
            <Placa p={[-0.85, 2.0, 0.3]} txt="PARIS" cor="#1d2f5c" k={p(t, T1 + 0.2, 0.6, (x) => x)} larg={0.6} />
            {t >= tGta ? <CaixaJogo p={[0.8, 0, 0.6]} rotY={-0.3} s={0.85 * mola(tGta, 220, 11)} /> : null}
          </group>
        ) : null}

        {/* NOVA YORK */}
        {em(2) ? (
          <group position={NY}>
            <Modelo url="comercial/building-a" p={[-1.0, 0, -1.6]} alvo={{ largura: 0.7 }} />
            <Modelo url="comercial/building-c" p={[0.95, 0, -1.8]} alvo={{ largura: 0.7 }} />
            <EmpireState p={[-0.15, 0, -0.4]} s={0.95} />
            <B s={[6, 0.012, 0.8]} p={[0, 0.006, 1.0]} cor="#3a3f4a" />
            <Taxi p={[lerp(-3, 3, ((t - T2) * 0.35) % 1), 0.01, 0.85]} />
            <Taxi p={[lerp(3, -3, ((t - T2) * 0.28 + 0.4) % 1), 0.01, 1.2]} rotY={Math.PI} />
            <Placa p={[-0.8, 2.3, 0.3]} txt="NOVA YORK" cor="#1d1d1d" k={p(t, T2 + 0.2, 0.6, (x) => x)} larg={0.75} />
            {t >= c.cabem - 0.2 ? (
              <>
                <CaixaJogo p={[0.8, 0, 0.45]} rotY={-0.3} s={0.9 * mola(c.cabem - 0.2, 220, 11)} />
                <EmpireState p={[0.62, 0.58, 0.65]} s={0.18 * mola(c.cabem + 0.2, 220, 11)} janelas={false} cor="#ffcf3a" />
                <EmpireState p={[0.97, 0.58, 0.65]} s={0.18 * mola(c.cabem + 0.45, 220, 11)} janelas={false} cor="#ffcf3a" />
              </>
            ) : null}
          </group>
        ) : null}

        {/* DUBAI */}
        {em(3) ? (
          <group position={DU}>
            <mesh position={[1.2, 2.2, -6]}>
              <sphereGeometry args={[0.8, 24, 16]} />
              <meshStandardMaterial color="#ffe27a" emissive="#ffcf3a" emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
            <BurjKhalifa p={[-0.1, 0, -0.4]} s={0.82} />
            <Palmeira p={[-1.05, 0, 0.3]} s={0.9} t={t} />
            <Palmeira p={[1.05, 0, -0.4]} s={0.75} t={t + 1} />
            <Placa p={[-0.85, 2.6, 0.3]} txt="DUBAI" cor="#b8322a" k={p(t, T3 + 0.2, 0.6, (x) => x)} larg={0.6} />
            {t >= c.empata - 0.25 ? (
              <>
                <CaixaJogo p={[0.75, 0, 0.7]} rotY={-0.3} s={0.85 * mola(c.empata - 0.25, 220, 11)} />
              </>
            ) : null}
          </group>
        ) : null}

        {/* ESPAÇO: James Webb */}
        {em(4) ? (
          <group position={ES}>
            <Estrelas centro={[0, 0, 0]} />
            <Terra p={[1.3, 2.9, -9]} s={0.35} t={t} />
            <JamesWebb p={[0.1, 0.05, -0.2]} s={1.15} abre={p(t, T4 + 0.3, 1.6)} />
            {Array.from({ length: 6 }, (_, i) => {
              const t0 = c.obra + 0.5 + i * 0.22;
              return t >= t0 ? <CaixaJogo key={i} p={[-0.7 + i * 0.28, 0.32, 0.35]} rotY={0} s={0.34 * mola(t0, 260, 12)} /> : null;
            })}
            <Placa p={[-0.35, 1.75, 0.9]} txt="1,5 MILHÃO DE KM DA TERRA" cor="#1d2f5c" k={p(t, c.webb, 0.6, (x) => x)} larg={1.25} s={0.9} />
          </group>
        ) : null}

        {/* BRASIL */}
        {em(5) ? (
          <group position={BR}>
            <Pedestal raio={0.85} aro="#ffcf3a" />
            <group rotation={[0, Math.sin(t * 0.8) * 0.25, 0]}>
              <ConsoleNovo p={[-0.3, TOPO_PEDESTAL, -0.1]} s={0.75 * mola(T5 + 0.1, 220, 11)} />
            <CaixaJogo p={[0.35, TOPO_PEDESTAL, 0.1]} rotY={-0.25} s={0.8 * mola(T5 + 0.3, 220, 11)} />
            </group>
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo */}
      <CardNumero t={t} de={-0.6} ate={c.rodando - 0.3} titulo="O GTA 6 PODE TER CUSTADO" valor="≈ 30 Torres Eiffel" cor={C.destaque} />
      <CardNumero t={t} de={c.rodando - 0.1} ate={c.conferir - 0.25} titulo="TÁ RODANDO POR AÍ" valor="quase 1 Torre" />
      <Carimbo t={t} de={c.conferir + 0.5} ate={c.fim6 - 0.9} txt="CONFERIMOS" />
      <CardNumero t={t} de={c.fim6 - 0.9} ate={T1 - 0.4} titulo="NO FIM DO VÍDEO" valor="a obra que nem 6 GTAs pagam" />
      <CardNumero t={t} de={c.quarenta - 0.2} ate={tGta - 0.2} titulo="TORRE EIFFEL · EM DINHEIRO DE HOJE" valor="≈ US$ 40 mi" />
      <CardNumero t={t} de={tGta + 0.1} ate={c.nove - 0.3} titulo="GTA 6 · ESTIMATIVA DE ANALISTAS" valor="até US$ 1,5 bi" cor={C.destaque} />
      <CardNumero t={t} de={c.nove - 0.15} ate={T2 - 0.4} titulo="ESTIMATIVA EM REAIS (US$ 1 = R$ 5,93)" valor="≈ R$ 8,9 bi" />
      <CardNumero t={t} de={c.seiscentos - 0.2} ate={c.cabem - 0.3} titulo="EMPIRE STATE · EM DINHEIRO DE HOJE" valor="≈ US$ 680 mi" />
      <CardNumero t={t} de={c.cabem - 0.1} ate={T3 - 0.4} titulo="NO CUSTO DO GTA 6 (ESTIMATIVA)" valor="cabem até 2" cor={C.destaque} />
      <CardNumero t={t} de={c.burj - 0.1} ate={c.empata - 0.3} titulo="BURJ KHALIFA · O MAIS ALTO DO MUNDO" valor="US$ 1,5 bi" />
      <CardNumero t={t} de={c.empata - 0.1} ate={T4 - 0.4} titulo="GTA 6 (ESTIMATIVA MÁXIMA)" valor="empate" cor={C.destaque} />
      <CardNumero t={t} de={T4 + 0.1} ate={c.dez - 0.3} titulo="A OBRA QUE NEM 6 GTAs PAGAM" valor="telescópio James Webb" />
      <CardNumero t={t} de={c.dez - 0.15} ate={T5 - 0.4} titulo="JAMES WEBB · CUSTO DA NASA" valor="≈ US$ 10 bi" cor={C.destaque} />
      <CardNumero t={t} de={c.console - 0.2} ate={c.manda - 0.3} titulo="CONSOLE + JOGO · PREÇO SUGERIDO" valor="R$ 5.550" />
      <CardNumero t={t} de={c.manda - 0.1} ate={99} titulo="MANDA PRA QUEM" valor="tá jogando GTA 6 🎮" cor={C.destaque} />

      <PalavraGrande destaque={DESTAQUE} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
