import type { PlanetBody } from '../domain/planet'

/**
 * Level objective kinds. Progress uses unique planet ids per task type.
 */
export type LevelTask =
  | { readonly kind: 'scan_planets'; readonly count: number }
  | { readonly kind: 'visit_planets'; readonly count: number }

/** Planet spawn data for a level (runtime `PlanetBody` adds mutable `scanned`). */
export type LevelPlanetSpawn = Omit<PlanetBody, 'scanned'> & { readonly scanned?: boolean }

/**
 * Static layout and goals for one playable level.
 * `planets` seeds the world; procedural rings are optional via (1).
 */
export interface LevelConfig {
  readonly id: string
  /** When true, `GameSimulator` may append procedural ring bodies. */
  readonly proceduralPlanetGenerationEnabled: boolean
  /** Initial bodies at session start (independent of procedural flag). */
  readonly planets: readonly LevelPlanetSpawn[]
  /** All tasks must be satisfied to complete the level. */
  readonly tasks: readonly LevelTask[]
}

export function spawnPlanetFromLevel(spawn: LevelPlanetSpawn): PlanetBody {
  return {
    id: spawn.id,
    massKg: spawn.massKg,
    positionX: spawn.positionX,
    positionY: spawn.positionY,
    radius: spawn.radius,
    hasFuelDeposits: spawn.hasFuelDeposits,
    hasMetalDeposits: spawn.hasMetalDeposits,
    color: spawn.color,
    scanned: spawn.scanned ?? false,
  }
}
