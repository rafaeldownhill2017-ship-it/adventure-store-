// Renderiza o vídeo (sem áudio) e junta ao áudio mixado de public/mix/<id>.wav.
//   npm run render -- exemplo
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { finalizar } from "./finalizar.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id) throw new Error("Uso: npm run render -- <id>   (ex.: npm run render -- exemplo)");
const serveUrl = await bundle({ entryPoint: join(raiz, "src", "index.ts"), publicDir: join(raiz, "public") });
mkdirSync(join(raiz, "out", "video"), { recursive: true });
mkdirSync(join(raiz, "entrega"), { recursive: true });

const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl: process.env.REMOTION_GL ?? "angle" }, browserExecutable: process.env.REMOTION_BROWSER ?? null });
const mudo = join(raiz, "out", "video", `${id}-mudo.mp4`);
const t0 = Date.now();
let ultimo = -1;
await renderMedia({
  serveUrl,
  composition,
  codec: "h264",
  crf: 15,
  muted: true,
  outputLocation: mudo,
  imageFormat: "jpeg",
  jpegQuality: 95,
  concurrency: Number(process.env.REMOTION_CONCURRENCY ?? 2),
  chromiumOptions: { gl: process.env.REMOTION_GL ?? "angle" }, browserExecutable: process.env.REMOTION_BROWSER ?? null,
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${id} ${Math.round(progress * 100)}%   `);
  },
});
const wav = join(raiz, "public", "mix", `${id}.wav`);
if (!existsSync(wav)) console.log(`\nSem áudio em ${wav} (rode a trilha). Entregando só o vídeo.`);
const final = finalizar(id); // 12 Mbps, yuv420p tv, BT.709 (ver scripts/finalizar.mjs)
console.log(`\n${id}: ${final} (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
