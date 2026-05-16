import { Difficulty, type Difficulty as DifficultyLevel } from './game/core/difficulty'
import type { CommandLanguage } from './game/core/ids'
import { LEVEL_CONFIGS } from './game/levels'
import { SHIP_MESH_TEMPLATES } from './ships'

const STORAGE_KEY = 'space-and-commands:lobby'

export interface LobbyPreferences {
  readonly language: CommandLanguage
  readonly difficulty: DifficultyLevel
  readonly shipMeshId: string
  readonly levelId: string
}

const DIFFICULTY_SET = new Set<string>(Object.values(Difficulty))

function isCommandLanguage(value: unknown): value is CommandLanguage {
  return value === 'en' || value === 'ru'
}

function isDifficulty(value: unknown): value is DifficultyLevel {
  return typeof value === 'string' && DIFFICULTY_SET.has(value)
}

function isShipMeshId(value: unknown): value is string {
  return typeof value === 'string' && value in SHIP_MESH_TEMPLATES
}

function isLevelId(value: unknown): value is string {
  return typeof value === 'string' && value in LEVEL_CONFIGS
}

export function loadLobbyPreferences(): Partial<LobbyPreferences> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const o = parsed as Record<string, unknown>
    const out: {
      language?: CommandLanguage
      difficulty?: DifficultyLevel
      shipMeshId?: string
      levelId?: string
    } = {}
    if (isCommandLanguage(o.language)) out.language = o.language
    if (isDifficulty(o.difficulty)) out.difficulty = o.difficulty
    if (isShipMeshId(o.shipMeshId)) out.shipMeshId = o.shipMeshId
    if (isLevelId(o.levelId)) out.levelId = o.levelId
    return out
  } catch {
    return {}
  }
}

export function saveLobbyPreferences(prefs: LobbyPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    /* quota, private mode, disabled storage */
  }
}
