/**
 * Deterministic PRNG helpers shared by hazards and procedural generation.
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

export function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
