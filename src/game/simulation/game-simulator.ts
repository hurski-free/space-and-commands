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
import { findFirstIntersectingPlanet, resolveShipOnPlanetSurface } from '../physics/planet-collision'
import {
  areAllEnginesOff,
  findPlanetById,
  isMainEngineActive,
  isManeuverEngineActive,
  maintainPlanetAttachment,
} from '../physics/planet-attachment'
import {
  computeLandingChanceFactor,
  isLandingAttitudeWithinTolerance,
  structuralStrengthForHull,
} from '../physics/planet-landing'
import { consumeFuelPerTick } from '../domain/fuel-economy'
import type { LevelProgressView } from '../domain/level-tasks'
import { LevelTaskTracker } from '../domain/level-tasks'
import { extractPlanetaryResourcesPerTick } from '../domain/planet-resources'
import { hashSeed, mulberry32 } from '../core/rng'
import { DEFAULT_SHIP_MESH, SHIP_MESH_TEMPLATES } from '../../ships'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'

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
  private readonly levelTasks: LevelTaskTracker
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
    levelTasks: LevelTaskTracker,
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
    this.levelTasks = levelTasks
    this.landingRng = mulberry32(hashSeed(`${config.rngSeed ?? ''}:planet-landing`))

    if (config.level.proceduralPlanetGenerationEnabled) {
      this.appendProceduralRing(0)
    }
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
    const ship = this.world.ship

    if (ship.planetAttachment && (isMainEngineActive(ship) || isManeuverEngineActive(ship))) {
      ship.planetAttachment = null
    }

    const attachedPlanet = ship.planetAttachment
      ? findPlanetById(this.world.planets, ship.planetAttachment.planetId)
      : null
    if (attachedPlanet && areAllEnginesOff(ship)) {
      maintainPlanetAttachment(ship, attachedPlanet, hull)
      extractPlanetaryResourcesPerTick(ship, hull, this.world.resourceScans, attachedPlanet.id)
    } else {
      if (ship.planetAttachment && !attachedPlanet) {
        ship.planetAttachment = null
      }
      consumeFuelPerTick(ship)
      this.physics.step(ship, this.world.planets, deltaTimeSec, hull)
      if (!this.resolvePlanetContact(hull)) return
    }

    const evt = this.randomEvents.maybeNextEvent({
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
      typo: this.config.difficultyProfile.typo,
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

  getLevelProgress(): LevelProgressView {
    return this.levelTasks.getProgress()
  }

  isLevelComplete(): boolean {
    return this.levelTasks.isLevelComplete()
  }

  /**
   * Ring n occupies [50k·n+5k, 50k·(n+1)] (world units).
   * n=0 is generated immediately; n≥1 when |ship| >= 50k·n+40k.
   */
  private extendProceduralRingsIfNeeded(): void {
    if (!this.config.level.proceduralPlanetGenerationEnabled) return

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

  /** Returns false if the run ended (crash / failed landing). */
  private resolvePlanetContact(hull: ShipMeshTemplate): boolean {
    const ship = this.world.ship
    const contacted = findFirstIntersectingPlanet(ship, this.world.planets, hull)
    if (!contacted) return true

    if (
      !isLandingAttitudeWithinTolerance(
        ship.body.headingRad,
        contacted,
        ship.body.position,
        hull,
      )
    ) {
      this.world.gameOver = true
      return false
    }

    const strength = structuralStrengthForHull(hull.structuralStrength)
    const { velocity, massKg } = ship.body
    const speed = Math.hypot(velocity.x, velocity.y)
    const factor = computeLandingChanceFactor(strength, speed, massKg)
    const survived = factor >= 1 || this.landingRng() < factor

    if (!survived) {
      this.world.gameOver = true
      return false
    }

    resolveShipOnPlanetSurface(ship, contacted, hull)
    if (areAllEnginesOff(ship)) {
      this.attachToPlanet(contacted.id)
    }
    return true
  }

  private attachToPlanet(planetId: string): void {
    const ship = this.world.ship
    const alreadyAttached = ship.planetAttachment?.planetId === planetId
    ship.planetAttachment = { planetId }
    if (!alreadyAttached) {
      this.levelTasks.recordVisit(planetId)
    }
  }
}
