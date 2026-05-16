import type { Difficulty } from '../core/difficulty'
import { getDifficultyProfile } from '../core/difficulty-config'
import type { CommandLanguage } from '../core/ids'
import { DEFAULT_LEVEL_ID, getLevelConfig } from '../levels'
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
  levelId: string = DEFAULT_LEVEL_ID,
): GameConfig {
  return {
    ...preset,
    difficulty,
    difficultyProfile: getDifficultyProfile(difficulty),
    level: getLevelConfig(levelId),
  }
}
