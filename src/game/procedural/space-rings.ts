import type { PlanetBody } from '../domain/planet'
import { hashSeed, mulberry32 } from '../core/rng'
import { random, randomHexColor } from '../math'
import { MAX_PLANET_MASS, MAX_PLANET_RADIUS, MIN_PLANET_MASS, MIN_PLANET_RADIUS, RING_INNER_PAD, RING_STEP, RING_TRIGGER_GEN_OFFSET } from './procedural.const'

/** Inner bound of ring n: RING_STEP*n + RING_INNER_PAD */
function ringInnerRadius(n: number): number {
  return RING_STEP * n + RING_INNER_PAD
}

/** Outer bound of ring n: RING_STEP*(n + 1) */
function ringOuterRadius(n: number): number {
  return RING_STEP * (n + 1)
}

/**
 * Player distance from origin at which ring n is generated (shared counter n with ring formulas).
 * Note: ring `0` is expected to be spawned at session start; this threshold applies from n ≥ 1.
 */
export function ringGenerationTriggerDistance(n: number): number {
  return RING_STEP * n + RING_TRIGGER_GEN_OFFSET
}

/** Independent RNG stream per ring for stable replays given session seed. */
export function createRingRng(seed: string | number | null, ringIndex: number): () => number {
  const base = hashSeed(seed) ^ Math.imul(ringIndex, 0x9e3779b1)
  return mulberry32(base)
}

/**
 * Populate one ring with celestial bodies uniformly in the annulus [inner, outer).
 */
export function generateBodiesForRing(ringIndex: number, rng: () => number): PlanetBody[] {
  const inner = ringInnerRadius(ringIndex)
  const outer = ringOuterRadius(ringIndex)
  const span = outer - inner
  const count = 2 + Math.floor(rng() * 5)
  const bodies: PlanetBody[] = []

  for (let i = 0; i < count; i++) {
    const theta = rng() * Math.PI * 2
    const u = rng()
    const r = inner + u * span

    const massKg = random(MIN_PLANET_MASS, MAX_PLANET_MASS)
    const radius = random(MIN_PLANET_RADIUS, MAX_PLANET_RADIUS)
    
    bodies.push({
      id: `ring-${ringIndex}-body-${i}`,
      massKg,
      positionX: Math.cos(theta) * r,
      positionY: Math.sin(theta) * r,
      radius,
      hasFuelDeposits: random(0, 1) < 0.3,
      hasMetalDeposits: random(0, 1) < 0.3,
      color: randomHexColor(),
      scanned: false,
    })
  }

  return bodies
}
