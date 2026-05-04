/**
 * Normalization and edit distance for command matching.
 */

export function normalizeCommandInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/%/g, ' %')
    .replace(/\s+/g, ' ')
    .replace(/\s+%/g, '%')
    .trim()
}

/** Remove numeric tokens and percent signs for skeleton comparison. */
export function stripNumbersAndPercent(s: string): string {
  return s
    .replace(/\d+(?:[.,]\d+)?/g, ' ')
    .replace(/%/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Lexicon templates use `N` as the numeric slot. */
export function phraseSkeletonForMatch(phrase: string): string {
  return stripNumbersAndPercent(phrase.replace(/N/g, ' '))
}

/** First decimal number in string, or null. */
export function extractFirstNumber(input: string): number | null {
  const m = input.match(/(\d+(?:[.,]\d+)?)/)
  if (!m) return null
  return Number.parseFloat(m[1].replace(',', '.'))
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const row = new Array<number>(n + 1)
  for (let j = 0; j <= n; j++) row[j] = j
  for (let i = 1; i <= m; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return row[n]
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
