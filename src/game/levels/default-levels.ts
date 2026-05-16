import { MIN_PLANET_MASS } from '../procedural/procedural.const'
import { randomHexColor } from '../math'
import type { LevelConfig } from '../simulation/level-config'

/** Home world + procedural rings; no objectives (legacy free play). */
export const sandboxLevel: LevelConfig = {
  id: 'sandbox',
  proceduralPlanetGenerationEnabled: true,
  planets: [
    {
      id: 'home-planet',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS,
      positionX: 0,
      positionY: 2800,
      radius: 100,
      color: randomHexColor(),
    },
  ],
  tasks: [],
}

/** Fixed trio; scan two distinct planets (no procedural spawns). */
export const scanTutorialLevel: LevelConfig = {
  id: 'scan-tutorial',
  proceduralPlanetGenerationEnabled: false,
  planets: [
    {
      id: 'alpha',
      hasFuelDeposits: true,
      hasMetalDeposits: false,
      massKg: MIN_PLANET_MASS,
      positionX: 0,
      positionY: 3200,
      radius: 90,
      color: '#6ec8ff',
    },
    {
      id: 'beta',
      hasFuelDeposits: false,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS * 1.2,
      positionX: 5200,
      positionY: 1400,
      radius: 110,
      color: '#c4a35a',
    },
    {
      id: 'gamma',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS * 0.9,
      positionX: -4800,
      positionY: -4600,
      radius: 75,
      color: '#9b7ede',
    },
  ],
  tasks: [{ kind: 'scan_planets', count: 2 }],
}

/** Land and attach on two worlds (engines off). */
export const visitTutorialLevel: LevelConfig = {
  id: 'visit-tutorial',
  proceduralPlanetGenerationEnabled: false,
  planets: [
    {
      id: 'dock-a',
      hasFuelDeposits: true,
      hasMetalDeposits: false,
      massKg: MIN_PLANET_MASS,
      positionX: 0,
      positionY: 3400,
      radius: 95,
      color: '#58d6a3',
    },
    {
      id: 'dock-b',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS,
      positionX: 5800,
      positionY: -3200,
      radius: 85,
      color: '#e88b5a',
    },
  ],
  tasks: [{ kind: 'visit_planets', count: 2 }],
}

/** Scan one world and visit another. */
export const mixedTutorialLevel: LevelConfig = {
  id: 'mixed-tutorial',
  proceduralPlanetGenerationEnabled: false,
  planets: [
    {
      id: 'relay',
      hasFuelDeposits: true,
      hasMetalDeposits: false,
      massKg: MIN_PLANET_MASS,
      positionX: 0,
      positionY: 3000,
      radius: 100,
      color: '#88b4ff',
    },
    {
      id: 'outpost',
      hasFuelDeposits: false,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS,
      positionX: 5200,
      positionY: 1800,
      radius: 80,
      color: '#d4c07a',
    },
    {
      id: 'beacon',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS * 1.1,
      positionX: -4600,
      positionY: 2800,
      radius: 88,
      color: '#6ed4c8',
    },
    {
      id: 'forge',
      hasFuelDeposits: false,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS * 1.3,
      positionX: 4400,
      positionY: -5000,
      radius: 105,
      color: '#e07a5a',
    },
    {
      id: 'haven',
      hasFuelDeposits: true,
      hasMetalDeposits: false,
      massKg: MIN_PLANET_MASS * 0.95,
      positionX: -5600,
      positionY: -3800,
      radius: 92,
      color: '#7ab86a',
    },
    {
      id: 'nexus',
      hasFuelDeposits: true,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS * 1.15,
      positionX: 7600,
      positionY: 3600,
      radius: 98,
      color: '#b88ae8',
    },
    {
      id: 'fringe',
      hasFuelDeposits: false,
      hasMetalDeposits: true,
      massKg: MIN_PLANET_MASS,
      positionX: -2200,
      positionY: 7400,
      radius: 78,
      color: '#d9a86c',
    },
  ],
  tasks: [
    { kind: 'scan_planets', count: 4 },
    { kind: 'visit_planets', count: 2 },
  ],
}

export const LEVEL_CONFIGS: Readonly<Record<string, LevelConfig>> = {
  [sandboxLevel.id]: sandboxLevel,
  [scanTutorialLevel.id]: scanTutorialLevel,
  [visitTutorialLevel.id]: visitTutorialLevel,
  [mixedTutorialLevel.id]: mixedTutorialLevel,
}

export const DEFAULT_LEVEL_ID = sandboxLevel.id

export function getLevelConfig(levelId: string): LevelConfig {
  return LEVEL_CONFIGS[levelId] ?? sandboxLevel
}
