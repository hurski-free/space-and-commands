import type { ModuleId } from '../core/ids'

/**
 * Optional detachable modules for planet operations (fuel / metal).
 */

export const ModuleOrderKind = {
  Idle: 'idle',
  MineFuel: 'mine_fuel',
  MineMetal: 'mine_metal',
  Return: 'return',
  /** En route to nearest planet for deployment. */
  TransitToPlanet: 'transit_to_planet',
} as const

export type ModuleOrderKind = (typeof ModuleOrderKind)[keyof typeof ModuleOrderKind]

export interface ModuleState {
  id: ModuleId
  attached: boolean
  currentOrder: ModuleOrderKind
  /** World-space position when detached; ignored when attached. */
  positionX: number
  positionY: number
}
