// Render em blocos: cada bloco de quadros vira um arquivo em out/blocos/<id>/. Se o processo cair
// (reinício da máquina, falta de memória), rodar de novo pula os blocos prontos e continua de onde parou.
// No fim junta os blocos, põe o áudio de public/mix/<id>.wav e entrega em entrega/<id>.mp4.
//   node scripts/render-blocos.mjs <id> [quadrosPorBloco=240]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const [id, porBloco = "240"] = process.argv.slice(2);
if (!id) throw new Error("Uso: node scripts/render-blocos.mjs <id> [quadrosPorBloco]");
const gl = process.env.REMOTION_GL ?? "angle";
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const concurrency = Number(process.env.REMOTION_CONCURRENCY ?? 2);

const serveUrl = await bundle({ entryPoint: join(raiz, "src", "index.ts"), publicDir: join(raiz, "public") });
const timeoutInMilliseconds = 240000;
const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl }, browserExecutable, timeoutInMilliseconds });
const dir = join(raiz, "out", "blocos", id);
mkdirSync(dir, { recursive: true });
mkdirSync(join(raiz, "entrega"), { recursive: true });

const N = composition.durationInFrames;
const tam = Number(porBloco);
const blocos = [];
for (let ini = 0; ini < N; ini += tam) blocos.push([ini, Math.min(N - 1, ini + tam - 1)]);
const t0 = Date.now();
for (const [k, [a, b]] of blocos.entries()) {
  const arq = join(dir, `${String(k).padStart(3, "0")}.mp4`);
  if (existsSync(arq)) continue;
  const tmp = `${arq}.parcial.mp4`;
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 15, muted: true, outputLocation: tmp, imageFormat: "jpeg", jpegQuality: 95, concurrency, frameRange: [a, b], chromiumOptions: { gl }, browserExecutable, timeoutInMilliseconds });
  renameSync(tmp, arq);
  console.log(`${id}: bloco ${k + 1}/${blocos.length} pronto (quadros ${a}-${b}) · ${((Date.now() - t0) / 60000).toFixed(1)} min`);
}

const lista = join(dir, "lista.txt");
writeFileSync(lista, blocos.map((_, k) => `file '${String(k).padStart(3, "0")}.mp4'`).join("\n"));
const mudo = join(dir, "mudo.mp4");
let r = spawnSync("ffmpeg", ["-hide_banner", "-y", "-f", "concat", "-safe", "0", "-i", lista, "-c", "copy", mudo], { windowsHide: true });
if (r.status !== 0) throw new Error(r.stderr.toString());
const wav = join(raiz, "public", "mix", `${id}.wav`);
const final = join(raiz, "entrega", `${id}.mp4`);
const args = existsSync(wav)
  ? ["-hide_banner", "-y", "-i", mudo, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", final]
  : ["-hide_banner", "-y", "-i", mudo, "-c", "copy", "-movflags", "+faststart", final];
r = spawnSync("ffmpeg", args, { windowsHide: true });
if (r.status !== 0) throw new Error(r.stderr.toString());
console.log(`${id}: ${final}`);
