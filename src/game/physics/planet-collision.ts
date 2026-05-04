import type { PlanetBody } from '../domain/planet'
import type { ShipState } from '../domain/ship'
import { SHIP_COLLISION_RADIUS } from './constants'

/** True if the ship's collision disc overlaps any planet disc. */
export function shipIntersectsAnyPlanet(
  ship: ShipState,
  planets: readonly PlanetBody[],
  shipRadius: number = SHIP_COLLISION_RADIUS,
): boolean {
  const { x, y } = ship.body.position
  for (const p of planets) {
    const dx = x - p.positionX
    const dy = y - p.positionY
    const threshold = p.radius + shipRadius
    if (dx * dx + dy * dy <= threshold * threshold) return true
  }
  return false
}
