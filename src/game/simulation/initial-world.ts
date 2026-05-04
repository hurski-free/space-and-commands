import type { CompartmentId } from '../core/ids'
import type { ShipState } from '../domain/ship'
import { ModuleOrderKind } from '../domain/module'
import type { WorldState } from './world-state'

export function createInitialShip(): ShipState {
  const compartments = [1, 2, 3, 4, 5].map((id) => ({
    id: id as CompartmentId,
    activeFault: null,
    repairInProgress: false,
  }))
  return {
    body: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      headingRad: 0,
      angularVelocityRadPerSec: 0,
      massKg: 11_000,
    },
    mainEngine: { throttlePercent: 0, commandedStop: true, damaged: false },
    rotation: { torquePercent: 0, commandedHold: false, rcsDamaged: false },
    mainFuelLine: { broken: false },
    maneuverFuelLine: { broken: false },
    compartments,
    modules: [
      { id: 1, attached: true, currentOrder: ModuleOrderKind.Idle, positionX: 0, positionY: 0 },
      { id: 2, attached: true, currentOrder: ModuleOrderKind.Idle, positionX: 0, positionY: 0 },
    ],
    cargo: { fuelUnits: 100, metalUnits: 0 },
  }
}

export function createInitialWorld(): WorldState {
  return {
    ship: createInitialShip(),
    planets: [],
    resourceScans: new Map(),
    gameOver: false,
  }
}
