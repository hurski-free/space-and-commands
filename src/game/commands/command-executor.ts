import type { ParsedCommand } from './command-types'
import type { WorldState } from '../simulation/world-state'
import type { CompartmentId, ModuleId } from '../core/ids'
import { ModuleOrderKind } from '../domain/module'
import type { PlanetBody } from '../domain/planet'

/**
 * Applies validated commands to world state (ship + scans + modules).
 * Single Responsibility: no parsing, no physics integration.
 */

export interface ICommandExecutor {
  apply(world: WorldState, command: ParsedCommand): void
}

function compartmentById(world: WorldState, id: CompartmentId) {
  return world.ship.compartments.find((c) => c.id === id)
}

function moduleById(world: WorldState, id: ModuleId) {
  return world.ship.modules.find((m) => m.id === id)
}

function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  return dx * dx + dy * dy
}

function nearestPlanet(shipX: number, shipY: number, planets: readonly PlanetBody[]): PlanetBody | null {
  if (planets.length === 0) return null
  let best = planets[0]
  let bestD = distanceSq(shipX, shipY, best.positionX, best.positionY)
  for (let i = 1; i < planets.length; i++) {
    const p = planets[i]
    const d = distanceSq(shipX, shipY, p.positionX, p.positionY)
    if (d < bestD) {
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
      case 'repair_maneuver_fuel': {
        ship.maneuverFuelLine.broken = false
        ship.rotation.rcsDamaged = false
        break
      }
      case 'module_send_nearest_planet': {
        const m = moduleById(world, command.moduleId)
        if (m?.attached) {
          m.attached = false
          m.currentOrder = ModuleOrderKind.TransitToPlanet
          const p = nearestPlanet(ship.body.position.x, ship.body.position.y, world.planets)
          if (p) {
            m.positionX = p.positionX
            m.positionY = p.positionY
          } else {
            m.positionX = ship.body.position.x + 40
            m.positionY = ship.body.position.y
          }
        }
        break
      }
      case 'module_order_mine_fuel': {
        const m = moduleById(world, command.moduleId)
        if (m && !m.attached) m.currentOrder = ModuleOrderKind.MineFuel
        break
      }
      case 'module_order_mine_metal': {
        const m = moduleById(world, command.moduleId)
        if (m && !m.attached) m.currentOrder = ModuleOrderKind.MineMetal
        break
      }
      case 'module_return': {
        const m = moduleById(world, command.moduleId)
        if (m) {
          m.currentOrder = ModuleOrderKind.Return
          m.attached = true
          m.positionX = ship.body.position.x
          m.positionY = ship.body.position.y
        }
        break
      }
      case 'scan_nearest_planet_resources': {
        const p = nearestPlanet(ship.body.position.x, ship.body.position.y, world.planets)
        if (p) {
          const fuel = p.massKg > 600_000 || hashPlanetId(p.id) % 3 !== 0
          const metal = p.massKg < 1_000_000 || hashPlanetId(p.id) % 2 === 0
          world.resourceScans.set(p.id, {
            planetId: p.id,
            hasFuelDeposits: fuel,
            hasMetalDeposits: metal,
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

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

function hashPlanetId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}
