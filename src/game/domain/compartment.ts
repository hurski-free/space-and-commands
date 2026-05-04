import type { CompartmentId } from '../core/ids'

/**
 * Structural / environmental failure in a hull compartment.
 * Random events attach one of these; repair commands clear or progress them.
 */
export const CompartmentFaultKind = {
  HullBreach: 'hull_breach',
  BulkheadStuck: 'bulkhead_stuck',
  /** Extend with more narrative fault types without changing IDs. */
  Generic: 'generic',
} as const

export type CompartmentFaultKind = (typeof CompartmentFaultKind)[keyof typeof CompartmentFaultKind]

export interface CompartmentState {
  id: CompartmentId
  activeFault: CompartmentFaultKind | null
  /** True while crew AI or player has ordered repair for this compartment. */
  repairInProgress: boolean
}
