import type { CompartmentId } from '../core/ids'
import { getFuelCapacityTons } from '../domain/fuel-economy'
import type { ShipState } from '../domain/ship'
import { DEFAULT_SHIP_MESH, SHIP_MESH_TEMPLATES } from '../../ships'
import type { LevelConfig } from './level-config'
import { spawnPlanetFromLevel } from './level-config'
import type { WorldState } from './world-state'

function createInitialShip(initialFuelTons: number): ShipState {
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
    planetAttachment: null,
    commsBroken: false,
    compartments,
    cargo: { fuelTons: initialFuelTons, metalUnits: 0 },
  }
}

export function createInitialWorld(shipMeshId: string, level: LevelConfig): WorldState {
  const mesh = SHIP_MESH_TEMPLATES[shipMeshId] ?? DEFAULT_SHIP_MESH
  const capacity = getFuelCapacityTons(mesh)
  const initialFuelTons = capacity * 0.5

  return {
    ship: createInitialShip(initialFuelTons),
    planets: level.planets.map(spawnPlanetFromLevel),
    resourceScans: new Map(),
    gameOver: false,
  }
}
