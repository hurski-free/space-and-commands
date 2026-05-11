import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import type { WorldState } from '../simulation/world-state'
import type { CameraView, GameRenderModel } from './render-model'

/**
 * Camera follows the ship; zoom fits nearby planets and keeps motion readable.
 */
export function buildGameRenderModel(
  world: WorldState,
  shipMesh: ShipMeshTemplate,
  hullTexture: CanvasImageSource | null = null,
  hullTextureWidthPx = 512,
  hullTextureHeightPx = 512,
): GameRenderModel {
  const { x: sx, y: sy } = world.ship.body.position

  const cam: CameraView = {
    offsetX: sx,
    offsetY: sy,
    scale: 1,
  }
  return {
    ship: world.ship,
    planets: world.planets,
    shipMesh,
    hullTexture,
    hullTextureWidthPx,
    hullTextureHeightPx,
    camera: cam,
  }
}
