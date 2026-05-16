import type { Difficulty } from './difficulty'
import { Difficulty as DifficultyIds } from './difficulty'

const RANK: Record<Difficulty, number> = {
  [DifficultyIds.Cadet]: 0,
  [DifficultyIds.Officer]: 1,
  [DifficultyIds.Captain]: 2,
}

/** Numeric order for comparing lobby difficulties (cadet &lt; officer &lt; captain). */
export function difficultyRank(difficulty: Difficulty): number {
  return RANK[difficulty]
}

/** True when `candidate` is strictly harder than `stored`. */
export function isDifficultyHigherThan(
  candidate: Difficulty,
  stored: Difficulty,
): boolean {
  return difficultyRank(candidate) > difficultyRank(stored)
}
