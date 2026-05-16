/**
 * App-facing exports for Vue components.
 */

export type { CommandLanguage } from './core/ids'
export * from './core/difficulty'
export type {
  DifficultyEventConfig,
  DifficultyProfile,
  DifficultyTypoConfig,
  TypoToleranceRule,
} from './core/difficulty-config'
export { getDifficultyProfile, maxTyposForTokenLength } from './core/difficulty-config'

export type { GameConfig } from './simulation/game-config'
export {
  getLocalePreset,
  buildGameConfigFromPreset,
} from './game-configs'

export { buildGameRenderModel } from './rendering/build-render-model'
export { CanvasGameRenderer } from './rendering/game-renderer'
export { createGameSession } from './simulation/create-game-session'
export type { GameSimulator } from './simulation/game-simulator'
export type { ParseFailure, ParseResult } from './commands/command-types'
