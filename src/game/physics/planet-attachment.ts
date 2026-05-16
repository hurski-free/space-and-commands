import { hasUsableFuel } from '../domain/fuel-economy'
import type { PlanetBody } from '../domain/planet'
import type { ShipState } from '../domain/ship'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import { resolveShipOnPlanetSurface } from './planet-collision'

/** Matches thrust logic in `PhysicsEngine.sumThrustForces`. */
export function isMainEngineActive(ship: ShipState): boolean {
  const me = ship.mainEngine
  const fuelOk = hasUsableFuel(ship) && !ship.mainFuelLine.broken && !me.damaged
  return fuelOk && !me.commandedStop && me.throttlePercent > 0
}

/** Matches torque logic in `PhysicsEngine.step`. */
export function isManeuverEngineActive(ship: ShipState): boolean {
  const rot = ship.rotation
  const maneuverOk = hasUsableFuel(ship) && !ship.maneuverFuelLine.broken && !rot.rcsDamaged
  return maneuverOk && Math.abs(rot.torquePercent) > 0
}

export function areAllEnginesOff(ship: ShipState): boolean {
  return !isMainEngineActive(ship) && !isManeuverEngineActive(ship)
}

export function findPlanetById(
  planets: readonly PlanetBody[],
  planetId: string,
): PlanetBody | null {
  for (const p of planets) {
    if (p.id === planetId) return p
  }
  return null
}

/** Snap hull to the surface and kill motion (called each tick while attached). */
export function maintainPlanetAttachment(
  ship: ShipState,
  planet: PlanetBody,
  mesh: ShipMeshTemplate,
): void {
  resolveShipOnPlanetSurface(ship, planet, mesh)
  ship.body.velocity.x = 0
  ship.body.velocity.y = 0
  ship.body.angularVelocityRadPerSec = 0
}
