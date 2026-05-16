import type { ShipMeshTemplate } from '../../ships/ship-mesh-types'
import type { ShipState } from './ship'

/** N = P × K per simulation tick; P is engine power 0–100 (%). */
export const FUEL_CONSUMPTION_K = 0.001

/** Maneuver consumption uses N = P × K × this factor. */
export const MANEUVER_FUEL_CONSUMPTION_FACTOR = 0.05

export const DEFAULT_FUEL_CAPACITY_TONS = 200
export const DEFAULT_FUEL_EXTRACTION_TONS_PER_TICK = 1

export function getFuelCapacityTons(mesh: ShipMeshTemplate): number {
  return mesh.fuelCapacityTons ?? DEFAULT_FUEL_CAPACITY_TONS
}

export function getFuelExtractionTonsPerTick(mesh: ShipMeshTemplate): number {
  return mesh.fuelExtractionTonsPerTick ?? DEFAULT_FUEL_EXTRACTION_TONS_PER_TICK
}

export function clampFuelToCapacity(ship: ShipState, mesh: ShipMeshTemplate): void {
  const cap = getFuelCapacityTons(mesh)
  ship.cargo.fuelTons = Math.max(0, Math.min(cap, ship.cargo.fuelTons))
}

export function hasUsableFuel(ship: ShipState): boolean {
  return ship.cargo.fuelTons > 0
}

/** Main-engine power 0–100 for consumption (matches thrust gating). */
function mainEnginePowerPercent(ship: ShipState): number {
  const me = ship.mainEngine
  const fuelOk = !ship.mainFuelLine.broken && !me.damaged
  if (!fuelOk || me.commandedStop) return 0
  return Math.max(0, Math.min(100, me.throttlePercent))
}

/** RCS power 0–100 for consumption (matches torque gating). */
function maneuverEnginePowerPercent(ship: ShipState): number {
  const rot = ship.rotation
  const maneuverOk = !ship.maneuverFuelLine.broken && !rot.rcsDamaged
  if (!maneuverOk) return 0
  return Math.max(0, Math.min(100, Math.abs(rot.torquePercent)))
}

/**
 * Spend fuel for the current tick from commanded engine power.
 * Call once per tick before physics integration.
 */
export function consumeFuelPerTick(ship: ShipState): void {
  if (!hasUsableFuel(ship)) {
    ship.cargo.fuelTons = 0
    return
  }

  let burn = 0
  const mainP = mainEnginePowerPercent(ship)
  if (mainP > 0) {
    burn += mainP * FUEL_CONSUMPTION_K
  }
  const manP = maneuverEnginePowerPercent(ship)
  if (manP > 0) {
    burn += manP * FUEL_CONSUMPTION_K * MANEUVER_FUEL_CONSUMPTION_FACTOR
  }

  ship.cargo.fuelTons = Math.max(0, ship.cargo.fuelTons - burn)
}

/**
 * Add fuel from planetary extraction for one tick; clamps to hull tank capacity.
 */
export function extractFuelPerTick(ship: ShipState, mesh: ShipMeshTemplate): void {
  const cap = getFuelCapacityTons(mesh)
  const added = getFuelExtractionTonsPerTick(mesh)
  ship.cargo.fuelTons = Math.min(cap, ship.cargo.fuelTons + added)
}
