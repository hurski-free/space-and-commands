import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import { meshLocalToWorldMeters } from '../../ships/ship-mesh-types'
import type { ShipState } from '../domain/ship'

/** Same rigid transform as rendering / nozzle positions: local meters → world. */
function localMetersToWorld(
  lx: number,
  ly: number,
  shipX: number,
  shipY: number,
  headingRad: number,
): { x: number; y: number } {
  const c = Math.cos(headingRad)
  const s = Math.sin(headingRad)
  return {
    x: shipX + c * lx - s * ly,
    y: shipY + s * lx + c * ly,
  }
}

/** Closed polygon (hullLoop) in world meters for a given body origin and heading. */
export function shipHullWorldVerticesAt(
  mesh: ShipMeshTemplate,
  headingRad: number,
  centerX: number,
  centerY: number,
): { x: number; y: number }[] {
  return mesh.hullLoop.map((vi) => {
    const v = mesh.vertices[vi]!
    const { x: lx, y: ly } = meshLocalToWorldMeters(mesh, v.x, v.y)
    return localMetersToWorld(lx, ly, centerX, centerY, headingRad)
  })
}

/** Closed polygon vertices in world meters; ship `position` is rigid-body origin. */
export function shipHullWorldVertices(ship: ShipState, mesh: ShipMeshTemplate): { x: number; y: number }[] {
  const { x: sx, y: sy } = ship.body.position
  return shipHullWorldVerticesAt(mesh, ship.body.headingRad, sx, sy)
}

function pointInPolygon(px: number, py: number, verts: readonly { x: number; y: number }[]): boolean {
  let inside = false
  const n = verts.length
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = verts[i]!.x
    const yi = verts[i]!.y
    const xj = verts[j]!.x
    const yj = verts[j]!.y
    const denom = yj - yi
    if (Math.abs(denom) < 1e-15) continue
    if (yi > py !== yj > py) {
      const xInt = ((xj - xi) * (py - yi)) / denom + xi
      if (px < xInt) inside = !inside
    }
  }
  return inside
}

function pointToSegmentDistSq(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const abLenSq = abx * abx + aby * aby
  if (abLenSq < 1e-18) return apx * apx + apy * apy
  let t = (apx * abx + apy * aby) / abLenSq
  t = Math.max(0, Math.min(1, t))
  const qx = ax + t * abx
  const qy = ay + t * aby
  const dx = px - qx
  const dy = py - qy
  return dx * dx + dy * dy
}

/** True if the filled ship hull overlaps the planet disc (center + radius). */
export function shipHullIntersectsPlanetDisc(
  planetCenterX: number,
  planetCenterY: number,
  planetRadius: number,
  hullVerts: readonly { x: number; y: number }[],
): boolean {
  if (pointInPolygon(planetCenterX, planetCenterY, hullVerts)) return true
  const rSq = planetRadius * planetRadius
  for (const v of hullVerts) {
    const dx = v.x - planetCenterX
    const dy = v.y - planetCenterY
    if (dx * dx + dy * dy <= rSq) return true
  }
  const n = hullVerts.length
  for (let i = 0; i < n; i++) {
    const a = hullVerts[i]!
    const b = hullVerts[(i + 1) % n]!
    if (pointToSegmentDistSq(planetCenterX, planetCenterY, a.x, a.y, b.x, b.y) <= rSq) return true
  }
  return false
}

export function shipIntersectsPlanet(
  ship: ShipState,
  mesh: ShipMeshTemplate,
  planetCenterX: number,
  planetCenterY: number,
  planetRadius: number,
): boolean {
  const verts = shipHullWorldVertices(ship, mesh)
  return shipHullIntersectsPlanetDisc(planetCenterX, planetCenterY, planetRadius, verts)
}
