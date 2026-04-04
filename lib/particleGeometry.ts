export interface ParticleData {
  originPositions:    Float32Array;   // initial positions on sphere surface (3 per particle)
  explosionTargets:   Float32Array;   // where each piece flies on scroll (3 per particle)
  speedFactors:       Float32Array;   // per-particle explosion timing variation
  explosionRotations: Float32Array;   // tumble angle offsets during explosion (3 per particle)
  orbitAxes:          Float32Array;   // each piece's personal rotation axis (3 per particle)
  orbitSpeeds:        Float32Array;   // rad/s, some positive some negative
  wobbleFrequencies:  Float32Array;
  wobblePhases:       Float32Array;
  wobbleAmplitudes:   Float32Array;
  wobbleAxes:         Float32Array;
  scales:             Float32Array;
  initialRotations:   Float32Array;   // random initial facing
  count:              number;
}

export function buildParticleData(count: number, radius: number): ParticleData {
  const originPositions    = new Float32Array(count * 3);
  const explosionTargets   = new Float32Array(count * 3);
  const speedFactors       = new Float32Array(count);
  const explosionRotations = new Float32Array(count * 3);
  const orbitAxes          = new Float32Array(count * 3);
  const orbitSpeeds        = new Float32Array(count);
  const wobbleFrequencies  = new Float32Array(count);
  const wobblePhases       = new Float32Array(count);
  const wobbleAmplitudes   = new Float32Array(count);
  const wobbleAxes         = new Float32Array(count * 3);
  const scales             = new Float32Array(count);
  const initialRotations   = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // ── Uniform sphere surface distribution ────────────────────────────────
    // cosTheta ∈ [-1, 1] uniform → unbiased over surface area
    const cosT = 1 - 2 * Math.random();
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const phi  = Math.random() * Math.PI * 2;
    // Y is up — matches the camera looking down the Z axis
    const px = radius * sinT * Math.cos(phi);
    const py = radius * cosT;
    const pz = radius * sinT * Math.sin(phi);

    originPositions[i * 3]     = px;
    originPositions[i * 3 + 1] = py;
    originPositions[i * 3 + 2] = pz;

    // ── Explosion: radiate outward from the sphere surface ────────────────
    const nx = px / radius;
    const ny = py / radius;
    const nz = pz / radius;
    const push = radius * (2 + Math.random() * 4);
    explosionTargets[i * 3]     = px + nx * push + (Math.random() - 0.5) * 100;
    explosionTargets[i * 3 + 1] = py + ny * push + (Math.random() - 0.5) * 100;
    explosionTargets[i * 3 + 2] = pz + nz * push + (Math.random() - 0.5) * 150;

    speedFactors[i] = 0.3 + Math.random() * 0.9;

    // Tumble rotation during explosion
    explosionRotations[i * 3]     = (Math.random() - 0.5) * Math.PI * 3;
    explosionRotations[i * 3 + 1] = (Math.random() - 0.5) * Math.PI * 3;
    explosionRotations[i * 3 + 2] = (Math.random() - 0.5) * Math.PI * 3;

    // ── Per-piece orbit axis (random unit vector) ─────────────────────────
    // Each piece orbits around its own axis → some go horizontal, some
    // vertical, some diagonal. Together they create the swirling sphere feel.
    const oax = Math.random() - 0.5;
    const oay = Math.random() - 0.5;
    const oaz = Math.random() - 0.5;
    const olen = Math.sqrt(oax * oax + oay * oay + oaz * oaz) || 1;
    orbitAxes[i * 3]     = oax / olen;
    orbitAxes[i * 3 + 1] = oay / olen;
    orbitAxes[i * 3 + 2] = oaz / olen;

    // Orbit speed — mix of fast and slow pieces, some reversed
    orbitSpeeds[i] = (Math.random() < 0.5 ? 1 : -1) * (0.08 + Math.random() * 0.35);

    // ── Subtle residual wobble (keeps pieces from feeling locked) ─────────
    wobbleFrequencies[i] = 0.05 + Math.random() * 0.15;
    wobblePhases[i]      = Math.random() * Math.PI * 2;
    wobbleAmplitudes[i]  = 1 + Math.random() * 2.5;   // much tighter than before

    const wax = Math.random() - 0.5;
    const way = Math.random() - 0.5;
    const waz = Math.random() - 0.5;
    const wlen = Math.sqrt(wax * wax + way * way + waz * waz) || 1;
    wobbleAxes[i * 3]     = wax / wlen;
    wobbleAxes[i * 3 + 1] = way / wlen;
    wobbleAxes[i * 3 + 2] = waz / wlen;

    // ── Size mix (same as before) ─────────────────────────────────────────
    const r = Math.random();
    if      (r < 0.15) scales[i] = 0.2 + Math.random() * 0.3;
    else if (r < 0.75) scales[i] = 0.6 + Math.random() * 0.8;
    else if (r < 0.95) scales[i] = 1.4 + Math.random() * 0.8;
    else               scales[i] = 2.2 + Math.random() * 1.0;

    initialRotations[i * 3]     = Math.random() * Math.PI * 2;
    initialRotations[i * 3 + 1] = Math.random() * Math.PI * 2;
    initialRotations[i * 3 + 2] = Math.random() * Math.PI * 2;
  }

  return {
    originPositions,
    explosionTargets,
    speedFactors,
    explosionRotations,
    orbitAxes,
    orbitSpeeds,
    wobbleFrequencies,
    wobblePhases,
    wobbleAmplitudes,
    wobbleAxes,
    scales,
    initialRotations,
    count,
  };
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function clamp(v: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}
