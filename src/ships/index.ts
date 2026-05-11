export type { ShipMeshTemplate } from './ship-mesh-types'
export { meshLocalToWorldMeters } from './ship-mesh-types'
export { loadHullTexture, SHIP_HULL_TEXTURE_URLS } from './ship-hull-textures'

import { orcaHaulerMesh } from './orca-hauler'
import type { ShipMeshTemplate } from './ship-mesh-types'

/** Built-in hull templates keyed by `id`. */
export const SHIP_MESH_TEMPLATES: Readonly<Record<string, ShipMeshTemplate>> = {
  [orcaHaulerMesh.id]: orcaHaulerMesh,
}

/** Default mesh for canvas / config when no other hull is selected. */
export const DEFAULT_SHIP_MESH = orcaHaulerMesh
