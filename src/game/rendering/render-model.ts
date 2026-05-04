import type { PlanetBody } from '../domain/planet'
import type { ShipSnapshot } from '../domain/ship'

/**
 * View-model for canvas layers: only what drawing code needs (no parser state).
 */

export interface GameRenderModel {
  readonly ship: ShipSnapshot
  readonly planets: readonly PlanetBody[]
  /** Screen-space hints: camera offset, zoom, shake amplitude, etc. */
  readonly camera: CameraView
}

export interface CameraView {
  readonly offsetX: number
  readonly offsetY: number
  readonly scale: number
}
