/**
 * Collects keystrokes into a line buffer (Enter submits to parser separately).
 */

export interface ICommandInputBuffer {
  readonly currentLine: string

  appendChar(ch: string): void

  backspace(): void

  clear(): void

  /** Called when Enter confirms the line; buffer may clear or keep history. */
  flushLine(): string
}

export class CommandInputBuffer implements ICommandInputBuffer {
  private line = ''

  get currentLine(): string {
    return this.line
  }

  appendChar(ch: string): void {
    if (ch === '' || ch === '\n' || ch === '\r') return
    this.line += ch
  }

  backspace(): void {
    if (this.line.length > 0) {
      this.line = this.line.slice(0, -1)
    }
  }

  clear(): void {
    this.line = ''
  }

  flushLine(): string {
    const out = this.line
    this.line = ''
    return out
  }
}
