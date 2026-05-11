import type { PlanetBody } from '../domain/planet'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import {
  DEFAULT_LANDING_MAX_DEVIATION_DEG,
  DEFAULT_LANDING_NOMINAL_RADIAL_TO_NOSE_DEG,
  DEFAULT_SHIP_STRUCTURAL_STRENGTH,
  LANDING_IMPACT_DENOM_EPS,
} from './physics.const'

/**
 * Relative “landing viability”: strength / (‖v‖ · m). Values ≥ 1 mean impact is within hull margin.
 * For ‖v‖·m ≈ 0, returns +Infinity (caller treats as safe contact).
 */
export function computeLandingChanceFactor(
  structuralStrength: number,
  speed: number,
  massKg: number,
): number {
  const denom = speed * massKg
  if (denom <= LANDING_IMPACT_DENOM_EPS) return 1;

  return structuralStrength / denom
}

export function structuralStrengthForHull(
  hullStrength: number | undefined,
): number {
  return hullStrength ?? DEFAULT_SHIP_STRUCTURAL_STRENGTH
}

export function landingAttitudeFromMesh(mesh: ShipMeshTemplate): {
  nominalRadialToNoseDeg: number
  maxDeviationDeg: number
} {
  return {
    nominalRadialToNoseDeg:
      mesh.landingNominalRadialToNoseDeg ?? DEFAULT_LANDING_NOMINAL_RADIAL_TO_NOSE_DEG,
    maxDeviationDeg: mesh.landingMaxDeviationDeg ?? DEFAULT_LANDING_MAX_DEVIATION_DEG,
  }
}

/**
 * Smallest absolute difference (degrees) between the radial↔tail→nose angle and the nominal target.
 * Tail→nose matches world heading (+X forward); radial is outward from planet center toward the ship.
 */
export function landingAttitudeDeviationDeg(
  shipHeadingRad: number,
  planet: PlanetBody,
  shipPosition: { readonly x: number; readonly y: number },
  nominalRadialToNoseDeg: number,
): number {
  const dx = shipPosition.x - planet.positionX
  const dy = shipPosition.y - planet.positionY
  const dist = Math.hypot(dx, dy)

  const rx = dx / dist
  const ry = dy / dist
  const nx = Math.cos(shipHeadingRad)
  const ny = Math.sin(shipHeadingRad)
  const c = Math.max(-1, Math.min(1, rx * nx + ry * ny))
  const angleDeg = (Math.acos(c) * 180) / Math.PI

  return Math.abs(angleDeg - nominalRadialToNoseDeg)
}

export function isLandingAttitudeWithinTolerance(
  shipHeadingRad: number,
  planet: PlanetBody,
  shipPosition: { readonly x: number; readonly y: number },
  mesh: ShipMeshTemplate,
): boolean {
  const { nominalRadialToNoseDeg, maxDeviationDeg } = landingAttitudeFromMesh(mesh)
  const dev = landingAttitudeDeviationDeg(
    shipHeadingRad,
    planet,
    shipPosition,
    nominalRadialToNoseDeg,
  )
  return dev <= maxDeviationDeg + 1e-9
}
