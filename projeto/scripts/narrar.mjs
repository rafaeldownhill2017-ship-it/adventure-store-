// Narração com ElevenLabs (voz + tempo de cada letra). A chave vem do arquivo .env.local (nunca vai para o código).
//   npm run vozes                      lista as vozes disponíveis na sua conta
//   npm run narrar:simular             mostra quantos caracteres cada vídeo gasta, SEM chamar a API
//   npm run narrar -- --filme=exemplo  gera a voz de um vídeo (ou de todos, sem --filme)
//   npm run narrar -- --voz=<id>       usa outra voz sem editar o roteiro
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const saida = join(raiz, "narracao", "out");
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, "").split("="); return [k, v ?? true]; }));

const roteiros = JSON.parse(await readFile(join(raiz, "narracao", "roteiros.json"), "utf8"));
const filmes = roteiros.filmes.filter((f) => !args.filme || f.id.startsWith(String(args.filme)));
if (!filmes.length) throw new Error(`Nenhum vídeo corresponde a --filme=${args.filme}`);
const textoDe = (f) => `${f.texto} ${f.assinatura ?? roteiros.assinatura ?? ""}`.trim();

if (args.simular) {
  let total = 0;
  for (const f of filmes) {
    const n = textoDe(f).length;
    total += n;
    console.log(`${f.id.padEnd(22)} ${String(n).padStart(4)} caracteres (~${Math.round(n / 14)} s de voz)`);
  }
  console.log(`${"total".padEnd(22)} ${String(total).padStart(4)} caracteres`);
  process.exit(0);
}

if (!process.env.ELEVENLABS_API_KEY) throw new Error("Falta ELEVENLABS_API_KEY. Copie .env.example para .env.local e cole sua chave (plano pago).");
const client = new ElevenLabsClient();

if (args.vozes) {
  const { voices } = await client.voices.getAll();
  for (const v of voices) {
    const l = v.labels ?? {};
    console.log(`${v.voiceId}  ${v.name.padEnd(14)} ${[v.category, l.gender, l.age, l.accent, l.language, l.use_case].filter(Boolean).join(", ")}`);
  }
  process.exit(0);
}

await mkdir(saida, { recursive: true });
for (const f of filmes) {
  const vozId = typeof args.voz === "string" ? args.voz : (f.voz ?? roteiros.voz.id);
  if (!vozId || vozId.startsWith("COLE_AQUI")) throw new Error("Defina o id da voz em narracao/roteiros.json (rode 'npm run vozes').");
  const texto = textoDe(f);
  const { data, rawResponse } = await client.textToSpeech
    .convertWithTimestamps(vozId, { text: texto, modelId: roteiros.modelo, languageCode: f.idioma ?? roteiros.idioma, voiceSettings: roteiros.ajustes, outputFormat: "mp3_44100_128" })
    .withRawResponse();
  const base = join(saida, `${f.id}--${vozId}`);
  await writeFile(`${base}.mp3`, Buffer.from(data.audioBase64, "base64"));
  await writeFile(`${base}.alinhamento.json`, JSON.stringify({ texto, voz: vozId, modelo: roteiros.modelo, alignment: data.alignment }, null, 2));
  const fim = data.alignment?.characterEndTimesSeconds?.at(-1);
  console.log(`${f.id}: ${fim?.toFixed(1) ?? "?"} s · ${rawResponse.headers.get("x-character-count") ?? texto.length} caracteres · ${base}.mp3`);
}
