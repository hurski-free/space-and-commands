import type { GameConfigLocalePreset } from '../simulation/game-config'
import { EN_COMMAND_LEXICON_ENTRIES } from './lexicon/en-entries'

/**
 * English preset: sim defaults and command phrase list.
 */
export const englishGameConfigPreset: GameConfigLocalePreset = {
  language: 'en',
  fixedDeltaTimeSec: 1 / 60,
  rngSeed: null,
  lexicon: EN_COMMAND_LEXICON_ENTRIES,
}
