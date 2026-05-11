import type { PlanetBody } from '../domain/planet'
import type { GameRenderModel } from './render-model'
import { mulberry32 } from '../core/rng'
import { drawShipMeshTextured, nozzleWorldPositions } from './draw-ship-mesh'

/**
 * Canvas drawing: starfield, planets, ship, velocity hint.
 */

interface IGameRenderer {
  render(ctx: CanvasRenderingContext2D, model: GameRenderModel): void

  resize(cssWidthPx: number, cssHeightPx: number): void
}

interface StarDot {
  readonly x: number
  readonly y: number
  readonly r: number
  readonly o: number
}

/** True if the planet disc (screen space) does not overlap the inner canvas rect. */
function planetDiscOffCanvas(
  sx: number,
  sy: number,
  screenRadius: number,
  w: number,
  h: number,
  pad: number,
): boolean {
  const minX = pad
  const maxX = w - pad
  const minY = pad
  const maxY = h - pad
  const qx = Math.max(minX, Math.min(sx, maxX))
  const qy = Math.max(minY, Math.min(sy, maxY))
  const dx = sx - qx
  const dy = sy - qy
  return dx * dx + dy * dy > screenRadius * screenRadius
}

/** First intersection of ray (cx,cy)+t*(dirX,dirY), t>0, with the inner rectangle boundary. */
function rayToInnerRectEdge(
  cx: number,
  cy: number,
  dirX: number,
  dirY: number,
  w: number,
  h: number,
  pad: number,
): { x: number; y: number } {
  const minX = pad
  const maxX = w - pad
  const minY = pad
  const maxY = h - pad
  let bestT = Number.POSITIVE_INFINITY

  const consider = (t: number): void => {
    if (t <= 0) return
    const x = cx + t * dirX
    const y = cy + t * dirY
    if (x >= minX - 1e-6 && x <= maxX + 1e-6 && y >= minY - 1e-6 && y <= maxY + 1e-6) {
      bestT = Math.min(bestT, t)
    }
  }

  if (Math.abs(dirX) > 1e-9) {
    consider((minX - cx) / dirX)
    consider((maxX - cx) / dirX)
  }
  if (Math.abs(dirY) > 1e-9) {
    consider((minY - cy) / dirY)
    consider((maxY - cy) / dirY)
  }

  if (bestT === Number.POSITIVE_INFINITY) {
    return {
      x: dirX >= 0 ? maxX : minX,
      y: dirY >= 0 ? maxY : minY,
    }
  }
  return { x: cx + bestT * dirX, y: cy + bestT * dirY }
}

function drawOffScreenPlanetArrows(
  ctx: CanvasRenderingContext2D,
  planets: readonly PlanetBody[],
  shipWx: number,
  shipWy: number,
  cam: GameRenderModel['camera'],
  w: number,
  h: number,
  cx: number,
  cy: number,
  toS: (wx: number, wy: number) => { x: number; y: number },
): void {
  const pad = 14
  const edgePad = 10

  type Row = { planet: PlanetBody; distSq: number; sx: number; sy: number }
  const rows: Row[] = []
  for (const planet of planets) {
    const screenR = planet.radius * cam.scale
    const s = toS(planet.positionX, planet.positionY)
    if (!planetDiscOffCanvas(s.x, s.y, screenR, w, h, edgePad)) continue
    const dx = planet.positionX - shipWx
    const dy = planet.positionY - shipWy
    rows.push({ planet, distSq: dx * dx + dy * dy, sx: s.x, sy: s.y })
  }
  rows.sort((a, b) => a.distSq - b.distSq)
  const top = rows.slice(0, 3)

  for (const { planet, sx, sy } of top) {
    let dirX = sx - cx
    let dirY = sy - cy
    const len = Math.hypot(dirX, dirY)
    if (len < 1e-6) continue
    dirX /= len
    dirY /= len

    const tip = rayToInnerRectEdge(cx, cy, dirX, dirY, w, h, pad)
    const ah = 9
    const aw = 6
    const bx = tip.x - dirX * ah
    const by = tip.y - dirY * ah
    const px = -dirY
    const py = dirX

    ctx.save()
    ctx.strokeStyle = 'rgba(94, 224, 208, 0.55)'
    ctx.fillStyle = planet.color
    ctx.globalAlpha = 0.92
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(tip.x, tip.y)
    ctx.lineTo(bx + px * aw, by + py * aw)
    ctx.lineTo(bx - px * aw, by - py * aw)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 0.65
    ctx.stroke()
    ctx.restore()

    const dist = Math.round(Math.hypot(sx - cx, sy - cy))
    const labelX = bx - dirX * 20
    const labelY = by - dirY * 20
    const label = dist.toFixed(0);

    ctx.save()
    ctx.font = '600 11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(7, 11, 20, 0.88)'
    ctx.fillStyle = 'rgba(220, 232, 248, 0.95)'
    ctx.strokeText(label, labelX, labelY)
    ctx.fillText(label, labelX, labelY)
    ctx.restore()
  }
}

