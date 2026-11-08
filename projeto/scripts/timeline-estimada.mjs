// Marcação provisória quando ainda não há narração gerada (ex.: ainda sem chave do ElevenLabs).
// Estima o tempo de cada palavra pelo número de caracteres e pelas pausas de pontuação, no ritmo
// medido de uma voz típica (~15 caracteres/s). Quando a voz real existir, `timeline.mjs` substitui este arquivo.
//   node scripts/timeline-estimada.mjs exemplo
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filmes } from "./filmes.config.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pref = process.argv[2];
const roteiros = JSON.parse(await readFile(join(raiz, "narracao", "roteiros.json"), "utf8"));
const filme = filmes.find((f) => f.id.startsWith(pref));
const r = roteiros.filmes.find((f) => f.id === filme.id);
const texto = `${r.texto} ${roteiros.assinatura}`.replace(/\[[^\]]*\]/g, "");
const normal = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ0-9]/g, "");

const CPS = 15;
let t = filme.preRoll;
const palavras = [];
for (const w of texto.split(/\s+/).filter(Boolean)) {
  if (!normal(w)) continue;
  const dur = Math.max(0.14, normal(w).length / CPS);
  palavras.push({ w, start: +t.toFixed(3), end: +(t + dur).toFixed(3) });
  t += dur + 0.06 + (/[.?!:]$/.test(w) ? 0.5 : /[,;]$/.test(w) ? 0.22 : 0);
}
const acha = (alvo, n = 1) => {
  let vistos = 0;
  const p = palavras.find((x) => normal(x.w) === normal(alvo) && ++vistos === n);
  if (!p) throw new Error(`palavra "${alvo}" (#${n}) não encontrada`);
  return p.start;
};
const cues = Object.fromEntries(Object.entries(filme.cues).map(([k, ref]) => {
  const [alvo, n] = Array.isArray(ref) ? ref : [ref, 1];
  return [k, +acha(alvo, n).toFixed(3)];
}));
const fimVoz = palavras.at(-1).end;
await writeFile(join(raiz, "src", "data", `${filme.id}.json`), JSON.stringify({ id: filme.id, voz: "estimada", preRoll: filme.preRoll, duracao: +(fimVoz + filme.cauda).toFixed(3), fimVoz, cues, palavras }, null, 1));
console.log(`${filme.id}: marcação ESTIMADA · ${(fimVoz + filme.cauda).toFixed(1)}s · ${palavras.length} palavras`);
