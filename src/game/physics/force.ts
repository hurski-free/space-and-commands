/**
 * Forces in world space (N). Multiple sources sum before F = m a.
 */

export interface Force2 {
  readonly fx: number
  readonly fy: number
}

export interface IForceContribution {
  /** Short label for debug / telemetry. */
  readonly name: string

  /** Compute force on the ship at this instant (world frame). */
  compute(_args: ForceComputationContext): Force2
}

export interface ForceComputationContext {
  readonly deltaTimeSec: number
  /** Implementation-defined read access to ship and environment. */
  readonly world: unknown
}