export class CanvasGameRenderer implements IGameRenderer {
  private cssW = 1
  private cssH = 1
  private stars: StarDot[] = []
  private hullAtlas: HTMLCanvasElement | null = null
  private readonly hullAtlasSize = 512

  resize(cssWidthPx: number, cssHeightPx: number): void {
    this.cssW = Math.max(1, cssWidthPx)
    this.cssH = Math.max(1, cssHeightPx)
    const rng = mulberry32(0xc0ffee)
    const next: StarDot[] = []
    for (let i = 0; i < 280; i++) {
      next.push({
        x: (rng() - 0.5) * 2_600_000,
        y: (rng() - 0.5) * 2_600_000,
        r: rng() * 1.15 + 0.28,
        o: 0.1 + rng() * 0.48,
      })
    }
    this.stars = next
    this.hullAtlas = this.buildHullAtlas()
  }

  /** Procedural metal atlas for UV-mapped hull (replace with image asset when available). */
  private buildHullAtlas(): HTMLCanvasElement {
    const n = this.hullAtlasSize
    const c = document.createElement('canvas')
    c.width = n
    c.height = n
    const g = c.getContext('2d')
    if (!g) return c

    const bg = g.createLinearGradient(0, 0, n, n)
    bg.addColorStop(0, '#283244')
    bg.addColorStop(0.45, '#4a5d78')
    bg.addColorStop(1, '#1a2230')
    g.fillStyle = bg
    g.fillRect(0, 0, n, n)

    g.strokeStyle = 'rgba(190, 210, 235, 0.12)'
    g.lineWidth = 2
    for (let i = 0; i <= 10; i++) {
      const t = (i / 10) * n
      g.beginPath()
      g.moveTo(t, 0)
      g.lineTo(t, n)
      g.stroke()
      g.beginPath()
      g.moveTo(0, t)
      g.lineTo(n, t)
      g.stroke()
    }

    g.strokeStyle = 'rgba(120, 200, 255, 0.18)'
    g.lineWidth = 3
    g.strokeRect(24, 24, n - 48, n - 48)

    const rng = mulberry32(0x5b1d5eed)
    g.fillStyle = 'rgba(90, 110, 130, 0.35)'
    for (let i = 0; i < 420; i++) {
      const x = rng() * n
      const y = rng() * n
      const r = rng() * 1.8 + 0.4
      g.beginPath()
      g.arc(x, y, r, 0, Math.PI * 2)
      g.fill()
    }

    return c
  }

