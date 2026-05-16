/**
 * Ship hull as indexed triangles with per-vertex UVs for texturing.
 * Local space: +X forward (nose), +Y port (left) in top-down view; matches world heading integration.
 */

interface ShipMeshVertex {
  readonly x: number
  readonly y: number
  /** 0–1 texture coordinates (atlas or procedural hull sheet). */
  readonly u: number
  readonly v: number
}

export interface ShipMeshTemplate {
  readonly id: string
  readonly displayName: string
  /**
   * Structural strength for planetary contact: landing success scales with
   * `structuralStrength / (speed * mass)` (see game simulator).
   */
  readonly structuralStrength?: number
  /** Maximum propellant tank capacity (metric tons). */
  readonly fuelCapacityTons?: number
  /** Fuel mined per simulation tick while landed on a deposit (metric tons). */
  readonly fuelExtractionTonsPerTick?: number
  /** Metal mined per simulation tick while landed on a deposit (metric tons). */
  readonly metalExtractionTonsPerTick?: number
  /**
   * Landing attitude: longitudinal axis is **tail → nose** (+X local, `headingRad` in world).
   * We compare the angle between **outward radial** (planet center → ship) and that axis to `landingNominalRadialToNoseDeg`.
   */
  readonly landingNominalRadialToNoseDeg?: number
  /** Max |actual − nominal| in degrees; see `DEFAULT_LANDING_MAX_DEVIATION_DEG`. */
  readonly landingMaxDeviationDeg?: number
  /**
   * Dimensionless local hull (typ. max ‖(x,y)‖ ≈ 1). Multiply by `localUnitsToWorldMeters` for world meters.
   * When omitted, `vertices` / `nozzlePositions` are already in world meters (scale 1).
   */
  readonly localUnitsToWorldMeters?: number
  /** Normalized local coordinates + UVs. */
  readonly vertices: readonly ShipMeshVertex[]
  /** Triangle corner indices into `vertices`. */
  readonly indices: readonly [number, number, number][]
  /**
   * Closed hull outline (CCW), indices into `vertices`, for rim stroke / glow.
   * Last edge connects last index back to first.
   */
  readonly hullLoop: readonly number[]
  /** Main-engine nozzle centers in the same local space as `vertices`. */
  readonly nozzlePositions: readonly { readonly x: number; readonly y: number }[]
}

export function meshLocalToWorldMeters(mesh: ShipMeshTemplate, lx: number, ly: number): { x: number; y: number } {
  const s = mesh.localUnitsToWorldMeters ?? 1
  return { x: lx * s, y: ly * s }
}
