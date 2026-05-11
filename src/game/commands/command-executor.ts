import type { ParsedCommand } from './command-types'
import type { WorldState } from '../simulation/world-state'
import type { CompartmentId } from '../core/ids'
import type { PlanetBody } from '../domain/planet'
import { SCAN_MAX_DISTANCE } from '../game.const'
import { clamp } from '../math'

/**
 * Applies validated commands to world state (ship + scans).
 * Single Responsibility: no parsing, no physics integration.
 */

export interface ICommandExecutor {
  apply(world: WorldState, command: ParsedCommand): void
}

function compartmentById(world: WorldState, id: CompartmentId) {
  return world.ship.compartments.find((c) => c.id === id)
}

function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return dx * dx + dy * dy
}

function scanNearestPlanet(shipX: number, shipY: number, planets: readonly PlanetBody[]): PlanetBody | null {
  let best: PlanetBody | null = null;
  let bestD: number = 0;

  for (let i = 0; i < planets.length; i++) {
    const p = planets[i]
    const d = distanceSq(shipX, shipY, p.positionX, p.positionY)

    if ((best === null ||d < bestD) && d < SCAN_MAX_DISTANCE) {
      bestD = d
      best = p
    }
  }

  return best
}

export class ShipCommandExecutor implements ICommandExecutor {
  apply(world: WorldState, command: ParsedCommand): void {
    if (world.gameOver) return
    const ship = world.ship
    switch (command.kind) {
      case 'main_engine_set': {
        ship.mainEngine.commandedStop = false
        ship.mainEngine.throttlePercent = clamp(command.percent, 0, 100)
        break
      }
      case 'main_engine_stop': {
        ship.mainEngine.commandedStop = true
        ship.mainEngine.throttlePercent = 0
        break
      }
      case 'rotate_left_set': {
        ship.rotation.commandedHold = false
        ship.rotation.torquePercent = -clamp(command.percent, 0, 100)
        break
      }
      case 'rotate_right_set': {
        ship.rotation.commandedHold = false
        ship.rotation.torquePercent = clamp(command.percent, 0, 100)
        break
      }
      case 'rotation_disable': {
        ship.rotation.torquePercent = 0
        ship.rotation.commandedHold = true
        break
      }
      case 'rotation_stop': {
        ship.rotation.torquePercent = 0
        ship.rotation.commandedHold = false
        ship.body.angularVelocityRadPerSec = 0
        break
      }
      case 'repair_compartment_start': {
        const c = compartmentById(world, command.compartmentId)
        if (c) c.repairInProgress = true
        break
      }
      case 'repair_compartment_cancel': {
        const c = compartmentById(world, command.compartmentId)
        if (c) c.repairInProgress = false
        break
      }
      case 'repair_main_engine': {
        ship.mainEngine.damaged = false
        break
      }
      case 'repair_comms': {
        ship.commsBroken = false
        break
      }
      case 'repair_main_fuel_line': {
        ship.mainFuelLine.broken = false
        break
      }
      case 'repair_maneuver_fuel_line': {
        ship.maneuverFuelLine.broken = false
        break
      }
      case 'repair_maneuver_fuel': {
        ship.maneuverFuelLine.broken = false
        ship.rotation.rcsDamaged = false
        break
      }
      case 'scan_nearest_planet_resources': {
        const p = scanNearestPlanet(ship.body.position.x, ship.body.position.y, world.planets)
        if (p) {
          world.resourceScans.set(p.id, {
            planetId: p.id,
            hasFuelDeposits: p.hasFuelDeposits,
            hasMetalDeposits: p.hasMetalDeposits,
          })
        }
        break
      }
      default: {
        const _exhaustive: never = command
        void _exhaustive
        break
      }
    }
  }
}
