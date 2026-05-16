import type { GameConfig } from './game-config'
import type { WorldState } from './world-state'
import { GameSimulator } from './game-simulator'
import { createInitialWorld } from './initial-world'
import { CommandParser } from '../commands/command-parser'
import { ShipCommandExecutor } from '../commands/command-executor'
import { StaticCommandLexicon } from '../commands/static-lexicon'
import { DifficultyTypoPolicy } from '../commands/typo-policy'
import { PhysicsEngine } from '../physics/physics-engine'
import { GravityModel } from '../physics/gravity'
import { LinearAccelerationModel } from '../physics/newton'
import { SemiImplicitEulerIntegrator } from '../physics/integrator'
import { RandomEventScheduler } from '../events/random-event-scheduler'
import { OperationalEventApplier } from '../events/event-applier'

export interface GameSession {
  readonly world: WorldState
  readonly simulator: GameSimulator
}

/**
 * Wires default services for a playable session (same world instance the simulator mutates).
 */
export function createGameSession(config: GameConfig): GameSession {
  const world = createInitialWorld(config.shipMeshId)
  const physics = new PhysicsEngine({
    gravity: new GravityModel(),
    linearAcceleration: new LinearAccelerationModel(),
    integrator: new SemiImplicitEulerIntegrator(),
  })
  const parser = new CommandParser()
  const lexicon = new StaticCommandLexicon(config.language, config.lexicon)
  const typoPolicy = new DifficultyTypoPolicy()
  const commandExecutor = new ShipCommandExecutor()
  const randomEvents = new RandomEventScheduler(config.difficultyProfile.events)
  randomEvents.reset(config.rngSeed)
  const eventApplier = new OperationalEventApplier()

  const simulator = new GameSimulator(
    config,
    world,
    parser,
    lexicon,
    typoPolicy,
    commandExecutor,
    physics,
    randomEvents,
    eventApplier,
  )

  return { world, simulator }
}
