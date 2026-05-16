import type { Difficulty } from '../core/difficulty'
import type { DifficultyProfile } from '../core/difficulty-config'
import type { CommandLanguage } from '../core/ids'
import type { LexiconEntry } from '../commands/lexicon'
import type { LevelConfig } from './level-config'

/**
 * Session-wide knobs: language, difficulty, physics timestep policy, RNG seed.
 */

export interface GameConfig {
  readonly language: CommandLanguage
  readonly difficulty: Difficulty
  /** Typo and hazard knobs resolved from `difficulty` at session start. */
  readonly difficultyProfile: DifficultyProfile
  /** Hull mesh id from `SHIP_MESH_TEMPLATES` (canvas). */
  readonly shipMeshId: string
  /** Level layout, procedural generation flag, and objectives. */
  readonly level: LevelConfig
  /** Fixed timestep for deterministic simulation (optional variable step). */
  readonly fixedDeltaTimeSec: number
  readonly rngSeed: string | null
  /** Phrase templates for `CommandParser` (per-locale list from game-configs). */
  readonly lexicon: readonly LexiconEntry[]
}

/**
 * Locale-specific defaults merged with player-chosen difficulty at session start.
 */
export type GameConfigLocalePreset = Omit<GameConfig, 'difficulty' | 'difficultyProfile' | 'level'>
