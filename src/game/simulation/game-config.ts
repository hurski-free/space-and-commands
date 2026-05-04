import type { Difficulty } from '../core/difficulty'
import type { CommandLanguage } from '../core/ids'
import type { LexiconEntry } from '../commands/lexicon'

/**
 * Session-wide knobs: language, difficulty, physics timestep policy, RNG seed.
 */

export interface GameConfig {
  readonly language: CommandLanguage
  readonly difficulty: Difficulty
  /** Fixed timestep for deterministic simulation (optional variable step). */
  readonly fixedDeltaTimeSec: number
  readonly rngSeed: string | null
  /** Phrase templates for `CommandParser` (per-locale list from game-configs). */
  readonly lexicon: readonly LexiconEntry[]
}

/**
 * Locale-specific defaults merged with player-chosen difficulty at session start.
 */
export type GameConfigLocalePreset = Omit<GameConfig, 'difficulty'>
