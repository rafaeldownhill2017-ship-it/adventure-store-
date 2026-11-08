// Folha de contato para REVISAR o vídeo renderizado: 1 quadro a cada 0,5 s (fps=2), 8 colunas x 4 linhas = 16 s por folha.
// Procure: texto cortado na borda, personagem cortado, objeto que aparece "do nada", rótulo sobre a legenda.
//   npm run folha -- exemplo
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id) throw new Error("Uso: npm run folha -- <id>");
const entrada = join(raiz, "entrega", `${id}.mp4`);
const saida = join(raiz, "out", "folhas");
mkdirSync(saida, { recursive: true });
const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", entrada, "-vf", "fps=2,scale=200:-1,tile=8x4:padding=4", join(saida, `${id}-%02d.jpg`)], { windowsHide: true });
if (r.status !== 0) throw new Error(r.stderr.toString());
console.log(`Folhas em ${saida} (${id}-01.jpg = 0–16 s, ${id}-02.jpg = 16–32 s ...). Abra cada uma e procure bordas cortadas.`);
