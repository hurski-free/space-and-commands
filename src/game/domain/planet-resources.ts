import type { ResourceScanResult } from './planet'
import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import type { ShipState } from './ship'
import { extractFuelPerTick } from './fuel-economy'

export const DEFAULT_METAL_EXTRACTION_TONS_PER_TICK = 0.5

export function getMetalExtractionTonsPerTick(mesh: ShipMeshTemplate): number {
  return mesh.metalExtractionTonsPerTick ?? DEFAULT_METAL_EXTRACTION_TONS_PER_TICK
}

export function getPlanetScan(
  scans: ReadonlyMap<string, ResourceScanResult>,
  planetId: string,
): ResourceScanResult | undefined {
  return scans.get(planetId)
}

export function isPlanetScanned(
  scans: ReadonlyMap<string, ResourceScanResult>,
  planetId: string,
): boolean {
  return scans.has(planetId)
}

export function canExtractFuelFromScan(scan: ResourceScanResult | undefined): boolean {
  return scan?.hasFuelDeposits === true
}

export function canExtractMetalFromScan(scan: ResourceScanResult | undefined): boolean {
  return scan?.hasMetalDeposits === true
}

export function extractMetalPerTick(ship: ShipState, mesh: ShipMeshTemplate): void {
  ship.cargo.metalUnits += getMetalExtractionTonsPerTick(mesh)
}

/**
 * Mine fuel and metal for one tick from a landed, scanned planet.
 * Requires a prior `scan_nearest_planet` entry in `resourceScans`.
 */
export function extractPlanetaryResourcesPerTick(
  ship: ShipState,
  mesh: ShipMeshTemplate,
  scans: ReadonlyMap<string, ResourceScanResult>,
  planetId: string,
): void {
  const scan = getPlanetScan(scans, planetId)
  if (!scan) return

  if (canExtractFuelFromScan(scan)) {
    extractFuelPerTick(ship, mesh)
  }
  if (canExtractMetalFromScan(scan)) {
    extractMetalPerTick(ship, mesh)
  }
}
