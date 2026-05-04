import type { ShipState } from '../domain/ship'
import type { OperationalEvent } from './operational-events'

/**
 * Translates operational events into concrete ship model changes.
 */

export interface IOperationalEventApplier {
  apply(ship: ShipState, event: OperationalEvent): void
}

export class OperationalEventApplier implements IOperationalEventApplier {
  apply(ship: ShipState, event: OperationalEvent): void {
    switch (event.kind) {
      case 'compartment_fault': {
        const c = ship.compartments.find((x) => x.id === event.compartmentId)
        if (c) {
          c.activeFault = event.faultKind
          c.repairInProgress = false
        }
        break
      }
      case 'main_engine_fuel_line_break': {
        ship.mainFuelLine.broken = true
        break
      }
      case 'maneuver_fuel_line_break': {
        ship.maneuverFuelLine.broken = true
        break
      }
    }
  }
}
