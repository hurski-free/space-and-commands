/**
 * Deterministic PRNG helpers shared by hazards and procedural generation.
 *
 * Typical flow: `const rng = mulberry32(hashSeed(sessionSeed))`, then call `rng()` for each roll.
 * Derive sub-streams by hashing a label into the seed, e.g. `hashSeed(\`${seed}:planet-landing\`)`.
 */

/**
 * Normalize a session seed to a 32-bit integer for `mulberry32`.
 *
 * - `string` — stable FNV-1a hash (same string → same int across runs).
 * - `number` — truncated to int32 (use for quick tests or fixed streams).
 * - `null` — non-deterministic mix of time and `Math.random()` (casual runs without `rngSeed`).
 */
export function hashSeed(seed: string | number | null): number {
  if (seed === null) {
    return (Date.now() ^ Math.floor(Math.random() * 0x1_000_000)) | 0
  }
  if (typeof seed === 'number') {
    return seed | 0
  }
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h | 0
}

/**
 * Mulberry32 PRNG: returns a stateful `next` that yields uniform floats in [0, 1).
 *
 * Pass the result of `hashSeed` (or `hashSeed(seed) ^ streamId` for isolated sub-streams).
 * Each call advances internal state; reuse the same closure for one logical sequence
 * (e.g. one procedural ring or one hazard scheduler). Create a new closure per independent stream.
 */
export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
