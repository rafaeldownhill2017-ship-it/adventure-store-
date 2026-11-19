import React from "react";
import { AbsoluteFill } from "remotion";
import { camPorKeys, type Key } from "../lib/camera";
import {
  BLOCO, BombaCombustivel, Calendario, Carimbo, CardNumero, Carregador, Cigarro, Cofre, Cofrinho, corBloco, Fabrica, Garrafa, Laco, Mala,
  NotasVoando, PalcoCor, Pedestal, PilhaMoedas, SacaTrigo, TOPO_PEDESTAL,
} from "../lib/objetos";
import { p, useT } from "../lib/time";

// VITRINE das peças de src/lib/objetos.tsx (sem voz). Serve para conferir o visual: npm run stills -- vitrine 1,3,5,7,9,11
// Bloco 1 (0–4 s, marinho): cofre abrindo + notas, cofrinho, calendário, mala, card de número.
// Bloco 2 (4–8 s, terra): três pedestais com garrafas e moedas crescendo.
// Bloco 3 (8–12 s, verde): combustível vs elétrico, fábrica, cigarro, laço e saca de trigo.
export const Vitrine: React.FC = () => {
  const t = useT();
  const cor = corBloco(t, [[0, BLOCO.marinho], [4, BLOCO.terra], [8, BLOCO.verde]]);
  const K: Key[] = [
    [0, [0, 3.4, 11.5], [0, 0.6, 0], 34],
    [4, [0, 3.4, 11.5], [0, 0.6, 0], 34],
    [4, [20, 3.0, 10.5], [20, 0.7, 0], 34],
    [8, [20, 3.0, 10.5], [20, 0.7, 0], 34],
    [8, [40, 3.6, 12.5], [40, 0.6, -0.6], 34],
    [12, [40, 3.6, 12.5], [40, 0.6, -0.6], 34],
  ];
  const cam = camPorKeys(t, K);
  const abre = p(t, 0.6, 1.2);
  const moedas = (d: number) => p(t, 4.6 + d, 2.4, (x) => x);
  return (
    <AbsoluteFill>
      <PalcoCor cam={cam} cor={cor}>
        {/* bloco 1 */}
        <Pedestal p={[0, 0, 0]} raio={0.85} aro="#ffc94a" acende={p(t, 0.2, 0.6)} />
        <Cofre p={[0, TOPO_PEDESTAL, 0]} abre={abre} />
        <NotasVoando de={[0, TOPO_PEDESTAL + 0.5, 0.4]} k={p(t, 1.2, 2.6, (x) => x)} />
        <Cofrinho p={[-1.25, 0, 1.3]} rotY={0.5} s={0.6} balanca={p(t, 2, 0.6, (x) => x)} moeda={p(t, 1.6, 0.8, (x) => x)} />
        <Calendario p={[1.25, 0, 1.3]} rotY={-0.4} s={0.62} mes="DEZ" dia="2024" />
        <Mala p={[1.2, 0, -1.4]} rotY={-0.3} s={0.9} />
        {/* bloco 2 */}
        {(["cerveja", "vodca", "vinho"] as const).map((tipo, i) => (
          <group key={tipo} position={[20 + (i - 1) * 1.25, 0, 0]}>
            <Pedestal raio={0.5} aro={["#ffc94a", "#7dd3ff", "#ff7a7a"][i]} acende={p(t, 4.3 + i * 0.2, 0.5)} />
            <Garrafa p={[-0.18, TOPO_PEDESTAL, 0]} tipo={tipo} s={0.85} texto={tipo.toUpperCase()} />
            <PilhaMoedas p={[0.3, TOPO_PEDESTAL, 0.12]} k={moedas(i * 0.3)} max={6 + i * 5} s={0.8} />
          </group>
        ))}
        <Garrafa p={[20, 0, -1.6]} tipo="refri" s={0.8} texto="REFRI" />
        {/* bloco 3 */}
        <Pedestal p={[38.75, 0, 0]} raio={0.5} aro="#7dffb0" />
        <Carregador p={[38.75, TOPO_PEDESTAL, 0]} s={0.85} />
        <Pedestal p={[40, 0, 0]} raio={0.5} aro="#7dffb0" />
        <BombaCombustivel p={[40, TOPO_PEDESTAL, 0]} s={0.8} cor="#2f9f5b" rotulo="FLEX" />
        <Pedestal p={[41.25, 0, 0]} raio={0.5} aro="#ff6a5a" />
        <BombaCombustivel p={[41.25, TOPO_PEDESTAL, 0]} s={0.8} cor="#d6453a" rotulo="GASOLINA" />
        <Fabrica p={[40, 0, -2.6]} s={1.1} placa="R$ 100" t={t} />
        <Cigarro p={[39.0, 0, 1.6]} rotY={0.3} s={0.7} t={t} />
        <Laco p={[41.0, 0, 1.7]} s={1.2} k={p(t, 8.3, 0.6, (x) => x)} />
        <SacaTrigo p={[40, 0, 1.5]} s={0.6} rotulo="TRIGO" />
      </PalcoCor>
      <CardNumero t={t} de={1.2} ate={3.8} titulo="DÓLAR" antes="R$ 5,40" valor="R$ 5,78" />
      <Carimbo t={t} de={5.0} ate={7.8} txt="IMPOSTO DO PECADO" top={1500} />
      <CardNumero t={t} de={8.4} ate={11.8} titulo="EXEMPLO ILUSTRATIVO" valor="7,6%" />
    </AbsoluteFill>
  );
};
