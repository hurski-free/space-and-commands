import type { MutableVector2 } from '../core/vectors'

/**
 * Time integration for position / velocity / heading (semi-implicit Euler or similar).
 */

export interface MotionStateSlice {
  readonly position: MutableVector2
  readonly velocity: MutableVector2
  readonly headingRad: number
  readonly angularVelocityRadPerSec: number
}

export interface IStateIntegrator {
  /** x += v * dt after velocity was updated from acceleration. */
  integrateLinear(state: MotionStateSlice, deltaTimeSec: number): void

  integrateAngular(headingRad: number, angularVel: number, deltaTimeSec: number): number
}

export class SemiImplicitEulerIntegrator implements IStateIntegrator {
  integrateLinear(state: MotionStateSlice, deltaTimeSec: number): void {
    state.position.x += state.velocity.x * deltaTimeSec
    state.position.y += state.velocity.y * deltaTimeSec
  }

  integrateAngular(headingRad: number, angularVel: number, deltaTimeSec: number): number {
    return headingRad + angularVel * deltaTimeSec
  }
}
