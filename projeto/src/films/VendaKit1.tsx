import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Ator, Modelo, precarregar } from "../lib/kenney";
import {
  Balanca,
  BLOCO,
  CaixaAbre,
  CaixaTomate,
  Calendario,
  CardNumero,
  CelularImagem,
  corBloco,
  CuboKit,
  Escudo,
  NotasVoando,
  PalcoCor,
  Pedestal,
  PilhaMoedas,
  Placa,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { ease, lerp, p, useT, useTimeline } from "../lib/time";
import { B, Flash, Grain, PalavraGrande, useMola } from "../lib/ui";

// ESTÚDIO MINIATURA · vendakit1 · venda do kit SEM dizer o preço no vídeo (o preço vai no direct de quem comenta PROMPT).
// Gatilhos: quebra de expectativa → âncora "menos que uma caixa de tomate" → ferida → prova (perfil do dono: 10 mi)
// → capacidade (4 vídeos num dia) → facilidade → objeções (aparecer/editar/animar) → valor concreto → caminho do dinheiro
// → garantia → curiosidade do preço → COMENTA PROMPT. Sem promessa de ganho. Termina em loop no cubo.
precarregar(["personagens/character-male-a", "comercial/building-a"]);

const A: V3 = [0, 0, 0]; // balança
const R: V3 = [20, 0, 0]; // rolando o feed
const P: V3 = [40, 0, 0]; // prova
const F: V3 = [60, 0, 0]; // fluxo + objeções
const K_: V3 = [80, 0, 0]; // o que vem no kit
const D: V3 = [100, 0, 0]; // dois caminhos
const G: V3 = [120, 0, 0]; // garantia + CTA
const VIDS = ["vendakit/v1.jpg", "vendakit/v2.jpg", "vendakit/v3.jpg", "vendakit/v4.jpg"];
const DESTAQUE = /inteligência|tomate|rolando|dinheiro|outra|perfis|dez|milhões|três|tema|Claude|aparecer|editar|animar|catorze|oito|skills|pronto|dinheiro|comércio|cliente|garantia|volta|custa|PROMPT/i;

/** Microfone simples (pé + cápsula). */
const Microfone: React.FC<{ p: V3; s?: number }> = ({ p: pos, s = 1 }) => (
  <group position={pos} scale={s}>
    <B s={[0.28, 0.03, 0.2]} p={[0, 0.015, 0]} cor="#20252c" />
    <B s={[0.03, 0.32, 0.03]} p={[0, 0.18, 0]} cor="#9aa1ab" />
    <mesh position={[0, 0.42, 0]} castShadow>
      <capsuleGeometry args={[0.07, 0.12, 6, 14]} />
      <meshStandardMaterial color="#3a3f4a" roughness={0.35} metalness={0.5} />
    </mesh>
  </group>
);

/** Selo de CTA fixo embaixo (pulsando) no fim. */
const SeloPrompt: React.FC<{ t: number; de: number }> = ({ t, de }) => {
  if (t < de) return null;
  const k = ease.out(Math.min(1, (t - de) / 0.4));
  const pulso = 1 + Math.sin((t - de) * 6) * 0.03;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1470, display: "flex", justifyContent: "center", opacity: k }}>
      <div style={{ padding: "22px 48px", borderRadius: 30, background: "#ffcf3a", color: "#14110a", fontFamily: FONT, fontWeight: 800, fontSize: 64, letterSpacing: "-0.02em", boxShadow: "0 16px 50px rgba(0,0,0,0.45)", transform: `scale(${(0.8 + 0.2 * k) * pulso})` }}>
        comenta PROMPT
      </div>
    </div>
  );
};

