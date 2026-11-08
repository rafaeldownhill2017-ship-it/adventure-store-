// Motor de síntese compartilhado pelas trilhas próprias (apresentação 00 e método 05).
// Tudo gerado por código: osciladores, filtros, reverb e delay; nenhum sample ou serviço de terceiros.
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

export const SR = 48000;
const TAU = Math.PI * 2;

/** Cria barramentos e instrumentos para uma peça de N amostras (semente fixa: mesma saída a cada execução). */
export function criarMotor(N) {
  // ---------- utilitários ----------
  let semente = 20261027;
  const rnd = () => ((semente = (semente * 1664525 + 1013904223) >>> 0) / 4294967296);
  const ruido = () => rnd() * 2 - 1;
  const hz = (m) => 440 * 2 ** ((m - 69) / 12);
  const hash = (i) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const bus = () => [new Float32Array(N), new Float32Array(N)];
  const soma = (b, i, l, r) => {
    if (i >= 0 && i < N) {
      b[0][i] += l;
      b[1][i] += r;
    }
  };
  const panG = (x) => [Math.cos(((x + 1) * Math.PI) / 4), Math.sin(((x + 1) * Math.PI) / 4)];
  const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * x));

  class Biquad {
    constructor() {
      this.x1 = this.x2 = this.y1 = this.y2 = 0;
      this.set("lp", 1000);
    }
    set(tipo, f, Q = 0.707) {
      f = Math.min(Math.max(f, 12), SR * 0.45);
      const w = (TAU * f) / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Q);
      let b0, b1, b2;
      if (tipo === "lp") [b0, b1, b2] = [(1 - cs) / 2, 1 - cs, (1 - cs) / 2];
      else if (tipo === "hp") [b0, b1, b2] = [(1 + cs) / 2, -(1 + cs), (1 + cs) / 2];
      else [b0, b1, b2] = [al, 0, -al];
      const a0 = 1 + al;
      this.b0 = b0 / a0;
      this.b1 = b1 / a0;
      this.b2 = b2 / a0;
      this.a1 = (-2 * cs) / a0;
      this.a2 = (1 - al) / a0;
      return this;
    }
    run(x) {
      const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
      this.x2 = this.x1;
      this.x1 = x;
      this.y2 = this.y1;
      this.y1 = y;
      return y;
    }
  }
  // Serra com PolyBLEP (sem aliasing audível).
  const blep = (t, dt) => (t < dt ? ((t /= dt), t + t - t * t - 1) : t > 1 - dt ? ((t = (t - 1) / dt), t * t + t + t + 1) : 0);
  class Serra {
    constructor(f) {
      this.f = f;
      this.ph = rnd();
    }
    run() {
      const dt = this.f / SR;
      const v = 2 * this.ph - 1 - blep(this.ph, dt);
      this.ph += dt;
      if (this.ph >= 1) this.ph -= 1;
      return v;
    }
  }

  // ---------- barramentos ----------
  const MUS = bus(); // música seca
  const SFX = bus(); // efeitos secos
  const REV_M = bus(); // envio de reverb da música
  const REV_S = bus(); // envio de reverb dos efeitos
  const DLY = bus(); // envio do delay (arpejo)

  // ---------- instrumentos ----------
  /** Pad de serras desafinadas, filtro passa-baixa variável, abertura estéreo. */
  function pad(notas, t0, t1, { att = 1.2, rel = 1.6, g = 0.1, corte = () => 900, Q = 0.75, rev = 0.5, alvo = MUS, revAlvo = REV_M } = {}) {
    const i0 = Math.floor(t0 * SR), i1 = Math.min(N, Math.floor((t1 + rel) * SR));
    const osc = notas.flatMap((m) => [-1, 0, 1].map((p) => ({ s: new Serra(hz(m) * 2 ** ((p * 7 + (rnd() - 0.5) * 3) / 1200)), p })));
    const f = [new Biquad(), new Biquad(), new Biquad(), new Biquad()];
    const norm = g / Math.sqrt(osc.length);
    for (let i = i0; i < i1; i++) {
      const t = i / SR;
      if ((i - i0) % 32 === 0) {
        const fc = corte(t);
        f[0].set("lp", fc, Q);
        f[1].set("lp", fc, Q);
        f[2].set("lp", fc * 1.4, 0.6);
        f[3].set("lp", fc * 1.4, 0.6);
      }
      let l = 0, r = 0;
      for (const o of osc) {
        const v = o.s.run();
        l += v * (o.p <= 0 ? 1 : 0.3);
        r += v * (o.p >= 0 ? 1 : 0.3);
      }
      const env = suave((t - t0) / att) * (t > t1 ? 1 - suave((t - t1) / rel) : 1);
      const L = f[2].run(f[0].run(l)) * norm * env, R = f[3].run(f[1].run(r)) * norm * env;
      soma(alvo, i, L, R);
      soma(revAlvo, i, L * rev, R * rev);
    }
  }

  /** Grave: senoide com 2º harmônico e saturação leve, em pulsos de colcheia (bombeado). */
  function grave(m, t0, t1, { g = 0.3, passo = 0.3, dec = 6 } = {}) {
    const f = hz(m);
    let ph = 0;
    for (let i = Math.floor(t0 * SR); i < Math.min(N, Math.floor((t1 + 0.05) * SR)); i++) {
      const t = i / SR;
      ph += (TAU * f) / SR;
      const local = (t - t0) % passo;
      const env = Math.min(1, local / 0.006) * (0.25 + 0.75 * Math.exp(-local * dec)) * (t > t1 ? 0 : 1) * Math.min(1, (t1 - t) / 0.02);
      const v = Math.tanh(1.6 * (Math.sin(ph) + 0.4 * Math.sin(2 * ph))) * g * env;
      soma(MUS, i, v, v);
    }
  }

  /** Bumbo / batida grave (pitch caindo + clique). */
  function bumbo(t0, { g = 0.8, f0 = 140, f1 = 46, dec = 7, click = 0.25, alvo = MUS, rev = 0.08, revAlvo = REV_M } = {}) {
    let ph = 0;
    const hp = new Biquad().set("hp", 1500);
    const len = Math.floor((5 / dec + 0.1) * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      const f = f1 + (f0 - f1) * Math.exp(-t * 28);
      ph += (TAU * f) / SR;
      const v = (Math.sin(ph) * Math.exp(-t * dec) * Math.min(1, t / 0.002) + hp.run(ruido()) * Math.exp(-t * 300) * click) * g;
      const i = Math.floor(t0 * SR) + k;
      soma(alvo, i, v, v);
      soma(revAlvo, i, v * rev, v * rev);
    }
  }

  /** Ruído filtrado com envelope (chimbal, caixa, sopro). */
  function ruidoF(t0, dur, { tipo = "hp", f = 7000, Q = 0.7, g = 0.05, dec = 60, pan = 0, att = 0.001, alvo = MUS, rev = 0, revAlvo = REV_M, varre = null, envF = null } = {}) {
    const fl = new Biquad().set(tipo, f, Q);
    const [gl, gr] = panG(pan);
    const len = Math.floor(dur * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      if (varre && k % 32 === 0) fl.set(tipo, varre(t / dur), Q);
      const env = envF ? envF(t / dur) : Math.min(1, t / att) * Math.exp(-t * dec);
      const v = fl.run(ruido()) * env * g;
      const i = Math.floor(t0 * SR) + k;
      soma(alvo, i, v * gl, v * gr);
      if (rev) soma(revAlvo, i, v * gl * rev, v * gr * rev);
    }
  }

  /** Piano aditivo (parciais levemente inarmônicas + martelo). */
  function piano(t0, m, vel, { dur = 4, pan = 0, alvo = MUS, rev = 0.35, revAlvo = REV_M } = {}) {
    const f = hz(m);
    const parc = [];
    for (let n = 1; n <= 14; n++) {
      const fn = f * n * Math.sqrt(1 + 0.00035 * n * n);
      if (fn > 16000) break;
      parc.push({ w: (TAU * fn) / SR, a: (n === 1 ? 1 : 0.6) / n ** (1.25 - vel * 0.35), dec: (1.1 + n * 0.55) * (f > 500 ? 1.3 : 1), ph: rnd() * TAU });
    }
    const lp = new Biquad().set("lp", 2500);
    const [gl, gr] = panG(pan);
    const len = Math.floor(dur * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      let v = 0;
      for (const p of parc) v += Math.sin(p.ph + p.w * k) * p.a * Math.exp(-t * p.dec);
      v = v * Math.min(1, t / 0.003) * Math.min(1, (dur - t) / 0.3) + lp.run(ruido()) * Math.exp(-t * 90) * 0.12;
      v *= vel * 0.22;
      const i = Math.floor(t0 * SR) + k;
      soma(alvo, i, v * gl, v * gr);
      soma(revAlvo, i, v * gl * rev, v * gr * rev);
    }
  }

  /** Pluck do arpejo: serra + quadrada com filtro que fecha rápido. */
  function pluck(t0, m, { g = 0.08, brilho = 2600, dec = 9, pan = 0, dly = 0.35, rev = 0.25 } = {}) {
    const s1 = new Serra(hz(m)), s2 = new Serra(hz(m) * 1.003);
    const fl = new Biquad();
    const [gl, gr] = panG(pan);
    const len = Math.floor(0.6 * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      if (k % 16 === 0) fl.set("lp", 300 + brilho * Math.exp(-t * 16), 1.1);
      const v = fl.run(s1.run() * 0.6 + s2.run() * 0.4) * Math.min(1, t / 0.002) * Math.exp(-t * dec) * g;
      const i = Math.floor(t0 * SR) + k;
      soma(MUS, i, v * gl, v * gr);
      soma(DLY, i, v * dly, v * dly);
      soma(REV_M, i, v * gl * rev, v * gr * rev);
    }
  }

  /** Seno curto com queda de pitch (blips de interface, cliques, avisos). */
  function blip(t0, f0, f1, { g = 0.08, dur = 0.09, pan = 0, rev = 0.3 } = {}) {
    let ph = 0;
    const [gl, gr] = panG(pan);
    const len = Math.floor(dur * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      ph += (TAU * (f1 + (f0 - f1) * Math.exp(-t * 40))) / SR;
      const v = Math.sin(ph) * Math.min(1, t / 0.001) * Math.exp((-t * 5) / dur) * g;
      const i = Math.floor(t0 * SR) + k;
      soma(SFX, i, v * gl, v * gr);
      soma(REV_S, i, v * gl * rev, v * gr * rev);
    }
  }

  /** Sinos suaves (brilho) — senoides agudas com trêmulo. */
  function sino(t0, notas, { g = 0.05, dur = 3, rev = 0.8, alvo = SFX, revAlvo = REV_S } = {}) {
    notas.forEach((m, j) => {
      const f = hz(m) * (1 + (rnd() - 0.5) * 0.002);
      const [gl, gr] = panG((j / Math.max(1, notas.length - 1)) * 1.2 - 0.6);
      const len = Math.floor(dur * SR);
      for (let k = 0; k < len; k++) {
        const t = k / SR;
        const v = (Math.sin((TAU * f * k) / SR) + 0.25 * Math.sin((TAU * f * 2.01 * k) / SR) * Math.exp(-t * 3)) * Math.min(1, t / 0.004) * Math.exp(-t * (2.2 / dur) * 2) * (1 + 0.15 * Math.sin(t * 9 + j)) * g;
        const i = Math.floor((t0 + j * 0.035) * SR) + k;
        soma(alvo, i, v * gl, v * gr);
        soma(revAlvo, i, v * gl * rev, v * gr * rev);
      }
    });
  }

  // ---------- efeitos compostos ----------
  const impacto = (t0, g = 1) => {
    bumbo(t0, { g: 0.95 * g, f0: 110, f1: 33, dec: 2.6, click: 0.35, alvo: SFX, rev: 0.35, revAlvo: REV_S });
    ruidoF(t0, 1.1, { tipo: "lp", g: 0.35 * g, varre: (x) => 7000 * Math.exp(-x * 4) + 150, envF: (x) => Math.min(1, x * 200) * Math.exp(-x * 6), alvo: SFX, rev: 0.6, revAlvo: REV_S });
  };
  const whoosh = (t1, dur = 0.7, g = 0.22, de = -0.8, ate = 0.8) => {
    const fl = new Biquad();
    const len = Math.floor(dur * SR);
    for (let k = 0; k < len; k++) {
      const x = k / len;
      if (k % 32 === 0) fl.set("bp", 350 + 3200 * Math.sin(Math.PI * x) ** 2, 1.3);
      const v = fl.run(ruido()) * Math.sin(Math.PI * x) ** 2 * g;
      const [gl, gr] = panG(de + (ate - de) * x);
      const i = Math.floor((t1 - dur * 0.7) * SR) + k;
      soma(SFX, i, v * gl, v * gr);
      soma(REV_S, i, v * gl * 0.3, v * gr * 0.3);
    }
  };
  const riser = (t1, dur, g = 0.2) => {
    ruidoF(t1 - dur, dur, { tipo: "bp", Q: 2, g, varre: (x) => 250 * 28 ** x, envF: (x) => x ** 2.2 * Math.min(1, (1 - x) * 60), alvo: SFX, rev: 0.4, revAlvo: REV_S });
    const s = new Serra(90);
    const fl = new Biquad().set("lp", 1200);
    const len = Math.floor(dur * SR);
    for (let k = 0; k < len; k++) {
      const x = k / len;
      s.f = 90 * 7 ** x;
      const v = fl.run(s.run()) * x ** 3 * g * 0.35 * Math.min(1, (1 - x) * 60);
      soma(SFX, Math.floor((t1 - dur) * SR) + k, v, v);
    }
  };
  const reverso = (t1, dur, g = 0.18, f = 2500) =>
    ruidoF(t1 - dur, dur, { tipo: "hp", f, g, envF: (x) => x ** 3 * Math.min(1, (1 - x) * 80), alvo: SFX, rev: 0.6, revAlvo: REV_S });
  const braam = (t0) => {
    const notas = [26, 38, 45, 50, 57];
    const osc = notas.flatMap((m) => [new Serra(hz(m) * 0.997), new Serra(hz(m) * 1.004)]);
    const fl = [new Biquad(), new Biquad()];
    let ph = 0;
    const len = Math.floor(4.2 * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      if (k % 32 === 0) {
        const fc = 2600 * Math.exp(-t * 1.3) + 180;
        fl[0].set("lp", fc, 1.4);
        fl[1].set("lp", fc * 0.8, 0.7);
      }
      let v = 0;
      for (const o of osc) v += o.run();
      v = Math.tanh(fl[1].run(fl[0].run(v / osc.length)) * 3.2);
      ph += (TAU * hz(26) * (1 - 0.06 * Math.min(1, t))) / SR;
      const env = Math.min(1, t / 0.012) * Math.exp(-t * 0.9);
      const s = (v * 0.42 + Math.sin(ph) * 0.55) * env;
      const i = Math.floor(t0 * SR) + k;
      soma(SFX, i, s, s);
      soma(REV_S, i, s * 0.45, s * 0.45);
    }
  };
  const rasgo = (t0) => {
    const fl = new Biquad().set("bp", 2600, 0.8);
    const len = Math.floor(0.5 * SR);
    let gate = 1, prox = 0;
    for (let k = 0; k < len; k++) {
      if (k >= prox) {
        gate = rnd() < 0.35 ? 1 : 0.15 + rnd() * 0.2;
        prox = k + Math.floor((0.002 + rnd() * 0.005) * SR);
      }
      const x = k / len;
      const v = fl.run(ruido()) * gate * Math.min(1, x * 12) * (1 - x) ** 1.5 * 0.5;
      soma(SFX, Math.floor(t0 * SR) + k, v * 0.8, v);
      soma(REV_S, Math.floor(t0 * SR) + k, v * 0.25, v * 0.25);
    }
    bumbo(t0 + 0.02, { g: 0.4, f0: 180, f1: 70, dec: 14, click: 0.4, alvo: SFX, rev: 0.2, revAlvo: REV_S });
  };
  const desliga = (t0) => {
    let ph = 0;
    const len = Math.floor(0.9 * SR);
    for (let k = 0; k < len; k++) {
      const t = k / SR;
      ph += (TAU * (60 + 840 * Math.exp(-t * 5))) / SR;
      const v = Math.sin(ph) * Math.exp(-t * 4) * 0.12 * Math.min(1, t / 0.005);
      soma(SFX, Math.floor(t0 * SR) + k, v, v);
      soma(REV_S, Math.floor(t0 * SR) + k, v * 0.4, v * 0.4);
    }
    bumbo(t0 + 0.05, { g: 0.45, f0: 80, f1: 35, dec: 5, click: 0.1, alvo: SFX, rev: 0.3, revAlvo: REV_S });
  };
  const baque = (t0) => {
    bumbo(t0, { g: 0.75, f0: 120, f1: 48, dec: 9, click: 0.5, alvo: SFX, rev: 0.25, revAlvo: REV_S });
    ruidoF(t0, 0.18, { tipo: "bp", f: 420, Q: 1.1, g: 0.5, dec: 30, alvo: SFX, rev: 0.3, revAlvo: REV_S });
  };

  // ---------- efeitos de pós (reverb e delay) ----------
  function freeverb([inL, inR], sala = 0.86, amortece = 0.28) {
    const sc = SR / 44100;
    const mk = (n) => ({ b: new Float32Array(Math.round(n * sc)), i: 0, s: 0 });
    const cL = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map(mk), cR = [1139, 1211, 1300, 1379, 1445, 1514, 1580, 1640].map(mk);
    const aL = [556, 441, 341, 225].map(mk), aR = [579, 464, 364, 248].map(mk);
    const out = bus();
    const pre = Math.round(0.018 * SR);
    const canal = (x, cs, as) => {
      let y = 0;
      for (const cb of cs) {
        const o = cb.b[cb.i];
        cb.s = o * (1 - amortece) + cb.s * amortece;
        cb.b[cb.i] = x + cb.s * sala;
        if (++cb.i >= cb.b.length) cb.i = 0;
        y += o;
      }
      for (const ap of as) {
        const b = ap.b[ap.i];
        const o = -y + b;
        ap.b[ap.i] = y + b * 0.5;
        if (++ap.i >= ap.b.length) ap.i = 0;
        y = o;
      }
      return y;
    };
    for (let i = 0; i < N; i++) {
      const j = i - pre;
      const x = j >= 0 ? (inL[j] + inR[j]) * 0.015 : 0;
      out[0][i] = canal(x, cL, aL) * 1.6;
      out[1][i] = canal(x, cR, aR) * 1.6;
    }
    return out;
  }
  function pingpong([inL, inR], tempo, fb = 0.42) {
    const D = Math.round(tempo * SR);
    const bL = new Float32Array(D), bR = new Float32Array(D);
    const lpL = new Biquad().set("lp", 3200), lpR = new Biquad().set("lp", 3200);
    const out = bus();
    for (let i = 0; i < N; i++) {
      const k = i % D;
      const oL = bL[k], oR = bR[k];
      out[0][i] = oL;
      out[1][i] = oR;
      bL[k] = (inL[i] + inR[i]) * 0.5 + lpR.run(oR) * fb;
      bR[k] = lpL.run(oL) * fb;
    }
    return out;
  }

  return { rnd, ruido, hz, hash, bus, soma, panG, suave, Biquad, Serra, MUS, SFX, REV_M, REV_S, DLY, pad, grave, bumbo, ruidoF, piano, pluck, blip, sino, impacto, whoosh, riser, reverso, braam, rasgo, desliga, baque, freeverb, pingpong };
}

