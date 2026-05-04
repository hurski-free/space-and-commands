import type { CommandLanguage } from '../core/ids'
import type { ICommandLexicon, LexiconEntry } from './lexicon'

/**
 * Wraps frozen lexicon rows from `GameConfig` for parser consumption.
 */

export class StaticCommandLexicon implements ICommandLexicon {
  readonly language: CommandLanguage
  private readonly rows: readonly LexiconEntry[]

  constructor(language: CommandLanguage, rows: readonly LexiconEntry[]) {
    this.language = language
    this.rows = rows
  }

  entries(): readonly LexiconEntry[] {
    return this.rows
  }
}
