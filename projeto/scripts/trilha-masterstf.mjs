// Trilha do masterstf (Caso Master · capítulo do Supremo), SINTETIZADA POR CÓDIGO: clima de investigação em tom menor,
// pulso grave, carimbo, pastas, portas da PGR e moedas no fecho. Master -14 LUFS.
//   node scripts/trilha-masterstf.mjs
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SR, criarMotor, decode, ff, lufs, writeWav } from "./lib/sintese.mjs";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ID = process.argv[2] ?? "masterstf";
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
const BEAT = 60 / 100;
const Am = [33, 40, 45, 48, 52, 33], F_ = [41, 48, 53, 57, 60, 29], Dm = [38, 45, 50, 53, 57, 26], E_ = [40, 47, 52, 56, 59, 28], C_ = [36, 43, 48, 52, 55, 36], G_ = [31, 38, 43, 47, 50, 31];
const T1 = c.celular - 0.68, T2 = c.dez - 0.85, T3 = c.pgr - 0.85, T4 = c.comentou - 1.05, T5 = c.conta - 0.6, T6 = c.manda - 0.3;
const secoes = [
  [0.0, T1, [Am, F_, Dm, E_], 0.9, true], // gancho: relatório rejeitado
  [T1, T2, [Dm, Am, F_, E_], 0.7, false], // celular: suspense, sem bateria
  [T2, T3, [Am, F_, Dm, E_], 1.0, true], // pastas
  [T3, T4, [F_, Dm, Am, E_], 0.9, true], // PGR
  [T4, T5, [Dm, Dm, Am, Am], 0.55, false], // sem comentários / não é crime: respiro
  [T5, DUR, [C_, G_, Am, F_], 0.9, true], // a conta + CTA (abre pro maior)
];
const PADRAO = [0, 2, 1, 3, 2, 1, 3, 2];
for (const [ini, fim, prog, forca, bat] of secoes) {
  let k = 0;
  for (let a = ini; a < fim - 0.1; a += BEAT * 4, k++) {
    const b = Math.min(a + BEAT * 4, fim);
    const ac = prog[k % 4];
    pad(ac.slice(0, 5), a - 0.03, b, { att: bat ? 0.15 : 0.6, rel: 0.3, g: (bat ? 0.055 : 0.08) * forca, corte: () => (bat ? 1500 : 1000), rev: bat ? 0.5 : 0.85 });
    grave(ac[5], a, b - 0.02, { g: 0.24 * forca, passo: BEAT / 2, dec: 6 });
    const tons = [ac[2] + 12, ac[3] + 12, ac[4] + 12, ac[2] + 24];
    for (let t = a, j = 0; t < b - 0.05; t += BEAT / 2, j++) marimba(t, tons[PADRAO[j % 8]], { g: 0.034 * forca * (j % 2 ? 0.7 : 1), pan: Math.sin(j) * 0.4, rev: bat ? 0.4 : 0.75 });
    if (bat)
      for (let t = a, j = 0; t < b - 0.05; t += BEAT, j++) {
        bumbo(t, { g: (j % 2 === 0 ? 0.44 : 0.26) * forca, f0: 110, f1: 42, dec: 8, click: 0.1 });
        if (j % 2) for (const dt of [0, 0.012]) ruidoF(t + dt, 0.1, { tipo: "bp", f: 1600, Q: 0.9, g: 0.045 * forca, dec: 30, rev: 0.4 });
        ruidoF(t + 0.5 * BEAT, 0.05, { tipo: "hp", f: 8500, g: 0.014, dec: 55, pan: 0.3, att: 0.006 });
      }
  }
}

// =====================================================================
// EFEITOS
// =====================================================================
braam(0.05, 1.6, 0.06);
impacto(0.25, 0.45); // carimbo do gancho (close)
riser(c.rejeitou - 1.0, 0.95, 0.045);
impacto(c.rejeitou, 0.5); // carimbo REJEITADO
whoosh(c.delegados + 0.1, 0.7, 0.05, -0.6, -0.9);
whoosh(c.delegados + 0.15, 0.7, 0.05, 0.6, 0.9);
whoosh(c.refazer - 0.1, 0.5, 0.06, -0.2, 0.6); // pasta pro lixo
ruidoF(c.refazer + 0.45, 0.12, { tipo: "bp", f: 900, Q: 1, g: 0.09, dec: 30, alvo: SFX, pan: 0.5 });
pop(c.refazer + 0.3, 1000, 0.04);
whoosh(T1 - 0.05, 0.9, 0.07, 0.5, -0.5);
for (let i = 0; i < 5; i++) blip(c.celular + 0.2 + i * 0.36, 1320, 1320, { g: 0.025, dur: 0.07, pan: 0.2, rev: 0.3 }); // mensagens
for (let i = 0; i < 10; i++) sino(c.ministros + i * 0.09, [76 + (i % 4) * 3], { g: 0.012, dur: 0.8 }); // cadeiras acendendo
whoosh(T2 - 0.05, 0.9, 0.07, -0.5, 0.5);
for (let i = 0; i < 10; i++) pop(c.dez + i * 0.06, 700 + i * 50, 0.03, (i - 4.5) * 0.1);
reverso(c.seis - 0.4, 0.45, 0.04);
impacto(c.quatro + 0.1, 0.3);
[c.nomes, 24.8, 25.46, 26.45].forEach((x, i) => pop(x, 900 + i * 120, 0.035));
whoosh(T3 - 0.05, 0.9, 0.07, 0.5, -0.5);
[c.arquiva, c.investigacao, c.inquerito].forEach((x, i) => sino(x - 0.1, [69 + i * 3, 76 + i * 3], { g: 0.025, dur: 1.0 }));
whoosh(T4 - 0.05, 1.1, 0.06, -0.5, 0.5);
whoosh(T5 - 0.05, 0.9, 0.07, 0.4, -0.4);
for (let i = 0; i < 6; i++) pop(c.oitocentos - 0.2 + i * 0.12, 800 + i * 60, 0.03);
impacto(c.fgc - 0.1, 0.3);
rola(c.fgc + 0.2, 1.6, 0.02);
whoosh(T6 - 0.05, 0.8, 0.06, -0.4, 0.4);
rola(T6 + 0.3, 1.2, 0.018);
pop(c.manda, 1100, 0.05);
const STING = d.fimVoz + 0.1;
[33, 40, 45, 48, 52, 57].forEach((m, j) => piano(STING + j * 0.02, m, 0.5 - j * 0.03, { dur: Math.min(3, DUR - STING - 0.1), pan: j * 0.22 - 0.55, rev: 0.6 }));

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
