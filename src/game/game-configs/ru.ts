import type { GameConfigLocalePreset } from '../simulation/game-config'
import { DEFAULT_SHIP_MESH } from '../../ships'
import { RU_COMMAND_LEXICON_ENTRIES } from './lexicon/ru-entries'

/**
 * Russian preset: sim defaults and command phrase list.
 */
export const russianGameConfigPreset: GameConfigLocalePreset = {
  language: 'ru',
  shipMeshId: DEFAULT_SHIP_MESH.id,
  fixedDeltaTimeSec: 1 / 60,
  rngSeed: null,
  lexicon: RU_COMMAND_LEXICON_ENTRIES,
}
