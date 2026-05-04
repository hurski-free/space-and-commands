/**
 * Celestial bodies exert gravity; modules interact when nearby.
 */

export interface PlanetBody {
  readonly id: string
  readonly massKg: number
  readonly positionX: number
  readonly positionY: number
  /** Display radius in world units (not necessarily physical). */
  readonly radius: number
}

export interface ResourceScanResult {
  readonly planetId: string
  readonly hasFuelDeposits: boolean
  readonly hasMetalDeposits: boolean
}
