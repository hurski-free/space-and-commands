/**
 * Hull PNGs → RGBA: mark background touching image edges as transparent.
 * Supports dark space backdrops and light (white/gray) AI-generated fills.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.join(__dirname, '..', 'src', 'assets')
const files = ['orca-hauler.png']

const MAX_CHANNEL = 38
const MAX_SUM = 120
/** Near-white / light studio background (sum ≥ threshold, typical ≥ ~227/255 per channel). */
const MIN_LIGHT_SUM = 690

function floodTransparent(rgb, w, h) {
  const n = w * h
  const out = Buffer.alloc(n * 4)
  const vis = new Uint8Array(n)
  const qx = new Int32Array(n)
  const qy = new Int32Array(n)
  let qh = 0
  let qt = 0
  const idx = (x, y) => y * w + x
  const dark = (i) => {
    const o = i * 3
    const r = rgb[o]
    const g = rgb[o + 1]
    const b = rgb[o + 2]
    return r + g + b <= MAX_SUM && r <= MAX_CHANNEL && g <= MAX_CHANNEL && b <= MAX_CHANNEL
  }
  const light = (i) => {
    const o = i * 3
    const r = rgb[o]
    const g = rgb[o + 1]
    const b = rgb[o + 2]
    return r + g + b >= MIN_LIGHT_SUM
  }
  const bg = (i) => dark(i) || light(i)
  const push = (x, y) => {
    const i = idx(x, y)
    if (vis[i]) return
    if (!bg(i)) return
    vis[i] = 1
    qx[qt] = x
    qy[qt] = y
    qt++
  }
  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }
  while (qh < qt) {
    const x = qx[qh]
    const y = qy[qh]
    qh++
    if (x > 0) push(x - 1, y)
    if (x + 1 < w) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y + 1 < h) push(x, y + 1)
  }
  for (let i = 0; i < n; i++) {
    const o = i * 3
    const t = i * 4
    if (vis[i]) {
      out[t] = 0
      out[t + 1] = 0
      out[t + 2] = 0
      out[t + 3] = 0
    } else {
      out[t] = rgb[o]
      out[t + 1] = rgb[o + 1]
      out[t + 2] = rgb[o + 2]
      out[t + 3] = 255
    }
  }
  return out
}

for (const name of files) {
  const filePath = path.join(assetsDir, name)
  if (!fs.existsSync(filePath)) {
    console.error('Missing', filePath)
    process.exit(1)
  }
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const rgb = Buffer.alloc(w * h * 3)
  for (let i = 0; i < w * h; i++) {
    rgb[i * 3] = data[i * 4]
    rgb[i * 3 + 1] = data[i * 4 + 1]
    rgb[i * 3 + 2] = data[i * 4 + 2]
  }
  const rgba = floodTransparent(rgb, w, h)
  const tmp = filePath + '.tmp.png'
  await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(tmp)
  fs.renameSync(tmp, filePath)
  console.log('OK', name, `${w}×${h}`, 'RGBA')
}
