/**
 * Main thrust along ship forward axis and rotational torque from RCS.
 * Command layer writes targets; physics reads realized thrust after faults.
 */

export interface MainEngineState {
  /** Target thrust 0..100 (% of rated). */
  throttlePercent: number
  /** Whether player commanded full stop. */
  commandedStop: boolean
  damaged: boolean
}

export interface RotationState {
  /** Negative = left, positive = right, magnitude 0..100 (%). */
  torquePercent: number
  commandedHold: boolean
  rcsDamaged: boolean
}
