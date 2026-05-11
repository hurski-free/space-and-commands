import type { Difficulty } from '../core/difficulty'
import type { CommandLanguage } from '../core/ids'
import type { GameConfig, GameConfigLocalePreset } from '../simulation/game-config'
import { englishGameConfigPreset } from './en'
import { russianGameConfigPreset } from './ru'

/** Resolve the static locale preset used before difficulty is applied. */
export function getLocalePreset(language: CommandLanguage): GameConfigLocalePreset {
  if (language === 'ru') {
    return russianGameConfigPreset
  }
  return englishGameConfigPreset
}

/** Produce a full session config for `GameSimulator` and UI. */
export function buildGameConfigFromPreset(
  preset: GameConfigLocalePreset,
  difficulty: Difficulty,
): GameConfig {
  return {
    ...preset,
    difficulty,
  }
}
