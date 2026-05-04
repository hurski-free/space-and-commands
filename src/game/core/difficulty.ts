/**
 * Global difficulty affects typo tolerance, event frequency, and time pressure.
 */

export const Difficulty = {
  /** Relaxed typo budget; no random operational hazards. */
  Cadet: 'cadet',
  /** Default balance. */
  Officer: 'officer',
  /** No typos allowed, faster escalation. */
  Captain: 'captain',
} as const

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty]
