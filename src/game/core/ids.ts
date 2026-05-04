/**
 * Strongly-typed identifiers for compartments, modules, and language mode.
 * Keeps magic numbers out of parsers and event handlers.
 */

/** Compartment index 1..5 (hull sections, doors, bulkheads, etc.). */
export type CompartmentId = 1 | 2 | 3 | 4 | 5

/** Detachable work module index 1..2 (mining / fuel drones, etc.). */
export type ModuleId = 1 | 2

/** Player-facing command language for lexicon and parser tokenization. */
export type CommandLanguage = 'en' | 'ru'