export const VendaKit1: React.FC = () => {
  const t = useT();
  const mola = useMola();
  const { cues: c } = useTimeline();
  const T1 = c.rolando - 1.6; // "Enquanto isso..."
  const T2 = c.perfis - 0.9; // "Um dos meus perfis"
  const T3 = c.tema - 0.9; // "Você escolhe o tema"
  const T4 = c.catorze - 0.5; // "Vem catorze aulas"
  const T5 = c.dois - 0.7; // "E tem dois jeitos"
  const T6 = c.garantia - 1.4; // "E se não gostar"
  const blocos: [number, V3, number][] = [
    [0, A, 10.2],
    [T1, R, 7.6],
    [T2, P, 9.4],
    [T3, F, 11.0],
    [T4, K_, 9.8],
    [T5, D, 10.0],
    [T6, G, 6.8],
  ];
  const K: Key[] = [];
  blocos.forEach(([t0, pos, dist], i) => {
    const fim = i < blocos.length - 1 ? blocos[i + 1][0] : c.fim + 3;
    K.push([t0, [pos[0], 2.3, dist], [pos[0], 0.85, 0], 34]);
    K.push([fim, [pos[0], 2.15, dist * 0.9], [pos[0], 0.85, 0], 34]);
  });
  const cam = camPorKeys(t, K);
  const cor = corBloco(t, [[0, BLOCO.vermelho], [T1, BLOCO.noite], [T2, BLOCO.roxo], [T3, BLOCO.marinho], [T4, BLOCO.verde], [T5, BLOCO.terra], [T6, BLOCO.verde]], 0.25);
  const em = (i: number) => {
    const t0 = blocos[i][0];
    const t1 = i < blocos.length - 1 ? blocos[i + 1][0] : 1e9;
    return t >= t0 - 0.05 && t < t1;
  };
  const incl = lerp(0, -0.85, p(t, c.tomate - 0.2, 0.9, ease.back)); // a caixa de tomate pesa mais (custa mais)
  const vidAgora = VIDS[Math.floor(t * 4) % 4];

  return (
    <AbsoluteFill style={{ background: cor }}>
      <PalcoCor cam={cam} cor={cor}>
        {em(0) ? (
          <group position={A}>
            <Balanca s={0.95} incl={incl} esq={<CaixaTomate s={0.72} />} dir={<CuboKit p={[0, -0.05, 0]} s={0.62} gira={t * 0.3} />} />
          </group>
        ) : null}

        {em(1) ? (
          <group position={R}>
            <Pedestal p={[-0.5, 0, 0]} raio={0.55} aro="#ff6a5a" />
            <CelularImagem p={[-0.5, TOPO_PEDESTAL, 0]} s={1.0} img={vidAgora} />
            <NotasVoando de={[-0.4, TOPO_PEDESTAL + 0.7, 0.2]} k={p(t, c.rolando, 2.4, (x) => x)} n={16} alcance={1.4} />
            <Ator url="personagens/character-male-a" p={[0.62, 0, 0.35]} rotY={-0.5} altura={0.95} t={t} acoes={[{ de: 0, anim: "idle" }, { de: c.outra - 0.2, anim: "emote-yes" }]} />
            <PilhaMoedas p={[0.62, 0, 0.95]} k={p(t, c.rolando + 0.6, 2.0, (x) => x)} max={10} s={0.7} />
          </group>
        ) : null}

        {em(2) ? (
          <group position={P}>
            {VIDS.map((v, i) => (
              <CelularImagem key={v} p={[-0.93 + i * 0.62, 0, (i % 2) * -0.25]} rotY={(1.5 - i) * 0.12} s={0.9 * mola(T2 + 0.2 + i * 0.12, 220, 12)} img={v} liga={t >= c.tres - 0.3 + i * 0.15 ? 1 : 0.25} />
            ))}
          </group>
        ) : null}

        {em(3) ? (
          <group position={F}>
            {[
              { x: -1.2, el: <Placa p={[0, 0.75, 0]} txt="SEU TEMA" cor="#1d1d1d" larg={0.6} /> },
              { x: -0.4, el: <Calendario p={[0, 0, 0]} s={0.5} mes="ROTEIRO" dia="✓" /> },
              { x: 0.4, el: <Microfone p={[0, 0, 0]} s={1.1} /> },
              { x: 1.2, el: <CuboKit s={0.9} gira={t} /> },
            ].map((o, i) => (
              <group key={i} position={[o.x, 0, 0]}>
                <Pedestal raio={0.42} aro={["#ffffff", "#7dd3ff", "#b58cff", "#ffcf3a"][i]} acende={p(t, T3 + 0.3 + i * 0.35, 0.3)} />
                <group position={[0, TOPO_PEDESTAL, 0]} scale={mola(T3 + 0.2 + i * 0.35, 220, 12)}>{o.el}</group>
              </group>
            ))}
            {[c.aparecer, c.editar, c.animar].map((t0, i) => (
              <Placa key={i} p={[0, 2.3 - i * 0.42, 0.9]} txt={`✕ ${["APARECER", "EDITAR", "ANIMAR"][i]}`} cor="#d6302a" k={p(t, t0 - 0.15, 0.6, (x) => x)} larg={0.9} s={1.0} />
            ))}
          </group>
        ) : null}

        {em(4) ? (
          <group position={K_}>
            <CaixaAbre p={[-0.95, 0, 0.3]} s={0.85} abre={p(t, c.catorze - 0.1, 0.6)} cor="#5b3a8c" rotulo="14 AULAS" />
            <CaixaAbre p={[0, 0, -0.35]} s={0.85} abre={p(t, c.skills - 0.3, 0.6)} cor="#1d2f5c" rotulo="8 SKILLS" />
            <CaixaAbre p={[0.95, 0, 0.3]} s={0.85} abre={p(t, c.projeto - 0.1, 0.6)} cor="#b8322a" rotulo="PROJETO PRONTO" />
            <CuboKit p={[0, 1.15, 0.3]} s={0.9 * mola(T4 + 0.1, 200, 12)} gira={t} />
          </group>
        ) : null}

        {em(5) ? (
          <group position={D}>
            <Pedestal p={[-0.85, 0, 0]} raio={0.5} aro="#b58cff" />
            <CelularImagem p={[-0.85, TOPO_PEDESTAL, 0]} s={0.8} img={VIDS[2]} />
            <Placa p={[-0.85, 1.5, 0.2]} txt="SEU PERFIL" cor="#5b3a8c" k={p(t, c.crescer - 0.2, 0.6, (x) => x)} larg={0.66} />
            <Pedestal p={[0.85, 0, 0]} raio={0.5} aro="#ffcf3a" />
            <Modelo url="comercial/building-a" p={[0.85, TOPO_PEDESTAL, -0.1]} alvo={{ largura: 0.62 }} s={mola(c.comercio - 0.3, 200, 12)} />
            <Placa p={[0.75, 1.95, 0.2]} txt="COMÉRCIO DO BAIRRO" cor="#1d1d1d" k={p(t, c.comercio - 0.1, 0.6, (x) => x)} larg={0.95} s={0.9} />
            <PilhaMoedas p={[0.3, 0, 0.85]} k={p(t, c.cliente - 0.1, 1.2, (x) => x)} max={9} s={0.7} />
          </group>
        ) : null}

        {em(6) ? (
          <group position={G}>
            {t < c.custa - 0.3 ? (
              <Escudo p={[0, 0, 0]} s={1.4 * mola(T6 + 0.1, 200, 12)} txt="7 DIAS" gira={t * 1.5} />
            ) : (
              <>
                <Pedestal raio={0.9} aro="#ffcf3a" />
                <CuboKit p={[0, TOPO_PEDESTAL + 0.15, 0]} s={2.0 * mola(c.custa - 0.3, 200, 12)} gira={t} />
              </>
            )}
          </group>
        ) : null}
      </PalcoCor>

      {/* camada de topo */}
      <CardNumero t={t} de={-0.6} ate={c.tomate - 0.4} titulo="ESTE VÍDEO" valor="feito por IA" />
      <CardNumero t={t} de={c.tomate - 0.2} ate={T1 - 0.2} titulo="O KIT QUE FAZ ELE CUSTA" valor="menos que 1 caixa de tomate" cor={C.alerta} tinta="#ffffff" />
      <CardNumero t={t} de={c.rolando - 0.1} ate={T2 - 0.2} titulo="ENQUANTO VOCÊ ROLA O FEED" valor="o dinheiro vai pra quem posta" />
      <CardNumero t={t} de={c.dez - 0.2} ate={c.tres - 0.3} titulo="UM DOS MEUS PERFIS · 6 VÍDEOS" valor="10 mi de views" cor={C.destaque} />
      <CardNumero t={t} de={c.tres - 0.1} ate={T3 - 0.2} titulo="ESTE AQUI SAIU JUNTO COM OUTROS 3" valor="4 vídeos · 1 dia" />
      <CardNumero t={t} de={c.claude - 0.1} ate={c.aparecer - 0.3} titulo="VOCÊ ESCOLHE O TEMA" valor="o Claude entrega o vídeo" />
      <CardNumero t={t} de={c.catorze - 0.1} ate={T5 - 0.2} titulo="NO KIT" valor="14 aulas · 8 skills · projeto" />
      <CardNumero t={t} de={c.dois - 0.1} ate={c.cliente - 0.3} titulo="2 JEITOS DE VIRAR DINHEIRO" valor="perfil · comércio local" />
      <CardNumero t={t} de={c.cliente - 0.1} ate={T6 - 0.2} titulo="SEM PROMESSA, SÓ A CONTA" valor="1 cliente já pode pagar o kit" cor={C.destaque} />
      <CardNumero t={t} de={c.garantia - 0.2} ate={c.custa - 0.4} titulo="NÃO GOSTOU?" valor="dinheiro de volta" cor="#25a35a" tinta="#ffffff" />
      <CardNumero t={t} de={c.custa - 0.2} ate={c.comenta - 0.3} titulo="E O PREÇO?" valor="quer saber quanto custa?" />
      <CardNumero t={t} de={c.comenta - 0.1} ate={99} titulo="TE MANDO TUDO NO DIRECT" valor="comenta PROMPT" cor="#ffcf3a" />
      <SeloPrompt t={t} de={c.fim + 0.1} />

      <PalavraGrande destaque={DESTAQUE} ate={c.fim + 0.1} />
      {blocos.slice(1).map(([x]) => (
        <Flash key={x} at={x} />
      ))}
      <Grain />
    </AbsoluteFill>
  );
};
