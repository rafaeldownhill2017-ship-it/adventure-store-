// Quadros de controle: node scripts/stills.mjs <idDaComposicao> <seg1,seg2,...> [escala]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const [id, tempos, escala = "0.5"] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: join(raiz, "src", "index.ts"), publicDir: join(raiz, "public") });
const composition = await selectComposition({ serveUrl, id, chromiumOptions: { gl: "angle" } });
const saida = join(raiz, "out", "stills");
await mkdir(saida, { recursive: true });
for (const s of tempos.split(",").map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(s * composition.fps));
  const output = join(saida, `${id}-${s.toFixed(2)}.jpg`);
  await renderStill({ serveUrl, composition, frame, output, imageFormat: "jpeg", jpegQuality: 85, scale: Number(escala), chromiumOptions: { gl: "angle" }, onBrowserLog: (l) => { if (l.type === "error") console.log("[browser]", l.text.slice(0, 300)); } });
  console.log(output);
}
