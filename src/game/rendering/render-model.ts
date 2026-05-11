import type { PlanetBody, ResourceScanResult } from '../domain/planet'
import type { ShipSnapshot } from '../domain/ship'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'

/**
 * View-model for canvas layers: only what drawing code needs (no parser state).
 */

export interface GameRenderModel {
  readonly ship: ShipSnapshot
  readonly planets: readonly PlanetBody[]
  /** Planets the player has successfully scanned (nearest in range); drives HUD icons. */
  readonly resourceScans: ReadonlyMap<string, ResourceScanResult>
  /** Indexed hull for canvas draw / plume origins. */
  readonly shipMesh: ShipMeshTemplate
  /**
   * Optional hull PNG (or any `CanvasImageSource`) mapped by mesh UVs.
   * When null, the canvas renderer uses its procedural fallback atlas.
   */
  readonly hullTexture: CanvasImageSource | null
  readonly hullTextureWidthPx: number
  readonly hullTextureHeightPx: number
  /** Screen-space hints: camera offset, zoom, shake amplitude, etc. */
  readonly camera: CameraView
}

export interface CameraView {
  readonly offsetX: number
  readonly offsetY: number
  readonly scale: number
}
