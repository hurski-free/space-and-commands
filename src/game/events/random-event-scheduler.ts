import type { CompartmentId } from '../core/ids'
import type { DifficultyEventConfig } from '../core/difficulty-config'
import { hashSeed, mulberry32 } from '../core/rng'
import { CompartmentFaultKind } from '../domain/compartment'
import type { OperationalEvent } from './operational-events'

/**
 * Decides when to roll the next hazard from `DifficultyEventConfig`.
 */

export interface RandomEventScheduleContext {
  readonly elapsedSec: number
  /** Monotonic tick counter since session start. */
  readonly tickIndex: number
}

export interface IRandomEventScheduler {
  /** Returns null if no event this tick. */
  maybeNextEvent(ctx: RandomEventScheduleContext): OperationalEvent | null

  /** Reset internal RNG / cooldown state for a new run. */
  reset(seed: string | number | null): void
}

export class RandomEventScheduler implements IRandomEventScheduler {
  private readonly events: DifficultyEventConfig
  private rng: () => number = mulberry32(0x9e3779b9)
  /** Elapsed time when the last hazard fired; `-Infinity` allows an immediate first roll. */
  private lastEventElapsedSec = Number.NEGATIVE_INFINITY

  constructor(events: DifficultyEventConfig) {
    this.events = events
  }

  maybeNextEvent(ctx: RandomEventScheduleContext): OperationalEvent | null {
    const { probabilityPerTick, minSecondsBetweenEvents } = this.events
    if (probabilityPerTick <= 0) return null

    void ctx.tickIndex
    if (ctx.elapsedSec - this.lastEventElapsedSec < minSecondsBetweenEvents) {
      return null
    }
    if (this.rng() > probabilityPerTick) return null

    this.lastEventElapsedSec = ctx.elapsedSec
    return this.rollEvent()
  }

  reset(seed: string | number | null): void {
    this.rng = mulberry32(hashSeed(seed))
    this.lastEventElapsedSec = Number.NEGATIVE_INFINITY
  }

  private rollEvent(): OperationalEvent {
    const r = this.rng()
    if (r < 0.45) {
      const id = (1 + Math.floor(this.rng() * 5)) as CompartmentId
      const kinds = [
        CompartmentFaultKind.HullBreach,
        CompartmentFaultKind.BulkheadStuck,
        CompartmentFaultKind.Generic,
      ]
      const faultKind = kinds[Math.floor(this.rng() * kinds.length)]
      return { kind: 'compartment_fault', compartmentId: id, faultKind }
    }
    if (r < 0.65) {
      return { kind: 'main_engine_fuel_line_break' }
    }
    if (r < 0.78) {
      return { kind: 'comms_breakdown' }
    }
    return { kind: 'maneuver_fuel_line_break' }
  }
}
