import type { GameRenderModel } from './render-model'
import { mulberry32 } from '../core/rng'

/**
 * Canvas drawing: starfield, planets, ship, velocity hint.
 */

export interface IGameRenderer {
  render(ctx: CanvasRenderingContext2D, model: GameRenderModel): void

  resize(cssWidthPx: number, cssHeightPx: number): void
}

interface StarDot {
  readonly x: number
  readonly y: number
  readonly r: number
  readonly o: number
}

export class CanvasGameRenderer implements IGameRenderer {
  private cssW = 1
  private cssH = 1
  private stars: StarDot[] = []

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
      const pr = Math.max(30, planet.radius * cam.scale)
      const c = toS(planet.positionX, planet.positionY)
      const g = ctx.createRadialGradient(c.x - pr * 0.35, c.y - pr * 0.35, pr * 0.12, c.x, c.y, pr)
      g.addColorStop(0, '#a8c8ff')
      g.addColorStop(0.5, '#4d6fa3')
      g.addColorStop(1, '#152030')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(c.x, c.y, pr, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(94,224,208,0.28)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    const ship = model.ship.body
    const hRad = ship.headingRad
    const nose = toS(
      ship.position.x + Math.cos(hRad) * 190,
      ship.position.y + Math.sin(hRad) * 190,
    )
    const left = toS(
      ship.position.x + Math.cos(hRad + 2.55) * 120,
      ship.position.y + Math.sin(hRad + 2.55) * 120,
    )
    const right = toS(
      ship.position.x + Math.cos(hRad - 2.55) * 120,
      ship.position.y + Math.sin(hRad - 2.55) * 120,
    )
    ctx.fillStyle = '#dce4f0'
    ctx.strokeStyle = 'rgba(94,224,208,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(nose.x, nose.y)
    ctx.lineTo(left.x, left.y)
    ctx.lineTo(right.x, right.y)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

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
  }
}
