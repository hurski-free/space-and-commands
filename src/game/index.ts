/**
 * Space captain typing game — architecture skeleton (domain, physics, commands, events, simulation, rendering).
 * Wire these types from Vue components or a dedicated bootstrap module when implementing gameplay.
 */

export type { CommandLanguage, CompartmentId, ModuleId } from './core/ids'
export * from './core/difficulty'
export { hashSeed, mulberry32 } from './core/rng'

export type { ShipState, ShipSnapshot } from './domain/ship'
export type { PlanetBody, ResourceScanResult } from './domain/planet'

export {
  ringInnerRadius,
  ringOuterRadius,
  ringGenerationTriggerDistance,
  createRingRng,
  generateBodiesForRing,
} from './procedural/space-rings'

export { PhysicsEngine } from './physics/physics-engine'
export { shipIntersectsAnyPlanet } from './physics/planet-collision'
export { GravityModel } from './physics/gravity'
export { LinearAccelerationModel } from './physics/newton'
export { SemiImplicitEulerIntegrator } from './physics/integrator'
export { GameSimulator } from './simulation/game-simulator'
export { createGameSession } from './simulation/create-game-session'
export type { GameSession } from './simulation/create-game-session'
export { createInitialWorld, createInitialShip } from './simulation/initial-world'
export type { GameConfig, GameConfigLocalePreset } from './simulation/game-config'
export {
  englishGameConfigPreset,
  russianGameConfigPreset,
  getLocalePreset,
  buildGameConfigFromPreset,
} from './game-configs'
export type { WorldState } from './simulation/world-state'

export type { ParsedCommand, ParseFailure, ParseResult } from './commands/command-types'
export type { LexiconEntry, ICommandLexicon } from './commands/lexicon'
export { CommandParser } from './commands/command-parser'
export { ShipCommandExecutor } from './commands/command-executor'
export { CommandInputBuffer } from './commands/input-buffer'
export { StaticCommandLexicon } from './commands/static-lexicon'

export type { IGameRenderer } from './rendering/game-renderer'
export { CanvasGameRenderer } from './rendering/game-renderer'
export { buildGameRenderModel } from './rendering/build-render-model'
