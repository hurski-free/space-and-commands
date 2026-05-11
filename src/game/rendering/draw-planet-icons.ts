/**
 * Small screen-space glyphs for planet scan / resources (canvas 2D paths).
 */

/** Radar-style scan badge; caller sets globalAlpha for transparency. */
export function drawPlanetScanBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diameterPx: number,
): void {
  const r = diameterPx * 0.5
  const lw = Math.max(1, diameterPx * 0.09)
  ctx.save()
  ctx.translate(cx, cy)
  ctx.lineWidth = lw
  ctx.strokeStyle = 'rgba(200, 235, 255, 0.95)'
  ctx.fillStyle = 'rgba(140, 200, 255, 0.22)'

  ctx.beginPath()
  ctx.arc(0, 0, r * 0.38, 0, Math.PI * 2)
  ctx.stroke()

  for (let k = 1; k <= 2; k++) {
    ctx.beginPath()
    ctx.arc(0, 0, r * 0.22 * k, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.arc(0, 0, r * 0.44, -Math.PI * 0.15, Math.PI * 0.35)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}

/** Fuel droplet + highlight (opaque colors; stack with ctx.save alpha if needed). */
export function drawPlanetFuelIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diameterPx: number,
): void {
  const s = diameterPx * 0.5
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.moveTo(0, -0.72)
  ctx.bezierCurveTo(0.62, -0.28, 0.62, 0.38, 0, 0.85)
  ctx.bezierCurveTo(-0.62, 0.38, -0.62, -0.28, 0, -0.72)
  ctx.closePath()
  const g = ctx.createLinearGradient(-0.4, -0.7, 0.45, 0.75)
  g.addColorStop(0, '#7ae0ff')
  g.addColorStop(0.45, '#2aa8e6')
  g.addColorStop(1, '#0d5a8a')
  ctx.fillStyle = g
  ctx.fill()
  ctx.strokeStyle = 'rgba(220, 248, 255, 0.9)'
  ctx.lineWidth = 0.12
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(-0.18, -0.28, 0.14, 0.1, -0.35, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.fill()
  ctx.restore()
}

/** Simple ingot / bar stack for metal. */
export function drawPlanetMetalIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  diameterPx: number,
): void {
  const s = diameterPx * 0.5
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)
  ctx.lineWidth = 0.1
  ctx.strokeStyle = 'rgba(40, 48, 58, 0.95)'

  const drawBar = (y: number, w: number, h: number, skew: number): void => {
    ctx.beginPath()
    ctx.moveTo(-w * 0.5 - skew, y - h * 0.5)
    ctx.lineTo(w * 0.5 - skew, y - h * 0.5)
    ctx.lineTo(w * 0.5 + skew, y + h * 0.5)
    ctx.lineTo(-w * 0.5 + skew, y + h * 0.5)
    ctx.closePath()
  }

  const g0 = ctx.createLinearGradient(-0.5, -0.35, 0.55, 0.4)
  g0.addColorStop(0, '#c8d4e8')
  g0.addColorStop(0.5, '#8a9aaf')
  g0.addColorStop(1, '#5a6578')
  ctx.fillStyle = g0
  drawBar(-0.08, 0.95, 0.38, 0.06)
  ctx.fill()
  ctx.stroke()

  const g1 = ctx.createLinearGradient(-0.45, 0.02, 0.5, 0.55)
  g1.addColorStop(0, '#dde6f5')
  g1.addColorStop(0.45, '#9eacbf')
  g1.addColorStop(1, '#6a7588')
  ctx.fillStyle = g1
  drawBar(0.32, 0.82, 0.34, 0.05)
  ctx.fill()
  ctx.stroke()

  ctx.restore()
}
