// Trilha do pao1 (Peso no Bolso), SINTETIZADA POR CÓDIGO: madrugada delicada, buzina do navio, tensão no dólar,
// moedas a cada elo da corrente e volta calma para a pergunta. Voz com ducking, master -14 LUFS.
//   node scripts/trilha-pao1.mjs
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SR, criarMotor, decode, ff, lufs, writeWav } from "./lib/sintese.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ID = process.argv[2] ?? "pao1";
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
// GROOVE (uma seção por bloco de cor)
// =====================================================================
const BEAT = 60 / 92;
const FECHO = c.fim + 1.0;
const C_ = [36, 43, 48, 52, 55, 36], Am = [33, 40, 45, 48, 52, 33], F_ = [41, 48, 53, 57, 60, 29], G_ = [31, 38, 43, 47, 50, 31], Em = [40, 47, 52, 55, 59, 28];
const Cm = [36, 43, 48, 51, 55, 36], Ab = [32, 39, 44, 48, 51, 32], Fm = [41, 48, 53, 56, 60, 29], Gs = [31, 38, 43, 46, 50, 31];
const T1 = c.safra - 0.75, T2 = c.importado - 0.4, T3 = c.moinho - 1.15, T4 = c.continua - 0.5, T5 = c.comenta - 0.3;
const secoes = [
  [0.0, T1, [C_, Em, Am, F_], 0.55, false], // madrugada: delicado
  [T1, T2, [Am, F_, C_, G_], 0.85, true], // trigo e navio
  [T2, T3, [Cm, Ab, Fm, Gs], 0.95, true], // dólar alto: tensão
  [T3, T4, [Am, F_, C_, G_], 1.0, true], // corrente até o balcão
  [T4, T5, [F_, Am, F_, G_], 0.7, false], // o pão não muda
  [T5, FECHO, [C_, Am, F_, G_], 0.65, false], // pergunta final
];
const PADRAO = [0, 2, 1, 3, 2, 1, 3, 2];
for (const [ini, fim, prog, forca, bat] of secoes) {
  let k = 0;
  for (let a = ini; a < fim - 0.2; a += BEAT * 4, k++) {
    const b = Math.min(a + BEAT * 4, fim);
    const ac = prog[k % 4];
    pad(ac.slice(0, 5), a - 0.03, b, { att: 0.25, rel: 0.3, g: 0.055 * forca, corte: () => 1500, rev: 0.55 });
    grave(ac[5], a, b - 0.02, { g: 0.2 * forca, passo: BEAT, dec: 6 });
    const tons = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[2] + 24];
    for (let t = a, j = 0; t < b - 0.05; t += BEAT / 2, j++) marimba(t, tons[PADRAO[j % 8]], { g: 0.04 * forca * (j % 2 ? 0.7 : 1), pan: Math.sin(j) * 0.4, rev: 0.4 });
    if (bat)
      for (let t = a, j = 0; t < b - 0.05; t += BEAT, j++) {
        if (j % 2 === 0) bumbo(t, { g: 0.4 * forca, f0: 115, f1: 48, dec: 9, click: 0.1 });
        else ruidoF(t, 0.1, { tipo: "bp", f: 1700, Q: 0.9, g: 0.045 * forca, dec: 30, rev: 0.4 });
        ruidoF(t + 0.5 * BEAT, 0.05, { tipo: "hp", f: 8000, g: 0.016, dec: 55, pan: 0.3, att: 0.006 });
      }
  }
}

// =====================================================================
// EFEITOS
// =====================================================================
const moeda = (t0, g = 0.045, pan = 0) => {
  blip(t0, 2900, 2880, { g, dur: 0.09, pan, rev: 0.25 });
  blip(t0 + 0.05, 3800, 3790, { g: g * 0.7, dur: 0.12, pan, rev: 0.3 });
};
sino(0.3, [76, 79, 84], { g: 0.022, dur: 2.5, rev: 0.8 }); // madrugada
pop(c.saquinho - 0.05, 900, 0.05);
whoosh(T1 - 0.05, 1.0, 0.09, -0.6, 0.6);
pop(c.safra, 600, 0.05, -0.4);
buzina(c.nove - 0.2, 1.0); // navio
pop(c.trinta - 0.05, 1100, 0.05, 0.4);
whoosh(T2 - 0.05, 1.0, 0.09, 0.5, -0.5);
impacto(c.cinco - 0.1, 0.5); // cofre abre / dólar
for (let k = 0; k < 10; k++) ruidoF(c.cinco + k * 0.12, 0.05, { tipo: "bp", f: 2500 + rnd() * 1500, Q: 1.2, g: 0.025, dec: 40, alvo: SFX, pan: (rnd() - 0.5) * 1.2 }); // notas voando
whoosh(T3 - 0.05, 1.0, 0.09, -0.5, 0.5);
[c.moinho, c.padaria, c.balcao].forEach((t0, i) => { for (let k = 0; k < 3 + i * 2; k++) moeda(t0 + 0.1 + k * 0.13, 0.035, i - 1); });
whoosh(T4 - 0.05, 1.0, 0.07, 0.4, -0.4);
[72, 70, 69].forEach((m, k) => blip(c.render + k * 0.22, hz(m), hz(m - 0.1), { g: 0.045, dur: 0.22, rev: 0.3 })); // dinheiro encolhe
sino(c.panico + 0.4, [76, 79, 84], { g: 0.025, dur: 1.2 });
whoosh(T5 - 0.05, 1.0, 0.07, -0.4, 0.4);
sino(c.comenta + 0.2, [72, 76, 79, 84], { g: 0.03, dur: 2 });
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
