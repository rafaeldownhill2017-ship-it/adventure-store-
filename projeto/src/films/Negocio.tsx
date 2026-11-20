import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT } from "../brand";
import { camPorKeys, type Key, type V3 } from "../lib/camera";
import { Modelo, precarregar } from "../lib/kenney";
import {
  Cafe,
  CardNumero,
  CelularPedido,
  Copo,
  corBloco,
  Fritas,
  Hamburguer,
  NotasVoando,
  PalcoCor,
  Pedestal,
  Pizza,
  Placa,
  TOPO_PEDESTAL,
} from "../lib/objetos";
import { clamp01, ease, lerp, p, useT, useTimeline } from "../lib/time";
import { Flash, Grain, useMola } from "../lib/ui";

// VÍDEO DE VENDAS 3D PARA NEGÓCIO LOCAL (modelo). 18 s, sem narração (funciona no mudo: status, Reels, anúncio).
// Tudo vem de src/data/negocios/<cliente>.json. Estrutura: gancho → produto → 3 diferenciais → oferta → pedido.
// Regras: só informação confirmada pelo cliente (preço, horário, diferenciais); autorização de nome e marca por escrito.
precarregar(["carros/delivery"]);

export type ConfigNegocio = {
  id: string;
  exemplo?: boolean;
  nome: string;
  produto: "hamburguer" | "pizza" | "cafe";
  cores: { fundo1: string; fundo2: string; fundo3: string; destaque: string };
  gancho: string;
  nomeProduto: string;
  descricao: string;
  diferenciais: string[];
  oferta: { titulo: string; preco: string };
  cta: { linha: string; contato: string; info: string };
  conversa: string[];
};

