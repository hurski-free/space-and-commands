import { Difficulty, type Difficulty as DifficultyLevel } from './difficulty'

/** Max Levenshtein distance when token length is at least `minTokenLength`. */
export interface TypoToleranceRule {
  readonly minTokenLength: number
  readonly maxTypos: number
}

export interface DifficultyTypoConfig {
  /** Rules sorted by descending `minTokenLength`; first matching rule wins. */
  readonly rules: readonly TypoToleranceRule[]
}

export interface DifficultyEventConfig {
  /** Per-tick chance to roll a new hazard (0 disables random events). */
  readonly probabilityPerTick: number
  /** Minimum elapsed seconds after the last event before another can fire. */
  readonly minSecondsBetweenEvents: number
}

export interface DifficultyProfile {
  readonly typo: DifficultyTypoConfig
  readonly events: DifficultyEventConfig
}

const CADET_TYPO: DifficultyTypoConfig = {
  rules: [
    { minTokenLength: 14, maxTypos: 2 },
    { minTokenLength: 7, maxTypos: 1 },
    { minTokenLength: 0, maxTypos: 0 },
  ],
}

const OFFICER_TYPO: DifficultyTypoConfig = {
  rules: [
    { minTokenLength: 6, maxTypos: 1 },
    { minTokenLength: 0, maxTypos: 0 },
  ],
}

const EXACT_TYPO: DifficultyTypoConfig = {
  rules: [{ minTokenLength: 0, maxTypos: 0 }],
}

/** Former minimum post-event cooldown: 40 ticks at 60 Hz. */
const EVENT_MIN_GAP_SEC = 40 / 60

const DIFFICULTY_PROFILES: Record<DifficultyLevel, DifficultyProfile> = {
  [Difficulty.Cadet]: {
    typo: CADET_TYPO,
    events: { probabilityPerTick: 0, minSecondsBetweenEvents: 0 },
  },
  [Difficulty.Officer]: {
    typo: OFFICER_TYPO,
    events: { probabilityPerTick: 0.0008, minSecondsBetweenEvents: EVENT_MIN_GAP_SEC },
  },
  [Difficulty.Captain]: {
    typo: EXACT_TYPO,
    events: { probabilityPerTick: 0.0012, minSecondsBetweenEvents: EVENT_MIN_GAP_SEC },
  },
}

export function getDifficultyProfile(difficulty: DifficultyLevel): DifficultyProfile {
  return DIFFICULTY_PROFILES[difficulty]
}

/** Resolve max edit distance for a token of the given length. */
export function maxTyposForTokenLength(
  tokenLength: number,
  config: DifficultyTypoConfig,
): number {
  for (const rule of config.rules) {
    if (tokenLength >= rule.minTokenLength) {
      return rule.maxTypos
    }
  }
  return 0
}
