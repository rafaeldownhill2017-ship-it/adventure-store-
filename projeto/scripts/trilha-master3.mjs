// Trilha e efeitos do Caso Master · Parte 3 (baseada na trilha do exemplo), SINTETIZADOS POR CÓDIGO (sem arquivos de terceiros): groove leve, pops, whooshes,
// "fracasso" irônico no "Parabéns" e sting no fecho. A voz entra com ducking e o master sai em -14 LUFS.
// Modelo para qualquer vídeo: copie este arquivo, troque o ID e ajuste os efeitos às suas marcações (cues).
//   npm run trilha            (usa o vídeo "exemplo")   |   node scripts/trilha-exemplo.mjs <id>
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SR, criarMotor, decode, ff, lufs, writeWav } from "./lib/sintese.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ID = process.argv[2] ?? "master3";
const d = JSON.parse(readFileSync(join(raiz, "src", "data", `${ID}.json`), "utf8"));
const c = d.cues;
const DUR = d.duracao;
const N = Math.ceil(DUR * SR);
const TAU = Math.PI * 2;

const { rnd, hz, bus, soma, panG, suave, MUS, SFX, REV_M, REV_S, DLY, pad, grave, bumbo, ruidoF, piano, blip, sino, impacto, whoosh, riser, reverso, braam, freeverb, pingpong } = criarMotor(N);

function marimba(t0, m, { g = 0.08, pan = 0, rev = 0.3, dly = 0.2 } = {}) {
  const f = hz(m);
  const [gl, gr] = panG(pan);
  const len = Math.floor(0.8 * SR);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const v = (Math.sin((TAU * f * k) / SR) * Math.exp(-t * 7) + 0.35 * Math.sin((TAU * f * 3.93 * k) / SR) * Math.exp(-t * 26)) * Math.min(1, t / 0.0015) * g;
    const i = Math.floor(t0 * SR) + k;
    soma(MUS, i, v * gl, v * gr);
    soma(REV_M, i, v * gl * rev, v * gr * rev);
    soma(DLY, i, v * dly, v * dly);
  }
}
const pop = (t0, f = 900, g = 0.05, pan = 0) => {
  blip(t0, f * 1.6, f, { g, dur: 0.06, pan, rev: 0.25 });
  ruidoF(t0, 0.02, { tipo: "bp", f: f * 3, Q: 1.5, g: g * 0.7, dec: 220, alvo: SFX, pan });
};
const rola = (t0, dur, g = 0.022, pan = 0) => {
  for (let t = t0; t < t0 + dur; t += 0.045) ruidoF(t, 0.012, { tipo: "bp", f: 3200 + rnd() * 900, Q: 2.5, g, dec: 300, alvo: SFX, pan });
};
/** Registradora ao contrário: campainha + gaveta + descida (um desconto). */
const desconto = (t0, pan) => {
  blip(t0, 2600, 2550, { g: 0.05, dur: 0.25, pan, rev: 0.3 });
  ruidoF(t0 + 0.05, 0.15, { tipo: "bp", f: 1800, Q: 1, g: 0.08, dec: 25, alvo: SFX, pan });
  [72, 68, 65].forEach((m, k) => blip(t0 + 0.12 + k * 0.07, hz(m), hz(m - 0.5), { g: 0.05, dur: 0.15, pan, rev: 0.3 }));
  rola(t0, 0.9, 0.02, pan);
};
const motor = (t0, dur, g = 0.04, f0 = 60) => {
  let ph = 0;
  const len = Math.floor(dur * SR);
  for (let k = 0; k < len; k++) {
    const x = k / len;
    ph += (TAU * f0 * (1 + 0.25 * Math.sin(x * 9))) / SR;
    const v = Math.tanh(2.5 * (Math.sin(ph) + 0.5 * Math.sin(ph * 2.01))) * suave(x * 6) * (1 - suave((x - 0.7) / 0.3)) * g;
    soma(SFX, Math.floor(t0 * SR) + k, v, v);
  }
};
/** Buzina grave de barcaça. */
const buzina = (t0, dur = 1.1) => {
  let ph = 0;
  for (let k = 0; k < Math.floor(dur * SR); k++) {
    const x = k / (dur * SR);
    ph += (TAU * 98) / SR;
    const v = (Math.sin(ph) + 0.5 * Math.sin(ph * 2) + 0.25 * Math.sin(ph * 3)) * suave(x * 8) * (1 - suave((x - 0.8) / 0.2)) * 0.06;
    soma(SFX, Math.floor(t0 * SR) + k, v, v);
    soma(REV_S, Math.floor(t0 * SR) + k, v * 0.6, v * 0.6);
  }
};

