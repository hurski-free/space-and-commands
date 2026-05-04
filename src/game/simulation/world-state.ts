import type { PlanetBody, ResourceScanResult } from '../domain/planet'
import type { ShipState } from '../domain/ship'

/**
 * Everything the simulator owns besides pure services: ship, celestial bodies, fog-of-war.
 */

export interface WorldState {
  ship: ShipState
  /** Grows as procedural rings unlock; mutates in place. */
  planets: PlanetBody[]
  /** Latest scan results keyed by planet id (empty until player scans). */
  resourceScans: Map<string, ResourceScanResult>
  /** Set when the ship is destroyed (e.g. planetary impact). */
  gameOver: boolean
}
