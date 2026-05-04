import { Difficulty } from '../core/difficulty'
import { levenshtein } from './text-utils'

/**
 * Pluggable typo tolerance: Levenshtein budget, phonetic rules, etc.
 */

export interface TypoPolicyContext {
  readonly difficulty: Difficulty
}

export interface ITypoPolicy {
  /** Maximum allowed edit distance for a token of given length (0 = exact match only). */
  maxDistanceForToken(tokenLength: number, ctx: TypoPolicyContext): number

  /** Whether two strings match within policy for the current difficulty. */
  isMatch(expected: string, actual: string, ctx: TypoPolicyContext): boolean
}

export class DifficultyTypoPolicy implements ITypoPolicy {
  maxDistanceForToken(tokenLength: number, ctx: TypoPolicyContext): number {
    const d = ctx.difficulty
    if (d === Difficulty.Captain) return 0
    if (d === Difficulty.Cadet) {
      if (tokenLength >= 14) return 2
      if (tokenLength >= 7) return 1
      return 0
    }
    if (d === Difficulty.Officer) {
      return tokenLength >= 6 ? 1 : 0
    }
    return 0
  }

  isMatch(expected: string, actual: string, ctx: TypoPolicyContext): boolean {
    if (expected === actual) return true
    const n = Math.max(expected.length, actual.length)
    const maxDist = this.maxDistanceForToken(n, ctx)
    if (maxDist === 0) return false
    return levenshtein(expected, actual) <= maxDist
  }
}
