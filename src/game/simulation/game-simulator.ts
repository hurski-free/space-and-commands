import type { ICommandParser } from '../commands/command-parser'
import type { ICommandExecutor } from '../commands/command-executor'
import type { ICommandLexicon } from '../commands/lexicon'
import type { ITypoPolicy } from '../commands/typo-policy'
import type { ParseContext, ParseResult } from '../commands/command-types'
import type { PhysicsEngine } from '../physics/physics-engine'
import type { IOperationalEventApplier } from '../events/event-applier'
import type { IRandomEventScheduler } from '../events/random-event-scheduler'
import type { GameConfig } from './game-config'
import type { WorldState } from './world-state'
import {
  ringGenerationTriggerDistance,
  generateBodiesForRing,
  createRingRng,
} from '../procedural/space-rings'
import {
  findFirstIntersectingPlanet,
  resolveShipOnPlanetSurface,
} from '../physics/planet-collision'
import {
  computeLandingChanceFactor,
  isLandingAttitudeWithinTolerance,
  structuralStrengthForHull,
} from '../physics/planet-landing'
import { hashSeed, mulberry32 } from '../core/rng'
import { DEFAULT_SHIP_MESH, SHIP_MESH_TEMPLATES } from '../../ships'

/**
 * Facade for one game session: wires parser → executor → physics → hazards each tick.
 * Keep this thin; move rules into dedicated services (SRP).
 */

export class GameSimulator {
  private tickIndex = 0
  private elapsedSec = 0
  /**
   * Next ring index n awaiting distance trigger `10000*n + 8000`.
   * Ring 0 is always generated at session start (see constructor).
   */
  private nextSpaceRingIndex = 1

  private readonly config: GameConfig
  private readonly world: WorldState
  private readonly parser: ICommandParser
  private readonly lexicon: ICommandLexicon
  private readonly typoPolicy: ITypoPolicy
  private readonly commandExecutor: ICommandExecutor
  private readonly physics: PhysicsEngine
  private readonly randomEvents: IRandomEventScheduler
  private readonly eventApplier: IOperationalEventApplier
  private readonly landingRng: () => number

  constructor(
    config: GameConfig,
    world: WorldState,
    parser: ICommandParser,
    lexicon: ICommandLexicon,
    typoPolicy: ITypoPolicy,
    commandExecutor: ICommandExecutor,
    physics: PhysicsEngine,
    randomEvents: IRandomEventScheduler,
    eventApplier: IOperationalEventApplier,
  ) {
    this.config = config
    this.world = world
    this.parser = parser
    this.lexicon = lexicon
    this.typoPolicy = typoPolicy
    this.commandExecutor = commandExecutor
    this.physics = physics
    this.randomEvents = randomEvents
    this.eventApplier = eventApplier
    this.landingRng = mulberry32(hashSeed(`${config.rngSeed ?? ''}:planet-landing`))

    this.appendProceduralRing(0)
  }

  getWorld(): WorldState {
    return this.world
  }

  /** Advance simulation by dt (accumulator for fixed step can live here later). */
  tick(deltaTimeSec: number): void {
    if (this.world.gameOver) return

    this.elapsedSec += deltaTimeSec
    this.extendProceduralRingsIfNeeded()
    const hull = SHIP_MESH_TEMPLATES[this.config.shipMeshId] ?? DEFAULT_SHIP_MESH
    this.physics.step(this.world.ship, this.world.planets, deltaTimeSec, hull)

    const contacted = findFirstIntersectingPlanet(this.world.ship, this.world.planets, hull)
    if (contacted) {
      if (
        !isLandingAttitudeWithinTolerance(
          this.world.ship.body.headingRad,
          contacted,
          this.world.ship.body.position,
          hull,
        )
      ) {
        this.world.gameOver = true
        return
      }
      const strength = structuralStrengthForHull(hull.structuralStrength)
      const { velocity, massKg } = this.world.ship.body
      const speed = Math.hypot(velocity.x, velocity.y)
      const factor = computeLandingChanceFactor(strength, speed, massKg)
      const survived = factor >= 1 || this.landingRng() < factor

      if (!survived) {
        this.world.gameOver = true
        return
      }
      resolveShipOnPlanetSurface(this.world.ship, contacted, hull)
    }

    const evt = this.randomEvents.maybeNextEvent({
      difficulty: this.config.difficulty,
      elapsedSec: this.elapsedSec,
      tickIndex: this.tickIndex,
    })
    if (evt) {
      this.eventApplier.apply(this.world.ship, evt)
    }
    this.tickIndex += 1
  }

  /** Player pressed Enter on the command line. */
  submitCommandLine(rawText: string): ParseResult {
    const ctx: ParseContext = {
      language: this.config.language,
      rawText,
      difficulty: this.config.difficulty,
    }
    const result = this.parser.parse(ctx, this.lexicon, this.typoPolicy)
    if (result.ok) {
      this.commandExecutor.apply(this.world, result.command)
    }
    return result
  }

  getElapsedSec(): number {
    return this.elapsedSec
  }

  getTickIndex(): number {
    return this.tickIndex
  }

  /**
   * Ring n occupies [50k·n+5k, 50k·(n+1)] (world units).
   * n=0 is generated immediately; n≥1 when |ship| >= 50k·n+40k.
   */
  private extendProceduralRingsIfNeeded(): void {
    const { x, y } = this.world.ship.body.position
    const r = Math.hypot(x, y)
    while (r >= ringGenerationTriggerDistance(this.nextSpaceRingIndex)) {
      this.appendProceduralRing(this.nextSpaceRingIndex)
      this.nextSpaceRingIndex += 1
    }
  }

  private appendProceduralRing(ringIndex: number): void {
    const rng = createRingRng(this.config.rngSeed, ringIndex)
    this.world.planets.push(...generateBodiesForRing(ringIndex, rng))
  }
}
