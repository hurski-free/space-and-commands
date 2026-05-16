import type { PlanetBody } from '../domain/planet'
import type { ShipState } from '../domain/ship'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import {
  shipHullIntersectsPlanetDisc,
  shipHullWorldVerticesAt,
  shipIntersectsPlanet,
} from './ship-hull-collision'

/** True if the ship hull overlaps any planet disc (mesh-accurate silhouette vs circle). */
export function shipIntersectsAnyPlanet(
  ship: ShipState,
  planets: readonly PlanetBody[],
  mesh: ShipMeshTemplate,
): boolean {
  return findFirstIntersectingPlanet(ship, planets, mesh) !== null
}

export function findFirstIntersectingPlanet(
  ship: ShipState,
  planets: readonly PlanetBody[],
  mesh: ShipMeshTemplate,
): PlanetBody | null {
  for (const p of planets) {
    if (shipIntersectsPlanet(ship, mesh, p.positionX, p.positionY, p.radius)) return p
  }
  return null
}

/**
 * Separate the hull from the planet along the center→planet radial until the mesh clears
 * `planet.radius + clearance`, then zero velocity.
 */
export function resolveShipOnPlanetSurface(
  ship: ShipState,
  planet: PlanetBody,
  mesh: ShipMeshTemplate,
): void {
  const clearance = 0.5
  const discR = planet.radius + clearance
  const { position } = ship.body
  const pcx = planet.positionX
  const pcy = planet.positionY
  const dx = position.x - pcx
  const dy = position.y - pcy
  const dist = Math.hypot(dx, dy)
  const nx = dist > 1e-9 ? dx / dist : 1
  const ny = dist > 1e-9 ? dy / dist : 0
  const h = ship.body.headingRad

  const intersectsAt = (cx: number, cy: number) =>
    shipHullIntersectsPlanetDisc(pcx, pcy, discR, shipHullWorldVerticesAt(mesh, h, cx, cy))

  if (!intersectsAt(position.x, position.y)) {
    ship.body.velocity.x = 0
    ship.body.velocity.y = 0
    ship.body.angularVelocityRadPerSec = 0
    return
  }

  let hi = 1
  while (hi < 1e7 && intersectsAt(position.x + nx * hi, position.y + ny * hi)) {
    hi *= 2
  }
  let lo = 0
  let high = hi
  for (let i = 0; i < 40; i++) {
    const mid = (lo + high) / 2
    if (intersectsAt(position.x + nx * mid, position.y + ny * mid)) lo = mid
    else high = mid
  }
  position.x += nx * high
  position.y += ny * high

  ship.body.velocity.x = 0
  ship.body.velocity.y = 0
  ship.body.angularVelocityRadPerSec = 0
}