/** Frase grande no centro (estilo cartaz), palavra a palavra com pulo. */
const Frase: React.FC<{ t: number; de: number; ate: number; txt: string; cor?: string; y?: number; tam?: number }> = ({ t, de, ate, txt, cor = "#ffffff", y = 1230, tam = 128 }) => {
  if (t < de || t > ate + 0.25) return null;
  const sai = 1 - p(t, ate, 0.25, ease.in);
  const palavras = txt.split(" ");
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 26px", opacity: sai }}>
      {palavras.map((w, i) => {
        const k = clamp01((t - de - i * 0.09) / 0.22);
        if (k <= 0) return null;
        const s = k < 1 ? 0.5 + 0.5 * ease.back(k) : 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: Math.min(tam, 1800 / Math.max(6, txt.length)),
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              color: cor,
              WebkitTextStroke: "12px rgba(15,10,8,0.92)",
              paintOrder: "stroke fill",
              textShadow: "0 10px 30px rgba(0,0,0,0.45)",
              transform: `scale(${s}) rotate(${(i % 2 ? 1 : -1) * 2}deg)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Selo pequeno no topo (EXEMPLO FICTÍCIO ou o nome do negócio). */
const SeloTopo: React.FC<{ txt: string; cor: string }> = ({ txt, cor }) => (
  <div style={{ position: "absolute", top: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "10px 26px", borderRadius: 99, background: "rgba(10,8,6,0.78)", color: cor, fontFamily: FONT, fontWeight: 800, fontSize: 28, letterSpacing: "0.1em" }}>{txt}</div>
  </div>
);

/** Fecho com o nome do negócio, linha de pedido e contato (fica até o fim para loop/print). */
const FechoNegocio: React.FC<{ t: number; de: number; cfg: ConfigNegocio }> = ({ t, de, cfg }) => {
  if (t < de) return null;
  const k = ease.out(clamp01((t - de) / 0.5));
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 1400, textAlign: "center", fontFamily: FONT, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
      <div style={{ display: "inline-block", padding: "18px 40px", borderRadius: 26, background: "#25a35a", color: "#fff", fontSize: 54, fontWeight: 800, boxShadow: "0 14px 40px rgba(0,0,0,0.35)" }}>
        {cfg.cta.linha}
      </div>
      <div style={{ marginTop: 20, fontSize: 72, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", WebkitTextStroke: "8px rgba(15,10,8,0.9)", paintOrder: "stroke fill" }}>{cfg.cta.contato}</div>
      <div style={{ marginTop: 6, fontSize: 36, fontWeight: 700, color: "#fff", opacity: 0.9, textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{cfg.cta.info}</div>
    </div>
  );
};

export const fazNegocio = (cfg: ConfigNegocio): React.FC => {
  const Film: React.FC = () => {
    const t = useT();
    const mola = useMola();
    const { cues: c, duracao } = useTimeline();
    const D = cfg.cores.destaque;

    // câmera: órbita no gancho, close no produto, abre para diferenciais/combo, vai ao pedido
    const orb = (a: number, r: number, h: number, alvo: V3): [V3, V3] => [[alvo[0] + Math.sin(a) * r, h, alvo[2] + Math.cos(a) * r], alvo];
    const P: V3 = [0, 0.75, 0];
    const Q: V3 = [16, 0.7, 0];
    const K: Key[] = [
      [0, ...orb(-0.5, 6.0, 2.6, P), 34],
      [c.produto - 0.3, ...orb(0.25, 5.4, 2.3, P), 34],
      [c.produto + 0.5, ...orb(0.45, 3.9, 1.7, [0, 0.95, 0]), 34],
      [c.dif1 - 0.4, ...orb(0.75, 3.9, 1.7, [0, 0.95, 0]), 34],
      [c.dif1 + 0.3, [0, 3.0, 9.2], [0, 0.85, 0], 34],
      [c.oferta - 0.3, [0, 3.0, 9.2], [0, 0.85, 0], 34],
      [c.oferta + 0.3, [0.3, 2.4, 7.4], [0.3, 0.75, 0], 34],
      [c.cta, [0.3, 2.4, 7.4], [0.3, 0.75, 0], 34],
      [c.cta, [Q[0], 1.9, 6.4], [Q[0], 1.3, 0], 34],
      [duracao, [Q[0], 1.85, 6.0], [Q[0], 1.3, 0], 34],
    ];
    const cam = camPorKeys(t, K);
    const cor = corBloco(t, [[0, cfg.cores.fundo1], [c.dif1, cfg.cores.fundo2], [c.oferta, cfg.cores.fundo1], [c.cta, cfg.cores.fundo3]], 0.35);
    const noPedido = t >= c.cta;
    const vanX = lerp(4.5, 0.75, p(t, c.cta + 0.6, 1.6));

    const produto = (pos: V3, s: number) =>
      cfg.produto === "pizza" ? <Pizza p={pos} s={s} fatia={p(t, c.produto + 0.6, 1.2)} /> : cfg.produto === "cafe" ? <Cafe p={pos} s={s * 1.4} t={t} /> : <Hamburguer p={pos} s={s} monta={p(t, 0.25, 2.1, (x) => x)} t={t} />;

    return (
      <AbsoluteFill style={{ background: cor }}>
        <PalcoCor cam={cam} cor={cor} quente>
          {!noPedido ? (
            <group>
              <Pedestal raio={1.0} aro={D} acende={p(t, 0.1, 0.8)} />
              <group rotation={[0, t * 0.35, 0]}>{produto([0, TOPO_PEDESTAL, 0], 1.25)}</group>
              <NotasVoando de={[0, TOPO_PEDESTAL + 0.3, 0]} k={p(t, 2.2, 1.6, (x) => x)} n={18} alcance={1.8} cor={D} s={0.6} />
              {cfg.diferenciais.slice(0, 3).map((d, i) => {
                const t0 = [c.dif1, c.dif2, c.dif3][i];
                const pos: V3 = [[-0.95, 0.95, 0][i], [1.35, 1.7, 2.15][i], [0.45, 0.45, 0.45][i]];
                return <Placa key={d} p={pos} txt={d} cor={["#1d1d1d", "#25a35a", "#d6302a"][i]} k={p(t, t0 - 0.1, 0.7, (x) => x)} larg={0.95} s={0.9} />;
              })}
              <Fritas p={[-0.95, 0, 1.25]} rotY={0.4} s={0.9 * mola(c.combo, 220, 11)} enche={p(t, c.combo + 0.2, 0.8)} />
              <Copo p={[0.95, 0, 1.25]} rotY={-0.3} s={0.95 * mola(c.combo + 0.25, 220, 11)} />
            </group>
          ) : (
            <group position={Q}>
              <Pedestal raio={0.9} aro="#25a35a" />
              <CelularPedido p={[0, TOPO_PEDESTAL, 0]} s={1.0 * mola(c.cta + 0.1, 200, 12)} k={p(t, c.cta + 0.5, 1.4, (x) => x)} linhas={cfg.conversa} />
              <Modelo url="carros/delivery" p={[vanX, 0, -1.6]} rotY={-Math.PI / 2} alvo={{ comp: 1.0 }} />
              {produto([-0.45, 0, 1.05], 0.36)}
            </group>
          )}
        </PalcoCor>

        <SeloTopo txt={cfg.exemplo ? "EXEMPLO FICTÍCIO · VÍDEO 3D" : cfg.nome.toUpperCase()} cor={D} />
        <Frase t={t} de={c.gancho} ate={c.produto - 0.2} txt={cfg.gancho} cor={D} />
        <CardNumero t={t} de={c.produto + 0.2} ate={c.dif1 - 0.2} titulo={cfg.descricao.toUpperCase()} valor={cfg.nomeProduto} />
        <Frase t={t} de={c.combo} ate={c.oferta - 0.2} txt={cfg.oferta.titulo} cor="#ffffff" tam={96} />
        <CardNumero t={t} de={c.oferta} ate={c.cta - 0.2} titulo={cfg.oferta.titulo} valor={cfg.oferta.preco} cor={D} />
        <CardNumero t={t} de={c.cta + 0.2} ate={99} titulo={cfg.exemplo ? `${cfg.nome.toUpperCase()} (EXEMPLO)` : cfg.nome.toUpperCase()} valor="Pediu, chegou." />
        <FechoNegocio t={t} de={c.cta + 0.8} cfg={cfg} />
        {[c.produto, c.dif1, c.oferta, c.cta].map((x) => (
          <Flash key={x} at={x} cor={D} max={0.25} />
        ))}
        <Grain />
      </AbsoluteFill>
    );
  };
  return Film;
};
