import type { PlanetBody } from '../domain/planet'
import type { Force2 } from './force'
import type { Vector2 } from '../core/vectors'
import { GRAVITY_EPSILON_SQ, GRAVITY_G } from './constants'

/**
 * Gravitational attraction from planets onto the ship (and optionally modules).
 */

export interface IGravityModel {
  /** Net gravitational force on the ship at shipPosition. */
  netForceOnShip(
    shipPosition: Vector2,
    shipMassKg: number,
    planets: readonly PlanetBody[],
  ): Force2
}

export class GravityModel implements IGravityModel {
  netForceOnShip(shipPosition: Vector2, shipMassKg: number, planets: readonly PlanetBody[]): Force2 {
    let fx = 0
    let fy = 0
    for (const p of planets) {
      const dx = p.positionX - shipPosition.x
      const dy = p.positionY - shipPosition.y
      const distSq = dx * dx + dy * dy + GRAVITY_EPSILON_SQ
      const dist = Math.sqrt(distSq)
      const invR = 1 / dist
      const fMag = (GRAVITY_G * p.massKg * shipMassKg) / distSq
      fx += fMag * dx * invR
      fy += fMag * dy * invR
    }
    return { fx, fy }
  }
}
