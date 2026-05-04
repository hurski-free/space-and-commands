import type { CompartmentId } from '../core/ids'
import type { CompartmentFaultKind } from '../domain/compartment'

/**
 * Hazards emitted by the random event system; applier mutates ship / queues.
 */

export type OperationalEvent =
  | { readonly kind: 'compartment_fault'; readonly compartmentId: CompartmentId; readonly faultKind: CompartmentFaultKind }
  | { readonly kind: 'main_engine_fuel_line_break' }
  | { readonly kind: 'maneuver_fuel_line_break' }
