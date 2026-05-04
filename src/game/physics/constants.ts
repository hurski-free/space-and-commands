/**
 * Game-scale constants (not SI-accurate; tuned for readable motion on canvas).
 */

/** Gravitational coupling: F = G * m_planet * m_ship / (r² + ε). */
export const GRAVITY_G = 500

/** Ship collision disc radius in world units (matches visual scale vs planets). */
export const SHIP_COLLISION_RADIUS = 95

/** Softening to avoid singularities at r → 0 (scales ~ with world length²). */
export const GRAVITY_EPSILON_SQ = 10_000

/** Main engine thrust at 100% throttle (newtons, game units). */
export const MAIN_ENGINE_MAX_THRUST_N = 1300000

/** Angular acceleration scale: rad/s² at 100% RCS torque. */
export const RCS_MAX_ANGULAR_ACCEL = 0.6
