/**
 * Web Speech API (SpeechRecognition) — Chromium-first; prefixed in legacy WebKit.
 * Local interfaces: project tsconfig does not expose global SpeechRecognition typings.
 */

interface SpeechRecognitionResultLike {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

export interface SpeechRecognitionEventLike extends Event {
  readonly resultIndex: number
  readonly results: ArrayLike<SpeechRecognitionResultLike>
}

export interface SpeechRecognitionErrorEventLike extends Event {
  readonly error: string
}

export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => void) | null
  onend: ((this: SpeechRecognitionLike, ev: Event) => void) | null
}

export type SpeechRecognitionCtor = new () => SpeechRecognitionLike

export function getSpeechRecognitionConstructor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}