// =====================================================================
// GROOVE (acordes por seção; cada seção acompanha uma estação do vídeo)
// =====================================================================
const BEAT = 60 / 100;
const FECHO = c.fim + 0.9;
const Cm = [36, 43, 48, 52, 55, 36], Fm = [41, 48, 53, 57, 60, 29], G = [31, 38, 43, 47, 50, 31], Am = [33, 40, 45, 48, 52, 33], Dm = [38, 45, 50, 53, 57, 38], Em = [40, 47, 52, 55, 59, 28];
const secoes = [
  [0.0, c.parte - 0.4, [Am, Fm, Dm, Em], 0.85], // o aeroporto: tensão
  [c.parte - 0.4, c.ai - 0.4, [Cm, Am, Fm, G], 0.85], // a ascensão
  [c.ai - 0.4, c.quem - 0.4, [Am, Fm, Dm, Em], 0.95], // a Justiça
  [c.quem - 0.4, FECHO, [Fm, G, Cm, Am], 0.9], // a fila e o convite
];
const PADRAO = [0, 2, 1, 3, 2, 1, 3, 2];
for (const [ini, fim, prog, forca] of secoes) {
  let k = 0;
  for (let a = ini; a < fim - 0.2; a += BEAT * 4, k++) {
    const b = Math.min(a + BEAT * 4, fim);
    const ac = prog[k % 4];
    pad(ac.slice(0, 5), a - 0.03, b, { att: 0.15, rel: 0.25, g: 0.05 * forca, corte: () => 1700, rev: 0.45 });
    grave(ac[5], a, b - 0.02, { g: 0.22 * forca, passo: BEAT / 2, dec: 8 });
    const tons = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[2] + 24];
    for (let t = a, j = 0; t < b - 0.05; t += BEAT / 2, j++) marimba(t, tons[PADRAO[j % 8]], { g: 0.045 * forca * (j % 2 ? 0.75 : 1), pan: Math.sin(j) * 0.4 });
    for (let t = a, j = 0; t < b - 0.05; t += BEAT, j++) {
      if (j % 2 === 0) bumbo(t, { g: 0.42 * forca, f0: 120, f1: 50, dec: 9, click: 0.12 });
      else for (const dt of [0, 0.012]) ruidoF(t + dt, 0.1, { tipo: "bp", f: 1700, Q: 0.9, g: 0.05 * forca, dec: 30, rev: 0.4 });
      for (const s of [0, 0.5]) ruidoF(t + s * BEAT, 0.05, { tipo: "hp", f: 8000, g: s ? 0.016 : 0.024, dec: 55, pan: s ? 0.35 : -0.25, att: 0.006 });
    }
  }
}

// =====================================================================
// EFEITOS (cada um ancorado a uma marcação "c.nome" de filmes.config.mjs)
// =====================================================================
const zap = (t0, g = 0.06, pan = 0) => {
  blip(t0, 1568, 1560, { g, dur: 0.07, pan, rev: 0.2 });
  blip(t0 + 0.09, 2093, 2085, { g: g * 0.9, dur: 0.1, pan, rev: 0.25 });
};
impacto(0.2, 0.5); // abertura
for (let k = 0; k < 6; k++) blip(c.noite - 0.2 + k * 0.5, 2200, 2190, { g: 0.025, dur: 0.05, rev: 0.2 }); // relógio
riser(c.policia - 0.05, c.policia - c.jatinho, 0.06); // motor do jato subindo
for (let k = 0; k < 4; k++) blip(c.policia + k * 0.32, k % 2 ? 950 : 750, k % 2 ? 945 : 745, { g: 0.045, dur: 0.28, rev: 0.3 }); // sirene
impacto(c.policia, 0.7);
whoosh(c.parte - 0.45, 1.0, 0.09, -0.6, 0.6);
pop(c.daniel, 900, 0.05);
sino(c.master, [79, 83, 86], { g: 0.035, dur: 1.2 }); // vira Master
desconto(c.lucro, 0.2);
whoosh(c.ai - 0.45, 1.0, 0.09, 0.5, -0.5);
blip(c.fuga, 500, 300, { g: 0.05, dur: 0.5 });
pop(c.solto, 1100, 0.05);
impacto(c.supremo, 0.6);
braam(c.indiciado);
whoosh(c.quem - 0.45, 1.1, 0.09, -0.5, 0.5);
blip(c.limite + 0.3, 400, 250, { g: 0.05, dur: 0.4 });
for (let k = 0; k < 3; k++) pop(c.cadeiras + k * 0.25, 800 - k * 120, 0.04); // martelo do leilão
zap(c.mande - 0.1, 0.07);
whoosh(c.mande - 0.05, 1.0, 0.07, -0.4, 0.4);
const STING = FECHO + 0.25;
[24, 36, 43, 48, 52, 55, 60, 64].forEach((m, j) => piano(STING + j * 0.02, m, 0.6 - j * 0.03, { dur: Math.min(6.5, DUR - STING - 0.1), pan: j * 0.22 - 0.77, rev: 0.6 }));
pad([36, 43, 48, 52, 59], STING - 0.15, DUR - 2.0, { att: 0.5, rel: 1.8, g: 0.09, corte: (t) => 2600 - 1500 * suave((t - STING) / 6), rev: 0.7 });
sino(STING + 0.05, [72, 76, 79, 84], { g: 0.035, dur: 4, rev: 1 });
bumbo(STING, { g: 0.45, f0: 100, f1: 38, dec: 3, click: 0.15, alvo: SFX, rev: 0.4, revAlvo: REV_S });

