import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import { meshLocalToWorldMeters } from '../../ships/ship-mesh-types'

interface ScreenPoint {
  readonly x: number
  readonly y: number
}

/** Local (+X forward, +Y port) → world meters. */
function localToWorld(
  lx: number,
  ly: number,
  shipX: number,
  shipY: number,
  headingRad: number,
): { wx: number; wy: number } {
  const c = Math.cos(headingRad)
  const s = Math.sin(headingRad)
  return {
    wx: shipX + c * lx - s * ly,
    wy: shipY + s * lx + c * ly,
  }
}

/**
 * Affine maps texture (u,v) in [0,tw]×[0,th] to triangle (p0,p1,p2) on canvas.
 * UVs are linear across the triangle (adequate for top-down 2D).
 */
function drawTexturedTriangle(
  ctx: CanvasRenderingContext2D,
  texture: CanvasImageSource,
  tw: number,
  th: number,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
): void {
  const x0 = u0 * tw
  const y0 = v0 * th
  const x1 = u1 * tw
  const y1 = v1 * th
  const x2 = u2 * tw
  const y2 = v2 * th

  const det = x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1)
  if (Math.abs(det) < 1e-6) return

  const a = (p0.x * (y1 - y2) + p1.x * (y2 - y0) + p2.x * (y0 - y1)) / det
  const b = (p0.y * (y1 - y2) + p1.y * (y2 - y0) + p2.y * (y0 - y1)) / det
  const c = (p0.x * (x2 - x1) + p1.x * (x0 - x2) + p2.x * (x1 - x0)) / det
  const d = (p0.y * (x2 - x1) + p1.y * (x0 - x2) + p2.y * (x1 - x0)) / det
  const e =
    (p0.x * (x1 * y2 - x2 * y1) + p1.x * (x2 * y0 - x0 * y2) + p2.x * (x0 * y1 - x1 * y0)) / det
  const f =
    (p0.y * (x1 * y2 - x2 * y1) + p1.y * (x2 * y0 - x0 * y2) + p2.y * (x0 * y1 - x1 * y0)) / det

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.closePath()
  ctx.clip()
  ctx.setTransform(a, b, c, d, e, f)
  ctx.drawImage(texture, 0, 0)
  ctx.restore()
}

/** Fallback fill when no texture: hull-ish gradient from averaged UV. */
function fillTriangleFallback(
  ctx: CanvasRenderingContext2D,
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  u2: number,
  v2: number,
  p0: ScreenPoint,
  p1: ScreenPoint,
  p2: ScreenPoint,
): void {
  const u = (u0 + u1 + u2) / 3
  const v = (v0 + v1 + v2) / 3
  const g = ctx.createLinearGradient(p0.x, p0.y, p2.x, p2.y)
  const h1 = 210 + u * 35
  const h2 = 200 + v * 40
  g.addColorStop(0, `hsla(${h1}, 28%, 72%, 0.95)`)
  g.addColorStop(1, `hsla(${h2}, 35%, 42%, 0.92)`)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(p0.x, p0.y)
  ctx.lineTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.closePath()
  ctx.fill()
}

export function drawShipMeshTextured(
  ctx: CanvasRenderingContext2D,
  mesh: ShipMeshTemplate,
  texture: CanvasImageSource | null,
  textureWidthPx: number,
  textureHeightPx: number,
  shipX: number,
  shipY: number,
  headingRad: number,
  toScreen: (wx: number, wy: number) => ScreenPoint,
): void {
  const verts = mesh.vertices
  const tri = mesh.indices

  const scr: ScreenPoint[] = verts.map((v) => {
    const { x: lx, y: ly } = meshLocalToWorldMeters(mesh, v.x, v.y)
    const { wx, wy } = localToWorld(lx, ly, shipX, shipY, headingRad)
    return toScreen(wx, wy)
  })

  for (const [ia, ib, ic] of tri) {
    const va = verts[ia]!
    const vb = verts[ib]!
    const vc = verts[ic]!
    const pa = scr[ia]!
    const pb = scr[ib]!
    const pc = scr[ic]!
    if (texture) {
      drawTexturedTriangle(
        ctx,
        texture,
        textureWidthPx,
        textureHeightPx,
        va.u,
        va.v,
        vb.u,
        vb.v,
        vc.u,
        vc.v,
        pa,
        pb,
        pc,
      )
    } else {
      fillTriangleFallback(ctx, va.u, va.v, vb.u, vb.v, vc.u, vc.v, pa, pb, pc)
    }
  }
}

/** World positions of nozzles for plume rendering. */
export function nozzleWorldPositions(
  mesh: ShipMeshTemplate,
  shipX: number,
  shipY: number,
  headingRad: number,
): { wx: number; wy: number }[] {
  return mesh.nozzlePositions.map((n) => {
    const { x: lx, y: ly } = meshLocalToWorldMeters(mesh, n.x, n.y)
    return localToWorld(lx, ly, shipX, shipY, headingRad)
  })
}
