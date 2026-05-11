import type { CompartmentId } from '../core/ids'
import type { ShipState } from '../domain/ship'
import { randomHexColor } from '../math'
import { MIN_PLANET_MASS } from '../procedural/procedural.const'
import type { WorldState } from './world-state'

function createInitialShip(): ShipState {
  const compartments = [1, 2, 3, 4, 5].map((id) => ({
    id: id as CompartmentId,
    activeFault: null,
    repairInProgress: false,
  }))
  return {
    body: {
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      headingRad: 3 * Math.PI / 2,
      angularVelocityRadPerSec: 0,
      massKg: 11_000,
      size: 50,
    },
    mainEngine: { throttlePercent: 0, commandedStop: true, damaged: false },
    rotation: { torquePercent: 0, commandedHold: false, rcsDamaged: false },
    mainFuelLine: { broken: false },
    maneuverFuelLine: { broken: false },
    commsBroken: false,
    compartments,
    cargo: { fuelUnits: 100, metalUnits: 0 },
  }
}

export function createInitialWorld(): WorldState {
  return {
    ship: createInitialShip(),
    planets: [{
      color: randomHexColor(),
      id: 'home-planet',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS,
      positionX: 0,
      positionY: 350,
      radius: 100,
      scanned: false
    }],
    resourceScans: new Map(),
    gameOver: false,
  }
}