// =====================================================================
// MIX
// =====================================================================
const [dL, dR] = pingpong(DLY, BEAT * 0.75, 0.3);
for (let i = 0; i < N; i++) {
  MUS[0][i] += dL[i] * 0.3;
  MUS[1][i] += dR[i] * 0.3;
}
const rm = freeverb(REV_M, 0.8, 0.3);
const rs = freeverb(REV_S, 0.84, 0.25);
const musica = bus(), efeitos = bus();
for (let i = 0; i < N; i++)
  for (const ch of [0, 1]) {
    musica[ch][i] = MUS[ch][i] + rm[ch][i];
    efeitos[ch][i] = SFX[ch][i] + rs[ch][i];
  }
mkdirSync(join(raiz, "out", "audio"), { recursive: true });
mkdirSync(join(raiz, "public", "mix"), { recursive: true });
writeWav(join(raiz, "out", "audio", `${ID}-musica.wav`), musica);
writeWav(join(raiz, "out", "audio", `${ID}-efeitos.wav`), efeitos);

const vozMp3 = join(raiz, "public", "voz", `${ID}.mp3`);
const temVoz = existsSync(vozMp3) && d.voz !== "estimada";
const voz = bus();
if (temVoz) {
  const vozNorm = join(raiz, "out", "audio", `${ID}-voz.wav`);
  ff(["-i", vozMp3, "-af", "highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-2:LRA=7", "-ar", String(SR), "-ac", "2", vozNorm]);
  const [VL, VR] = decode(vozNorm);
  const v0 = Math.round(d.preRoll * SR);
  for (let j = 0; j < VL.length && v0 + j < N; j++) [voz[0][v0 + j], voz[1][v0 + j]] = [VL[j], VR[j]];
}
const MUSICA = 10 ** (Number(process.env.MUSICA_DB ?? (temVoz ? -5 : -1)) / 20);
const EFEITOS = 10 ** (Number(process.env.EFEITOS_DB ?? -1) / 20);
const mix = bus();
let env = 0;
for (let i = 0; i < N; i++) {
  const lvl = Math.max(Math.abs(voz[0][i]), Math.abs(voz[1][i]));
  env += (lvl - env) * (lvl > env ? 1 / (SR * 0.01) : 1 / (SR * 0.35));
  const duck = 1 - 0.45 * Math.min(1, env / 0.05);
  const f = Math.min(1, i / (0.02 * SR)) * Math.min(1, Math.max(0, (N - i) / (1.0 * SR)));
  for (const ch of [0, 1]) mix[ch][i] = (voz[ch][i] + musica[ch][i] * MUSICA * duck + efeitos[ch][i] * EFEITOS) * f;
}
const bruto = join(raiz, "out", "audio", `${ID}-bruto.wav`);
writeWav(bruto, mix);
const final = join(raiz, "public", "mix", `${ID}.wav`);
ff(["-i", bruto, "-af", "highpass=f=32,equalizer=f=180:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-16dB:ratio=2:attack=15:release=220:makeup=1,loudnorm=I=-14:TP=-2.2:LRA=9", "-ar", String(SR), "-ac", "2", "-c:a", "pcm_s16le", final]);
const m = lufs(final);
console.log(`${ID}: ${DUR.toFixed(2)}s · ${m.input_i} LUFS · pico ${m.input_tp} dBTP · ${temVoz ? "com voz" : "SEM VOZ (provisório)"}`);
