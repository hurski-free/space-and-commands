import type { ITypoPolicy, TypoPolicyContext } from './typo-policy'
import type { ICommandLexicon } from './lexicon'
import type { LexiconEntry } from './lexicon'
import type { ParseContext, ParseResult, ParsedCommand } from './command-types'
import type { CompartmentId } from '../core/ids'
import {
  normalizeCommandInput,
  phraseSkeletonForMatch,
  stripNumbersAndPercent,
  extractFirstNumber,
  levenshtein,
} from './text-utils'

/**
 * Turns buffered player text into structured commands using lexicon + typo policy.
 */

export interface ICommandParser {
  parse(ctx: ParseContext, lexicon: ICommandLexicon, typos: ITypoPolicy): ParseResult
}

interface Candidate {
  readonly score: number
  readonly command: ParsedCommand
  readonly entryId: string
}

/** Stable key for tie-breaking and ambiguity (same payload = same command). */
function parsedCommandKey(cmd: ParsedCommand): string {
  return JSON.stringify(cmd)
}

export class CommandParser implements ICommandParser {
  parse(ctx: ParseContext, lexicon: ICommandLexicon, typos: ITypoPolicy): ParseResult {
    const raw = ctx.rawText
    if (!raw.trim()) {
      return { ok: false, reason: 'empty', message: 'Empty command' }
    }
    const normalized = normalizeCommandInput(raw)
    const typoCtx: TypoPolicyContext = { typo: ctx.typo }

    const candidates: Candidate[] = []
    for (const entry of lexicon.entries()) {
      const c = entry.phrase.includes('N')
        ? this.tryTemplateEntry(entry, normalized, typoCtx, typos)
        : this.tryLiteralEntry(entry, normalized, typoCtx, typos)
      if (c) candidates.push(c)
    }

    if (candidates.length === 0) {
      return { ok: false, reason: 'unknown', message: 'Unknown command' }
    }
    candidates.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score
      return a.entryId.localeCompare(b.entryId)
    })
    const best = candidates[0]
    const tied = candidates.filter((c) => c.score === best.score)
    const distinctOutcomes = new Set(tied.map((c) => parsedCommandKey(c.command)))
    if (distinctOutcomes.size > 1) {
      return { ok: false, reason: 'ambiguous', message: 'Ambiguous command' }
    }
    return { ok: true, command: best.command, matchedTokenId: best.entryId }
  }

  private tryLiteralEntry(
    entry: LexiconEntry,
    normalized: string,
    typoCtx: TypoPolicyContext,
    typos: ITypoPolicy,
  ): Candidate | null {
    const target = normalizeCommandInput(entry.phrase)
    if (!typos.isMatch(target, normalized, typoCtx)) return null
    const cmd = this.commandForLiteralKind(entry.kind)
    if (!cmd) return null
    const score = levenshtein(target, normalized)
    return { score, command: cmd, entryId: entry.id }
  }

  private tryTemplateEntry(
    entry: LexiconEntry,
    normalized: string,
    typoCtx: TypoPolicyContext,
    typos: ITypoPolicy,
  ): Candidate | null {
    const skeleton = phraseSkeletonForMatch(entry.phrase)
    const inputShell = stripNumbersAndPercent(normalized)
    if (!typos.isMatch(skeleton, inputShell, typoCtx)) return null
    const num = extractFirstNumber(normalized)
    if (num === null) return null
    const cmd = this.commandFromNumericKind(entry.kind, num)
    if (!cmd) return null
    const score = levenshtein(skeleton, inputShell) * 4
    return { score, command: cmd, entryId: entry.id }
  }

  private commandForLiteralKind(kind: LexiconEntry['kind']): ParsedCommand | null {
    switch (kind) {
      case 'main_engine_stop':
        return { kind: 'main_engine_stop' }
      case 'rotation_disable':
        return { kind: 'rotation_disable' }
      case 'rotation_stop':
        return { kind: 'rotation_stop' }
      case 'repair_main_engine':
        return { kind: 'repair_main_engine' }
      case 'repair_comms':
        return { kind: 'repair_comms' }
      case 'repair_main_fuel_line':
        return { kind: 'repair_main_fuel_line' }
      case 'repair_maneuver_fuel_line':
        return { kind: 'repair_maneuver_fuel_line' }
      case 'repair_maneuver_fuel':
        return { kind: 'repair_maneuver_fuel' }
      case 'scan_nearest_planet':
        return { kind: 'scan_nearest_planet' }
      default:
        return null
    }
  }

  private commandFromNumericKind(kind: LexiconEntry['kind'], num: number): ParsedCommand | null {
    switch (kind) {
      case 'main_engine_set': {
        if (num < 0 || num > 100) return null
        return { kind: 'main_engine_set', percent: num }
      }
      case 'rotate_left_set': {
        if (num < 0 || num > 100) return null
        return { kind: 'rotate_left_set', percent: num }
      }
      case 'rotate_right_set': {
        if (num < 0 || num > 100) return null
        return { kind: 'rotate_right_set', percent: num }
      }
      case 'repair_compartment_start':
      case 'repair_compartment_cancel': {
        const id = Math.round(num)
        if (id < 1 || id > 5 || Math.abs(id - num) > 1e-6) return null
        const compartmentId = id as CompartmentId
        return kind === 'repair_compartment_start'
          ? { kind: 'repair_compartment_start', compartmentId }
          : { kind: 'repair_compartment_cancel', compartmentId }
      }
      default:
        return null
    }
  }
}
