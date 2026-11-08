// Renderiza o vídeo (sem áudio) e junta ao áudio mixado de public/mix/<id>.wav.
//   npm run render -- exemplo
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
if (!id) throw new Error("Uso: npm run render -- <id>   (ex.: npm run render -- exemplo)");
const serveUrl = await bundle({ entryPoint: join(raiz, "src", "index.ts"), publicDir: join(raiz, "public") });
mkdirSync(join(raiz, "out", "video"), { recursive: true });
mkdirSync(join(raiz, "entrega"), { recursive: true });

const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "angle" } });
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
  concurrency: 2,
  chromiumOptions: { gl: "angle" },
  onProgress: ({ progress }) => {
    if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${id} ${Math.round(progress * 100)}%   `);
  },
});
const final = join(raiz, "entrega", `${id}.mp4`);
const wav = join(raiz, "public", "mix", `${id}.wav`);
if (!existsSync(wav)) {
  console.log(`\nSem áudio em ${wav} (rode 'npm run trilha -- ${id}'). Entregando só o vídeo.`);
  spawnSync("ffmpeg", ["-hide_banner", "-y", "-i", mudo, "-c", "copy", "-movflags", "+faststart", final], { windowsHide: true });
} else {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-y", "-i", mudo, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", final], { windowsHide: true });
  if (r.status !== 0) throw new Error(r.stderr.toString());
}
console.log(`\n${id}: ${final} (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
