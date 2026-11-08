// Converte o alinhamento por caractere do ElevenLabs em palavras + marcações de cena.
// Tudo no filme (cenas, legendas, efeitos sonoros) é ancorado em palavras da narração,
// então trocar a voz e rodar este script de novo reposiciona o filme inteiro.
//   node scripts/timeline.mjs            gera src/data/<filme>.json
//   node scripts/timeline.mjs --palavras imprime as palavras com tempos
import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filmes } from "./filmes.config.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(raiz, "narracao", "out");
const imprimir = process.argv.includes("--palavras");
const arquivos = await readdir(outDir);
await mkdir(join(raiz, "src", "data"), { recursive: true });
await mkdir(join(raiz, "public", "voz"), { recursive: true });

const normal = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ0-9]/g, "");

for (const filme of filmes) {
  // Voz preferida: a primeira da lista `vozes` que já tiver narração gerada.
  const candidatos = filme.vozes.map((v) => `${filme.id}--${v}.alinhamento.json`).filter((a) => arquivos.includes(a));
  if (!candidatos.length) throw new Error(`Sem narração para ${filme.id}`);
  const alinhamentoArq = candidatos[0];
  const { alignment, voz } = JSON.parse(await readFile(join(outDir, alinhamentoArq), "utf8"));

  const palavras = [];
  let atual = null;
  let colchete = false;
  alignment.characters.forEach((ch, i) => {
    if (ch === "[") colchete = true;
    if (colchete) {
      if (ch === "]") colchete = false;
      return;
    }
    if (/\s/.test(ch)) {
      if (atual) palavras.push(atual);
      atual = null;
      return;
    }
    const ini = alignment.characterStartTimesSeconds[i] + filme.preRoll;
    const fim = alignment.characterEndTimesSeconds[i] + filme.preRoll;
    if (!atual) atual = { w: "", start: ini, end: fim };
    atual.w += ch;
    atual.end = fim;
  });
  if (atual) palavras.push(atual);
  // Pausas escritas como "..." viram palavras sem letra; não entram em legenda nem marcação.
  for (let i = palavras.length - 1; i >= 0; i--) if (!normal(palavras[i].w)) palavras.splice(i, 1);

  const fimVoz = palavras.at(-1).end;
  const acha = (alvo, n = 1) => {
    let vistos = 0;
    const p = palavras.find((x) => normal(x.w) === normal(alvo) && ++vistos === n);
    if (!p) throw new Error(`${filme.id}: palavra "${alvo}" (#${n}) não encontrada`);
    return p.start;
  };
  const cues = Object.fromEntries(
    Object.entries(filme.cues).map(([k, ref]) => {
      const [alvo, n] = Array.isArray(ref) ? ref : [ref, 1];
      return [k, +acha(alvo, n).toFixed(3)];
    }),
  );
  const duracao = +(fimVoz + filme.cauda).toFixed(3);

  const audioNome = alinhamentoArq.replace(".alinhamento.json", ".mp3");
  await copyFile(join(outDir, audioNome), join(raiz, "public", "voz", `${filme.id}.mp3`));
  await writeFile(
    join(raiz, "src", "data", `${filme.id}.json`),
    JSON.stringify({ id: filme.id, voz, preRoll: filme.preRoll, duracao, fimVoz: +fimVoz.toFixed(3), cues, palavras }, null, 1),
  );
  console.log(`${filme.id}: voz ${voz} · ${duracao}s · ${Object.keys(cues).length} marcações`);
  if (imprimir) console.log(palavras.map((p) => `${p.start.toFixed(2)} ${p.w}`).join("\n"));
}
