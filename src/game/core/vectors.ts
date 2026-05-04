/**
 * Minimal 2D math types for canvas space and Newtonian integration.
 */

export interface Vector2 {
  readonly x: number
  readonly y: number
}

/** Mutable vector used internally by physics (implementation may clone instead). */
export interface MutableVector2 {
  x: number
  y: number
}
