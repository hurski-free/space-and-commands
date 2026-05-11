/**
 * Game-scale constants (not SI-accurate; tuned for readable motion on canvas).
 */

/** Gravitational coupling: F = G * m_planet * m_ship / (r² + ε). */
// export const GRAVITY_G = 1
export const GRAVITY_G = 0.1;

export const SHIP_DURABILITY_MPL = 10

/**
 * Hull structural strength (game units) for landing survival: chance factor is
 * `strength / (‖v‖ * mass)`; see `planet-landing.ts`.
 * Meshes may override via `ShipMeshTemplate.structuralStrength`.
 */
export const DEFAULT_SHIP_STRUCTURAL_STRENGTH = 12_000_000

/** Below this value of ‖v‖·mass (kg·m/s) contact is treated as negligible impact (safe landing). */
export const LANDING_IMPACT_DENOM_EPS = 1e-6

/**
 * Default half-width (degrees) for landing attitude: |∠(radial, tail→nose) − nominal| must be ≤ this.
 * Overridable per hull via `ShipMeshTemplate.landingMaxDeviationDeg`.
 */
export const DEFAULT_LANDING_MAX_DEVIATION_DEG = 10

/**
 * Default nominal angle (degrees) between planet outward radial and tail→nose axis; 90° = nose along horizon.
 */
export const DEFAULT_LANDING_NOMINAL_RADIAL_TO_NOSE_DEG = 90

/** Softening to avoid singularities at r → 0 (scales ~ with world length²). */
export const GRAVITY_EPSILON_SQ = 10_000

/** Main engine thrust at 100% throttle (newtons, game units). */
export const MAIN_ENGINE_MAX_THRUST_N = 130000

/** Angular acceleration scale: rad/s² at 100% RCS torque. */
export const RCS_MAX_ANGULAR_ACCEL = 0.6
