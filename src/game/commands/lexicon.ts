import type { CommandLanguage } from '../core/ids'
import type { ParsedCommand } from './command-types'

/**
 * Maps each ParsedCommand kind to acceptable phrases per language.
 * Parser depends on this interface (OCP: add languages without changing parser core).
 */

type CommandKindKey = ParsedCommand['kind']

export interface LexiconEntry {
  readonly kind: CommandKindKey
  /** Short stable id for analytics / tutorials. */
  readonly id: string
  /**
   * Phrase stem for matching. Use letter `N` where the parser should read a number
   * (throttle %, compartment 1–5). Multiple rows with the same `kind` are alternates.
   */
  readonly phrase: string
}

export interface ICommandLexicon {
  readonly language: CommandLanguage

  /** All entries for this language (pre-sorted or indexed by implementation). */
  entries(): readonly LexiconEntry[]
}
