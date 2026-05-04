import type { WorldState } from '../simulation/world-state'
import type { CameraView, GameRenderModel } from './render-model'

const MIN_SCALE = 0.016
const MAX_SCALE = 0.055

/**
 * Camera follows the ship; zoom fits nearby planets and keeps motion readable.
 */
export function buildGameRenderModel(
  world: WorldState,
  cssWidth: number,
  cssHeight: number,
): GameRenderModel {
  const pad = 56
  const usable = Math.min(cssWidth, cssHeight) - pad * 2
  const { x: sx, y: sy } = world.ship.body.position
  let furthest = 17_500
  const shipR = Math.hypot(sx, sy)
  furthest = Math.max(furthest, shipR + 10_000)
  for (const p of world.planets) {
    const d = Math.hypot(p.positionX - sx, p.positionY - sy)
    furthest = Math.max(furthest, d + p.radius + 4_000)
  }
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, usable / (2 * furthest)))
  const cam: CameraView = {
    offsetX: sx,
    offsetY: sy,
    scale,
  }
  return {
    ship: world.ship,
    planets: world.planets,
    camera: cam,
  }
}
