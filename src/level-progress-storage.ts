import type { Difficulty } from './game/core/difficulty'
import { Difficulty as DifficultyIds } from './game/core/difficulty'
import { isDifficultyHigherThan } from './game/core/difficulty-rank'
import { LEVEL_CONFIGS } from './game/levels'

const STORAGE_KEY = 'space-and-commands:level-completions'

export interface LevelCompletionRecord {
  readonly difficulty: Difficulty
}

export type LevelCompletionsMap = Readonly<Record<string, LevelCompletionRecord>>

const DIFFICULTY_SET = new Set<string>(Object.values(DifficultyIds))

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && DIFFICULTY_SET.has(value)
}

function parseCompletions(raw: unknown): LevelCompletionsMap {
  if (!raw || typeof raw !== 'object') return {}
  const source = raw as Record<string, unknown>
  const out: Record<string, LevelCompletionRecord> = {}
  for (const [levelId, entry] of Object.entries(source)) {
    if (!(levelId in LEVEL_CONFIGS)) continue
    if (!entry || typeof entry !== 'object') continue
    const difficulty = (entry as Record<string, unknown>).difficulty
    if (!isDifficulty(difficulty)) continue
    out[levelId] = { difficulty }
  }
  return out
}

export function loadLevelCompletions(): LevelCompletionsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return parseCompletions(JSON.parse(raw))
  } catch {
    return {}
  }
}

export function getLevelCompletionDifficulty(levelId: string): Difficulty | null {
  return loadLevelCompletions()[levelId]?.difficulty ?? null
}

/**
 * Persist completion at `difficulty` when none exists yet or the new run is harder.
 * Returns whether storage was created or upgraded.
 */
export function recordLevelCompletion(levelId: string, difficulty: Difficulty): boolean {
  if (!(levelId in LEVEL_CONFIGS)) return false

  const all = { ...loadLevelCompletions() }
  const prev = all[levelId]?.difficulty
  if (prev !== undefined && !isDifficultyHigherThan(difficulty, prev)) {
    return false
  }

  all[levelId] = { difficulty }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    return true
  } catch {
    return false
  }
}
