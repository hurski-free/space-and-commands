import type { PlanetBody } from '../domain/planet'
import type { ShipState } from '../domain/ship'
import type { Force2 } from './force'
import type { IGravityModel } from './gravity'
import type { ILinearAccelerationModel } from './newton'
import type { IStateIntegrator } from './integrator'
import type { MutableVector2 } from '../core/vectors'
import { MAIN_ENGINE_MAX_THRUST_N, RCS_MAX_ANGULAR_ACCEL } from './constants'

/**
 * Orchestrates force summation and integration each tick.
 * Depends on abstractions (DIP): gravity model, thrust model contributions, integrator.
 */

export interface PhysicsEngineDeps {
  readonly gravity: IGravityModel
  readonly linearAcceleration: ILinearAccelerationModel
  readonly integrator: IStateIntegrator
}

export class PhysicsEngine {
  private readonly deps: PhysicsEngineDeps
  private readonly scratchAccel: MutableVector2 = { x: 0, y: 0 }

  constructor(deps: PhysicsEngineDeps) {
    this.deps = deps
  }

  /** Advance ship body for one timestep (thrust, gravity, rotation). */
  step(ship: ShipState, planets: readonly PlanetBody[], deltaTimeSec: number): void {
    const body = ship.body
    const thrust = this.sumThrustForces(ship, deltaTimeSec)
    const grav = this.deps.gravity.netForceOnShip(body.position, body.massKg, planets)
    const net: Force2 = { fx: thrust.fx + grav.fx, fy: thrust.fy + grav.fy }
    this.deps.linearAcceleration.applySecondLaw(net, body.massKg, this.scratchAccel)
    body.velocity.x += this.scratchAccel.x * deltaTimeSec
    body.velocity.y += this.scratchAccel.y * deltaTimeSec

    this.deps.integrator.integrateLinear(body, deltaTimeSec)

    const rot = ship.rotation
    const maneuverOk = !ship.maneuverFuelLine.broken && !rot.rcsDamaged
    let torque = maneuverOk ? rot.torquePercent / 100 : 0
    if (rot.commandedHold && Math.abs(rot.torquePercent) < 1e-6) {
      body.angularVelocityRadPerSec *= Math.exp(-3 * deltaTimeSec)
    }
    const angAccel = torque * RCS_MAX_ANGULAR_ACCEL
    body.angularVelocityRadPerSec += angAccel * deltaTimeSec
    body.angularVelocityRadPerSec *= Math.exp(-0.35 * deltaTimeSec)
    body.headingRad = this.deps.integrator.integrateAngular(
      body.headingRad,
      body.angularVelocityRadPerSec,
      deltaTimeSec,
    )
  }

  /** Thrust along ship forward axis (−X is nose in local frame; we use +cos/sin from heading). */
  protected sumThrustForces(ship: ShipState, _deltaTimeSec: number): Force2 {
    void _deltaTimeSec
    const me = ship.mainEngine
    const fuelOk = !ship.mainFuelLine.broken && !me.damaged
    let throttle = 0
    if (fuelOk && !me.commandedStop) {
      throttle = Math.max(0, Math.min(100, me.throttlePercent)) / 100
    }
    const f = throttle * MAIN_ENGINE_MAX_THRUST_N
    const h = ship.body.headingRad
    const fx = Math.cos(h) * f
    const fy = Math.sin(h) * f
    return { fx, fy }
  }
}
