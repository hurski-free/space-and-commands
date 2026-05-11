import orcaHaulerPng from '../assets/orca-hauler.png?url'

/** Vite-resolved URLs for hull sprites (UV 0–1 in mesh vertices map into image pixels; RGBA). */
export const SHIP_HULL_TEXTURE_URLS: Readonly<Record<string, string>> = {
  'orca-hauler': orcaHaulerPng,
}

export function loadHullTexture(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Hull texture failed to load: ${url}`))
    img.src = url
  })
}
