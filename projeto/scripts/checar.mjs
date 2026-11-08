// Confere se o ambiente está pronto: Node, ffmpeg, dependências, chave (sem imprimir a chave).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ok = (b, msg, dica = "") => console.log(`${b ? "✔" : "✘"} ${msg}${b ? "" : "  → " + dica}`);
const major = Number(process.versions.node.split(".")[0]);
ok(major >= 18, `Node ${process.versions.node}`, "instale o Node 18 ou mais novo (nodejs.org)");
const ff = spawnSync("ffmpeg", ["-version"], { windowsHide: true });
ok(ff.status === 0, "ffmpeg encontrado", "instale o ffmpeg e coloque no PATH (ffmpeg.org/download.html)");
ok(existsSync(join(raiz, "node_modules", "remotion")), "dependências instaladas", "rode: npm install");
let chave = false;
try { chave = /^ELEVENLABS_API_KEY=\S{10,}/m.test(readFileSync(join(raiz, ".env.local"), "utf8")); } catch {}
ok(chave, "chave do ElevenLabs em .env.local", "copie .env.example para .env.local e cole a chave (sem ela dá para fazer o vídeo MUDO de teste)");
