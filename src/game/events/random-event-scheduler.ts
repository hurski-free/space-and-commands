import { Difficulty } from '../core/difficulty'
import type { CompartmentId } from '../core/ids'
import { hashSeed, mulberry32 } from '../core/rng'
import { CompartmentFaultKind } from '../domain/compartment'
import type { OperationalEvent } from './operational-events'

/**
 * Decides when to roll the next hazard (cooldowns, probability curves, scripted beats).
 */

export interface RandomEventScheduleContext {
  readonly difficulty: Difficulty
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
  private rng: () => number = mulberry32(0x9e3779b9)
  private cooldown = 0

  maybeNextEvent(ctx: RandomEventScheduleContext): OperationalEvent | null {
    if (ctx.difficulty === Difficulty.Cadet) return null

    void ctx.elapsedSec
    void ctx.tickIndex
    if (this.cooldown > 0) {
      this.cooldown -= 1
      return null
    }
    const p = ctx.difficulty === Difficulty.Officer ? 0.0008 : 0.0012
    if (this.rng() > p) return null
    this.cooldown = 40 + Math.floor(this.rng() * 100)
    return this.rollEvent()
  }

  reset(seed: string | number | null): void {
    this.rng = mulberry32(hashSeed(seed))
    this.cooldown = 0
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
