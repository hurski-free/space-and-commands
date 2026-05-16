import { hasUsableFuel } from '../domain/fuel-economy'
import type { PlanetBody } from '../domain/planet'
import type { ShipState } from '../domain/ship'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import type { Force2 } from './force'
import type { IGravityModel } from './gravity'
import type { ILinearAccelerationModel } from './newton'
import type { IStateIntegrator } from './integrator'
import type { MutableVector2 } from '../core/vectors'
import { MAIN_ENGINE_MAX_THRUST_N, RCS_MAX_ANGULAR_ACCEL } from './physics.const'

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
  step(
    ship: ShipState,
    planets: readonly PlanetBody[],
    deltaTimeSec: number,
    mainEngineHull: ShipMeshTemplate,
  ): void {
    const body = ship.body
    const thrust = this.sumThrustForces(ship, mainEngineHull, deltaTimeSec)
    const grav = this.deps.gravity.netForceOnShip(body.position, body.massKg, planets)
    const net: Force2 = { fx: thrust.fx + grav.fx, fy: thrust.fy + grav.fy }
    this.deps.linearAcceleration.applySecondLaw(net, body.massKg, this.scratchAccel)
    body.velocity.x += this.scratchAccel.x * deltaTimeSec
    body.velocity.y += this.scratchAccel.y * deltaTimeSec

    this.deps.integrator.integrateLinear(body, deltaTimeSec)

    const rot = ship.rotation
    const maneuverOk =
      hasUsableFuel(ship) && !ship.maneuverFuelLine.broken && !rot.rcsDamaged
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

  /**
   * Thrust along ship forward (+X local / nose). Split equally across `nozzlePositions.length`
   * so total magnitude stays `MAIN_ENGINE_MAX_THRUST_N` at full throttle.
   */
  protected sumThrustForces(
    ship: ShipState,
    hull: ShipMeshTemplate,
    _deltaTimeSec: number,
  ): Force2 {
    void _deltaTimeSec
    const me = ship.mainEngine
    const fuelOk = hasUsableFuel(ship) && !ship.mainFuelLine.broken && !me.damaged
    let throttle = 0
    if (fuelOk && !me.commandedStop) {
      throttle = Math.max(0, Math.min(100, me.throttlePercent)) / 100
    }
    const n = hull.nozzlePositions.length
    const nozzleCount = n > 0 ? n : 1
    const fEach = (throttle * MAIN_ENGINE_MAX_THRUST_N) / nozzleCount
    const h = ship.body.headingRad
    const cosH = Math.cos(h)
    const sinH = Math.sin(h)
    let fx = 0
    let fy = 0
    for (let i = 0; i < nozzleCount; i++) {
      fx += cosH * fEach
      fy += sinH * fEach
    }
    return { fx, fy }
  }
}