export const ff = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-y", ...args], { maxBuffer: 1e9, windowsHide: true });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  return r.stderr.toString();
};
export const decode = (file) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-f", "f32le", "-ac", "2", "-ar", String(SR), "-"], { maxBuffer: 1e9, windowsHide: true });
  if (r.status !== 0) throw new Error(r.stderr.toString());
  const x = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4);
  const L = new Float32Array(x.length / 2), R = new Float32Array(x.length / 2);
  for (let i = 0; i < L.length; i++) [L[i], R[i]] = [x[i * 2], x[i * 2 + 1]];
  return [L, R];
};
export const writeWav = (file, [L, R]) => {
  const n = L.length;
  const b = Buffer.alloc(44 + n * 8);
  b.write("RIFF");
  b.writeUInt32LE(36 + n * 8, 4);
  b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(3, 20);
  b.writeUInt16LE(2, 22);
  b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 8, 28);
  b.writeUInt16LE(8, 32);
  b.writeUInt16LE(32, 34);
  b.write("data", 36);
  b.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) {
    b.writeFloatLE(L[i], 44 + i * 8);
    b.writeFloatLE(R[i], 48 + i * 8);
  }
  writeFileSync(file, b);
};
export const lufs = (file) => JSON.parse(ff(["-i", file, "-af", "loudnorm=I=-14:TP=-1.2:print_format=json", "-f", "null", "NUL"]).match(/\{[\s\S]*?\}/)[0]);
