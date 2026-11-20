// Junta o vídeo mudo (out/video/<id>-mudo.mp4) com o áudio mixado (public/mix/<id>.wav) e codifica a entrega
// no padrão que o Instagram recomprime melhor: H.264 High, ~12 Mbps, yuv420p faixa limitada (tv), cores BT.709,
// AAC 256k, faststart. Usado pelo render.mjs; também refaz uma entrega sem renderizar de novo:
//   node scripts/finalizar.mjs <id>
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

export const argsEntrega = (mudo, wav, final) => [
  "-hide_banner", "-y", "-i", mudo,
  ...(wav ? ["-i", wav, "-map", "0:v", "-map", "1:a"] : []),
  "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-b:v", "12M", "-maxrate", "16M", "-bufsize", "24M",
  "-vf", "scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  ...(wav ? ["-c:a", "aac", "-b:a", "256k", "-shortest"] : []),
  "-movflags", "+faststart", final,
];

export const finalizar = (id) => {
  const mudo = join(raiz, "out", "video", `${id}-mudo.mp4`);
  const wav = join(raiz, "public", "mix", `${id}.wav`);
  const final = join(raiz, "entrega", `${id}.mp4`);
  if (!existsSync(mudo)) throw new Error(`Falta ${mudo} (renderize antes: npm run render -- ${id})`);
  const r = spawnSync("ffmpeg", argsEntrega(mudo, existsSync(wav) ? wav : null, final), { windowsHide: true });
  if (r.status !== 0) throw new Error(r.stderr.toString().slice(-800));
  return final;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const id = process.argv[2];
  if (!id) throw new Error("Uso: node scripts/finalizar.mjs <id>");
  console.log(`${id}: ${finalizar(id)}`);
}
