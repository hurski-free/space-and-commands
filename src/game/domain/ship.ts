import type { MutableVector2 } from '../core/vectors'
import type { CompartmentState } from './compartment'
import type { MainEngineFuelLineState, ManeuverFuelLineState } from './fuel-system'
import type { MainEngineState, RotationState } from './propulsion'
import type { ModuleState } from './module'

/**
 * Aggregate mutable simulation state for the player vessel.
 * Physics, commands, and events all converge on this model (via dedicated services).
 */

export interface ShipRigidBody {
  position: MutableVector2
  velocity: MutableVector2
  /** Radians; rotation integration updates heading. */
  headingRad: number
  angularVelocityRadPerSec: number
  massKg: number
}

export interface ShipCargoAndTanks {
  fuelUnits: number
  metalUnits: number
}

export interface ShipState {
  body: ShipRigidBody
  mainEngine: MainEngineState
  rotation: RotationState
  mainFuelLine: MainEngineFuelLineState
  maneuverFuelLine: ManeuverFuelLineState
  compartments: CompartmentState[]
  modules: ModuleState[]
  cargo: ShipCargoAndTanks
}

/** Read-only snapshot for UI / renderer (implementation may deep-freeze or copy). */
export type ShipSnapshot = Readonly<ShipState>
