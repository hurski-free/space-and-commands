/**
 * Celestial bodies exert gravity.
 */

export interface PlanetBody {
  readonly id: string
  readonly massKg: number
  readonly positionX: number
  readonly positionY: number
  /** Display radius in world units (not necessarily physical). */
  readonly radius: number
  readonly hasFuelDeposits: boolean
  readonly hasMetalDeposits: boolean
  readonly color: string

  scanned: boolean
}

export interface ResourceScanResult {
  readonly planetId: string
  readonly hasFuelDeposits: boolean
  readonly hasMetalDeposits: boolean
}
