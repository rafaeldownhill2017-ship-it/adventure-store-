import { Audio } from "@remotion/media";
import React from "react";
import { Composition, getRemotionEnvironment, staticFile } from "remotion";
import { FPS, H, W } from "./brand";
import dExemplo from "./data/exemplo.json";
import { Exemplo } from "./films/Exemplo";
import dMaster1 from "./data/master1.json";
import { Master1 } from "./films/Master1";
import dMaster2 from "./data/master2.json";
import { Master2 } from "./films/Master2";
import dMaster3 from "./data/master3.json";
import { Master3 } from "./films/Master3";
import dCarro1 from "./data/carro1.json";
import { Carro1 } from "./films/Carro1";
import { Vitrine } from "./films/Vitrine";
import { FontGate } from "./lib/fonts";
import { Timeline, TimelineCtx } from "./lib/time";

// Cada filme = uma <Composition>. Para criar o seu:
//   1) escreva o roteiro em narracao/roteiros.json e as marcações em scripts/filmes.config.mjs
//   2) rode `npm run narrar` + `npm run timeline` (ou `npm run timeline:estimada -- <id>` sem voz)
//   3) copie films/Exemplo.tsx para films/MeuFilme.tsx e registre aqui, importando o JSON gerado em src/data/<id>.json
const filme = (data: Timeline, Film: React.FC): React.FC => {
  const Comp: React.FC = () => (
    <TimelineCtx.Provider value={data}>
      <FontGate>
        <Film />
      </FontGate>
      {/* Áudio só na pré-visualização do Studio; o master final é mixado por scripts/trilha-*.mjs e unido no render. */}
      {getRemotionEnvironment().isStudio ? <Audio src={staticFile(`mix/${data.id}.wav`)} /> : null}
    </TimelineCtx.Provider>
  );
  return Comp;
};

const filmes = [
  { id: "exemplo", data: dExemplo as Timeline, C: filme(dExemplo as Timeline, Exemplo) },
  { id: "master1", data: dMaster1 as Timeline, C: filme(dMaster1 as Timeline, Master1) },
  { id: "master2", data: dMaster2 as Timeline, C: filme(dMaster2 as Timeline, Master2) },
  { id: "master3", data: dMaster3 as Timeline, C: filme(dMaster3 as Timeline, Master3) },
  { id: "carro1", data: dCarro1 as Timeline, C: filme(dCarro1 as Timeline, Carro1) },
];

// Vitrine das peças de lib/objetos.tsx: sem voz e sem trilha (não passa pelo `filme`, que toca o mix no Studio).
const dVitrine: Timeline = { id: "vitrine", duracao: 12, fimVoz: 12, cues: {}, palavras: [] };
const VitrineComp: React.FC = () => (
  <TimelineCtx.Provider value={dVitrine}>
    <FontGate>
      <Vitrine />
    </FontGate>
  </TimelineCtx.Provider>
);

export const Root: React.FC = () => (
  <>
    {filmes.map(({ id, data, C }) => (
      <Composition key={id} id={id} component={C} durationInFrames={Math.ceil(data.duracao * FPS)} fps={FPS} width={W} height={H} />
    ))}
    <Composition id="vitrine" component={VitrineComp} durationInFrames={dVitrine.duracao * FPS} fps={FPS} width={W} height={H} />
  </>
);
