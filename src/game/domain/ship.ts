import type { MutableVector2 } from '../core/vectors'
import type { CompartmentState } from './compartment'
import type { MainEngineFuelLineState, ManeuverFuelLineState } from './fuel-system'
import type { MainEngineState, RotationState } from './propulsion'

/**
 * Aggregate mutable simulation state for the player vessel.
 * Physics, commands, and events all converge on this model (via dedicated services).
 */

interface ShipRigidBody {
  position: MutableVector2
  velocity: MutableVector2
  /** Radians; rotation integration updates heading. */
  headingRad: number
  angularVelocityRadPerSec: number
  massKg: number
  size: number
}

interface ShipCargoAndTanks {
  /** Propellant in metric tons. */
  fuelTons: number
  metalUnits: number
}

export interface ShipState {
  body: ShipRigidBody
  mainEngine: MainEngineState
  rotation: RotationState
  mainFuelLine: MainEngineFuelLineState
  maneuverFuelLine: ManeuverFuelLineState
  /** Resting on a planet while all propulsion is off; cleared when any engine fires. */
  planetAttachment: PlanetAttachment | null
  /** Voice / data link down until repaired (random hazard). */
  commsBroken: boolean
  compartments: CompartmentState[]
  cargo: ShipCargoAndTanks
}

export interface PlanetAttachment {
  readonly planetId: string
}

/** Read-only snapshot for UI / renderer (implementation may deep-freeze or copy). */
export type ShipSnapshot = Readonly<ShipState>
