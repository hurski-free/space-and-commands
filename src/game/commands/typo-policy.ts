import type { DifficultyTypoConfig } from '../core/difficulty-config'
import { maxTyposForTokenLength } from '../core/difficulty-config'
import { levenshtein } from './text-utils'

/**
 * Pluggable typo tolerance: Levenshtein budget from difficulty config.
 */

export interface TypoPolicyContext {
  readonly typo: DifficultyTypoConfig
}

export interface ITypoPolicy {
  /** Maximum allowed edit distance for a token of given length (0 = exact match only). */
  maxDistanceForToken(tokenLength: number, ctx: TypoPolicyContext): number

  /** Whether two strings match within policy for the current difficulty. */
  isMatch(expected: string, actual: string, ctx: TypoPolicyContext): boolean
}

export class DifficultyTypoPolicy implements ITypoPolicy {
  maxDistanceForToken(tokenLength: number, ctx: TypoPolicyContext): number {
    return maxTyposForTokenLength(tokenLength, ctx.typo)
  }

  isMatch(expected: string, actual: string, ctx: TypoPolicyContext): boolean {
    if (expected === actual) return true
    const n = Math.max(expected.length, actual.length)
    const maxDist = this.maxDistanceForToken(n, ctx)
    if (maxDist === 0) return false
    return levenshtein(expected, actual) <= maxDist
  }
}
