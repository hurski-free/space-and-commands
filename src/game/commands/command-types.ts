import type { Difficulty } from '../core/difficulty'
import type { CommandLanguage, CompartmentId } from '../core/ids'

/**
 * Canonical commands produced by the parser (language-agnostic).
 * UI / telemetry can map these back to localized echo strings.
 */

export type ParsedCommand =
  | { readonly kind: 'main_engine_set'; readonly percent: number }
  | { readonly kind: 'main_engine_stop' }
  | { readonly kind: 'rotate_left_set'; readonly percent: number }
  | { readonly kind: 'rotate_right_set'; readonly percent: number }
  | { readonly kind: 'rotation_disable' }
  | { readonly kind: 'rotation_stop' }
  | { readonly kind: 'repair_compartment_start'; readonly compartmentId: CompartmentId }
  | { readonly kind: 'repair_compartment_cancel'; readonly compartmentId: CompartmentId }
  | { readonly kind: 'repair_main_engine' }
  | { readonly kind: 'repair_comms' }
  | { readonly kind: 'repair_main_fuel_line' }
  | { readonly kind: 'repair_maneuver_fuel_line' }
  | { readonly kind: 'repair_maneuver_fuel' }
  | { readonly kind: 'scan_nearest_planet_resources' }

export interface ParseContext {
  readonly language: CommandLanguage
  readonly rawText: string
  readonly difficulty: Difficulty
}

interface ParseSuccess {
  readonly ok: true
  readonly command: ParsedCommand
  /** Optional: which lexicon entry matched (for tutorials / hints). */
  readonly matchedTokenId: string | null
}

export interface ParseFailure {
  readonly ok: false
  readonly reason: ParseFailureReason
  readonly message: string
}

type ParseFailureReason =
  | 'empty'
  | 'unknown'
  | 'too_many_typos'
  | 'ambiguous'
  | 'invalid_number'
  | 'out_of_range'

export type ParseResult = ParseSuccess | ParseFailure
