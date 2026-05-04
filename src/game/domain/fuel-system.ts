/**
 * Fuel plumbing to main engine and RCS (rotation / maneuver thrusters).
 * Failures gate thrust even if tanks have fuel.
 */

export interface MainEngineFuelLineState {
  broken: boolean
}

export interface ManeuverFuelLineState {
  broken: boolean
}
