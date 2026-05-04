import type { MutableVector2 } from '../core/vectors'
import type { Force2 } from './force'

/**
 * Newton's second law: a = F / m. Linear acceleration only in this skeleton.
 */

export interface ILinearAccelerationModel {
  /** Accumulate linear acceleration from net force (mutates out-vector or returns new). */
  applySecondLaw(netForce: Force2, massKg: number, outAccel: MutableVector2): void
}

export class LinearAccelerationModel implements ILinearAccelerationModel {
  applySecondLaw(netForce: Force2, massKg: number, outAccel: MutableVector2): void {
    const m = massKg > 1e-6 ? massKg : 1e-6
    outAccel.x = netForce.fx / m
    outAccel.y = netForce.fy / m
  }
}