  render(ctx: CanvasRenderingContext2D, model: GameRenderModel): void {
    const w = this.cssW
    const h = this.cssH
    const cam = model.camera
    const cx = w / 2
    const cy = h / 2

    ctx.fillStyle = '#070b14'
    ctx.fillRect(0, 0, w, h)

    const toS = (wx: number, wy: number) => ({
      x: (wx - cam.offsetX) * cam.scale + cx,
      y: (wy - cam.offsetY) * cam.scale + cy,
    })

    for (const s of this.stars) {
      const p = toS(s.x, s.y)
      if (p.x < -3 || p.y < -3 || p.x > w + 3 || p.y > h + 3) continue
      ctx.fillStyle = `rgba(210,225,255,${s.o})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }

    for (const planet of model.planets) {
      const pr = planet.radius * cam.scale
      const c = toS(planet.positionX, planet.positionY)
      ctx.fillStyle = planet.color
      ctx.beginPath()
      ctx.arc(c.x, c.y, pr, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(94,224,208,0.28)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const ship = model.ship.body
    const hullMesh = model.shipMesh
    const hRad = ship.headingRad
    const { x: ox, y: oy } = ship.position

    ctx.save()
    const hullTex = model.hullTexture ?? this.hullAtlas
    /** Drop-shadow + RGBA hulls often produces light halos; keep glow only for procedural atlas. */
    if (!model.hullTexture) {
      ctx.shadowColor = 'rgba(20, 80, 120, 0.38)'
      ctx.shadowBlur = 28
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0
    }
    const tw = model.hullTexture ? model.hullTextureWidthPx : this.hullAtlasSize
    const th = model.hullTexture ? model.hullTextureHeightPx : this.hullAtlasSize
    drawShipMeshTextured(
      ctx,
      hullMesh,
      hullTex,
      tw,
      th,
      ox,
      oy,
      hRad,
      (wx: number, wy: number) => toS(wx, wy),
    )
    ctx.shadowBlur = 0
    ctx.restore()

    const me = model.ship.mainEngine
    const fuelOk = !model.ship.mainFuelLine.broken && !me.damaged
    const thrusting = fuelOk && !me.commandedStop && me.throttlePercent > 0.5

    if (thrusting) {
      const now = performance.now()
      const flicker = 0.9 + 0.1 * Math.sin(now * 0.024)
      const jitter = 0.96 + 0.04 * Math.sin(now * 0.037 + 1.7)
      const tq = Math.max(0, Math.min(100, me.throttlePercent)) / 100
      const lu = hullMesh.localUnitsToWorldMeters ?? 1
      let hullRLocal = 0
      for (const v of hullMesh.vertices) {
        hullRLocal = Math.max(hullRLocal, Math.hypot(v.x, v.y))
      }
      const hullExtentWorld = hullRLocal * lu
      const ax = Math.cos(hRad + Math.PI)
      const ay = Math.sin(hRad + Math.PI)
      const px = Math.cos(hRad + Math.PI / 2)
      const py = Math.sin(hRad + Math.PI / 2)
      // Plume length/width scale with hull size (`hullExtentWorld`) and zoom (`cam.scale`). To resize the jet
      // uniformly, multiply both `(base + span * tq)` groups below by the same factor (e.g. 1.2). Tweak only
      // the first group for length-only, only the second for width-only. Multi-nozzle narrowing: `widthScale`.
      const len =
        cam.scale * hullExtentWorld * (0.285 + 0.69 * tq) * flicker * jitter
      const halfW =
        cam.scale *
        hullExtentWorld *
        (0.0465 + 0.1185 * tq) *
        (0.92 + 0.08 * Math.sin(now * 0.031))
      const wobble = 0.92 + 0.08 * Math.sin(now * 0.028 + 0.4)

      const nozzles = nozzleWorldPositions(hullMesh, ox, oy, hRad)
      const nNozzles = Math.max(1, nozzles.length)
      const widthScale = 0.56 * Math.sqrt(2 / nNozzles)

      const drawPlumeCone = (c0x: number, c0y: number, plumeWidthScale: number): void => {
        const hw = halfW * plumeWidthScale * wobble
        const tipX = c0x + ax * len
        const tipY = c0y + ay * len
        const mid = 0.42
        const m1x = c0x + ax * (len * mid) + px * hw
        const m1y = c0y + ay * (len * mid) + py * hw
        const m2x = c0x + ax * (len * mid) - px * hw
        const m2y = c0y + ay * (len * mid) - py * hw

        const g = ctx.createLinearGradient(c0x, c0y, tipX, tipY)
        g.addColorStop(0, 'rgba(255,250,235,0.92)')
        g.addColorStop(0.12, 'rgba(186,230,255,0.72)')
        g.addColorStop(0.35, 'rgba(90,180,255,0.45)')
        g.addColorStop(0.65, 'rgba(40,100,220,0.2)')
        g.addColorStop(1, 'rgba(12,40,90,0)')

        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(c0x + px * (hw * 0.35), c0y + py * (hw * 0.35))
        ctx.lineTo(m1x, m1y)
        ctx.lineTo(tipX, tipY)
        ctx.lineTo(m2x, m2y)
        ctx.lineTo(c0x - px * (hw * 0.35), c0y - py * (hw * 0.35))
        ctx.closePath()
        ctx.fill()

        ctx.globalCompositeOperation = 'lighter'
        ctx.fillStyle = 'rgba(200,235,255,0.38)'
        ctx.beginPath()
        ctx.moveTo(c0x, c0y)
        ctx.lineTo(m1x * 0.92 + tipX * 0.08, m1y * 0.92 + tipY * 0.08)
        ctx.lineTo(tipX, tipY)
        ctx.lineTo(m2x * 0.92 + tipX * 0.08, m2y * 0.92 + tipY * 0.08)
        ctx.closePath()
        ctx.fill()
      }

      ctx.save()
      for (const n of nozzles) {
        const p = toS(n.wx, n.wy)
        drawPlumeCone(p.x, p.y, widthScale)
      }
      ctx.restore()
    }

    const vx = ship.velocity.x * cam.scale * 0.55
    const vy = ship.velocity.y * cam.scale * 0.55
    const vLen = Math.hypot(vx, vy)
    if (vLen > 2) {
      ctx.strokeStyle = 'rgba(94,224,208,0.4)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 6])
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + vx, cy + vy)
      ctx.stroke()
      ctx.setLineDash([])
    }

    drawOffScreenPlanetArrows(ctx, model.planets, ox, oy, cam, w, h, cx, cy, toS)
  }
}
