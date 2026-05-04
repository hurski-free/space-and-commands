import type { GameConfigLocalePreset } from '../simulation/game-config'
import { RU_COMMAND_LEXICON_ENTRIES } from './lexicon/ru-entries'

/**
 * Russian preset: sim defaults and command phrase list.
 */
export const russianGameConfigPreset: GameConfigLocalePreset = {
  language: 'ru',
  fixedDeltaTimeSec: 1 / 60,
  rngSeed: null,
  lexicon: RU_COMMAND_LEXICON_ENTRIES,
}
