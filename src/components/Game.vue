<template>
  <div ref="shellRef" class="game-shell" tabindex="-1">
    <header class="game-header">
      <p class="game-meta">
        {{ t('game.metaLanguage') }}: <strong>{{ languageLabel }}</strong>
        ·
        {{ t('game.metaDifficulty') }}: <strong>{{ difficultyLabel }}</strong>
        ·
        {{ t('game.metaLevel') }}: <strong>{{ levelLabel }}</strong>
      </p>
      <div class="header-actions">
        <button type="button" class="sheet-btn" @click="lexiconOpen = true">
          {{ t('game.commandsBtn') }}
        </button>
        <button type="button" class="restart-btn" :aria-label="t('game.restartAria')" @click="restartRun">
          {{ t('game.restart') }}
        </button>
        <button type="button" class="back-btn" @click="emit('back')">{{ t('game.backToMenu') }}</button>
      </div>
    </header>

    <div class="game-stage">
      <div ref="canvasWrapRef" class="canvas-wrap" @click="focusShell">
        <canvas ref="canvasRef" class="game-canvas" :aria-label="t('game.canvasAria')" />
        <div v-if="gameOver" class="game-over-overlay" role="alert">
          <p class="game-over-title">{{ t('game.gameOverTitle') }}</p>
          <p class="game-over-hint">{{ t('game.gameOverHint') }}</p>
        </div>
      </div>

      <aside class="command-panel">
        <div class="hud">
          <div class="hud-row">
            <span class="hud-label">{{ t('game.hudSpeed') }}</span>
            <span class="hud-val">{{ hud.speed.toFixed(1) }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t('game.hudDist') }}</span>
            <span class="hud-val">{{ Math.round(hud.dist) }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t('game.hudMain') }}</span>
            <span class="hud-val">{{ hud.mainPct }}%</span>
            <span v-if="hud.mainStop" class="hud-tag">{{ t('game.hudStop') }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t('game.hudRot') }}</span>
            <span class="hud-val">{{ hud.torque > 0 ? '+' : '' }}{{ hud.torque }}</span>
          </div>
          <div class="hud-row hud-row--fuel">
            <span class="hud-label">{{ t('game.hudFuel') }}</span>
            <div class="hud-fuel-block">
              <div
                class="hud-fuel-bar"
                role="progressbar"
                :aria-valuenow="hud.fuelTons"
                :aria-valuemin="0"
                :aria-valuemax="hud.fuelCapacityTons"
                :aria-label="t('game.hudFuelAria')"
              >
                <div class="hud-fuel-fill" :style="{ width: `${hud.fuelFillPct}%` }" />
              </div>
              <span class="hud-fuel-tonnes">{{ hud.fuelLabel }}</span>
            </div>
          </div>
          <div class="hud-row hud-row--small">
            <span v-if="hud.mainFuelBroken" class="fault">{{ t('game.faultMainLine') }}</span>
            <span v-if="hud.maneuverBroken" class="fault">{{ t('game.faultManeuver') }}</span>
            <span v-if="hud.mainDamaged" class="fault">{{ t('game.faultMainEng') }}</span>
            <span v-if="hud.rcsDamaged" class="fault">{{ t('game.faultRcs') }}</span>
            <span v-if="hud.commsBroken" class="fault">{{ t('game.faultComms') }}</span>
          </div>
          <div v-if="hud.levelTasks.length" class="hud-tasks">
            <p class="hud-tasks-title">{{ t('game.hudTasks') }}</p>
            <ul class="hud-tasks-list">
              <li
                v-for="(task, index) in hud.levelTasks"
                :key="`${task.kind}-${index}`"
                class="hud-task"
                :class="{ 'hud-task--done': task.complete }"
              >
                <span class="hud-task-label">{{ taskLabel(task.kind) }}</span>
                <span class="hud-task-progress">{{ task.current }} / {{ task.target }}</span>
              </li>
            </ul>
            <p v-if="hud.levelComplete" class="hud-level-complete">{{ t('game.levelComplete') }}</p>
          </div>
        </div>

        <div class="command-box">
          <div class="input-mode-row" role="radiogroup" :aria-label="t('game.inputModeAria')">
            <button
              type="button"
              class="mode-btn"
              :class="{ 'mode-btn--active': inputMode === 'manual' }"
              role="radio"
              :aria-checked="inputMode === 'manual'"
              @click="inputMode = 'manual'"
            >
              {{ t('game.modeManual') }}
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ 'mode-btn--active': inputMode === 'voice' }"
              role="radio"
              :aria-checked="inputMode === 'voice'"
              :disabled="!voiceModeAllowed"
              :title="voiceModeTitle"
              @click="inputMode = 'voice'"
            >
              {{ t('game.modeVoice') }}
            </button>
          </div>
          <div class="command-head">
            <label class="command-label" for="cmd-input">{{ t('game.commandLabel') }}</label>
          </div>
          <div class="command-line command-line--field" aria-live="polite">
            <span class="prompt" aria-hidden="true">&gt;</span>
            <input
              id="cmd-input"
              ref="commandInputRef"
              v-model="commandLine"
              type="text"
              class="command-input"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              maxlength="400"
              :disabled="gameOver"
              :readonly="inputMode === 'voice'"
              :aria-label="t('game.commandAria')"
              @keydown.enter.prevent="onCommandEnter"
              @keydown.escape.prevent="onCommandEscape"
            />
          </div>
          <p class="hint">{{ commandHint }}</p>
          <p v-if="feedback" class="feedback" :class="{ ok: feedbackOk, err: !feedbackOk }">{{ feedback }}</p>
        </div>
      </aside>
    </div>

    <LexiconNotesDialog
      v-model="lexiconOpen"
      :lexicon-rows="lexiconRows"
      :title="t('game.commandsTitle')"
      :note="t('game.commandsNote')"
      :close-aria="t('game.close')"
      :search-label="t('game.lexSearchLabel')"
      :search-placeholder="t('game.lexSearchPlaceholder')"
      :search-aria-label="t('game.lexSearchAria')"
      :search-empty="t('game.lexSearchEmpty')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { buildGameRenderModel, CanvasGameRenderer, createGameSession } from '../game'
import type { GameConfig, GameSimulator, ParseFailure, ParseResult } from '../game'
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionErrorEventLike,
  type SpeechRecognitionEventLike,
  type SpeechRecognitionLike,
} from '../speech-recognition-support'
import { getFuelCapacityTons } from '../game/domain/fuel-economy'
import { DEFAULT_SHIP_MESH, SHIP_MESH_TEMPLATES } from '../ships'
import { useHullTexture } from '../composables/use-hull-texture'
import LexiconNotesDialog from './LexiconNotesDialog.vue'
import { recordLevelCompletion } from '../level-progress-storage'

const props = defineProps<{
  gameConfig: GameConfig
}>()

const emit = defineEmits<{
  back: []
}>()

const { t, locale } = useI18n()

// Match game command language to UI locale for HUD/dialog strings.
watch(
  () => props.gameConfig.language,
  (lang) => {
    locale.value = lang
  },
  { immediate: true },
)

// --- Template refs (focus shell vs command field; canvas sizing via wrap) ---
const shellRef = ref<HTMLElement | null>(null)
const canvasWrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const commandInputRef = ref<HTMLInputElement | null>(null)

/** Reactive command buffer (class-based buffer is not tracked by Vue). */
const commandLine = ref('')
const lexiconOpen = ref(false)
const speechSupported = ref(false)
const speechListening = ref(false)

/** manual: keyboard + optional mic toggle. voice: hold physical Key K, release to send. */
const inputMode = ref<'manual' | 'voice'>('voice')

let speechRecognition: SpeechRecognitionLike | null = null
/** When recognition ends after `stop()`, optionally submit the command line (push-to-talk). */
let speechEndAction: 'none' | 'submit' = 'none'

// Lexicon for in-run sheet: from session config, stable sort for scanning.
const lexiconRows = computed(() =>
  [...props.gameConfig.lexicon].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.phrase.localeCompare(b.phrase),
  ),
)

const hud = reactive({
  speed: 0,
  dist: 0,
  mainPct: 0,
  mainStop: true,
  torque: 0,
  fuelTons: 0,
  fuelCapacityTons: 0,
  fuelFillPct: 0,
  fuelLabel: '0 / 0 t',
  mainFuelBroken: false,
  maneuverBroken: false,
  mainDamaged: false,
  rcsDamaged: false,
  commsBroken: false,
  planetCount: 0,
  levelTasks: [] as {
    kind: 'scan_planets' | 'visit_planets'
    current: number
    target: number
    complete: boolean
  }[],
  levelComplete: false,
})

// --- Command feedback + game-over (overlay + input disabled) ---
const feedback = ref('')
const feedbackOk = ref(true)
const gameOver = ref(false)

// --- Simulation + render (class instances kept outside Vue reactivity on purpose) ---
let simulator: GameSimulator | null = null
const renderer = new CanvasGameRenderer()

// requestAnimationFrame loop: fixed-step accumulator `acc`, wall clock `lastTs` capped on tab return.
let raf = 0
let acc = 0
/** `null` = wait for next frame before integrating (avoids bogus Δt and tab-switch spikes). */
let lastTs: number | null = null
let renderCtx: CanvasRenderingContext2D | null = null
let animLoopActive = false
/** Avoid writing completion to localStorage on every HUD sync frame. */
let levelCompletionRecorded = false

const sessionShipMesh = computed(
  () => SHIP_MESH_TEMPLATES[props.gameConfig.shipMeshId] ?? DEFAULT_SHIP_MESH,
)

const {
  texture: sessionHullTexture,
  textureW: sessionHullTextureW,
  textureH: sessionHullTextureH,
} = useHullTexture(() => props.gameConfig.shipMeshId)

const commandHint = computed(() =>
  inputMode.value === 'voice' ? t('game.hintVoice') : t('game.hintManual'),
)

const difficultyLabel = computed(() => t(`game.difficultyName.${props.gameConfig.difficulty}`))

const languageLabel = computed(() => t(`game.langName.${props.gameConfig.language}`))

const levelLabel = computed(() => {
  const key = `main.level.${props.gameConfig.level.id}.label`
  return t(key)
})

function taskLabel(kind: 'scan_planets' | 'visit_planets'): string {
  return t(`game.task.${kind}`)
}

const voiceModeAllowed = computed(() => speechSupported.value && !hud.commsBroken)

const voiceModeTitle = computed(() => {
  if (!speechSupported.value) return t('game.voiceUnsupportedHint')
  if (hud.commsBroken) return t('game.voiceBlockedCommsHint')
  return undefined
})

// Click canvas area: focus command input unless game over (then keep focus on shell for a11y).
function focusShell(): void {
  if (gameOver.value) {
    shellRef.value?.focus()
    return
  }
  commandInputRef.value?.focus()
}

function restartRun(): void {
  stopSpeechRecognition()
  lexiconOpen.value = false
  commandLine.value = ''
  feedback.value = ''
  gameOver.value = false
  levelCompletionRecorded = false
  acc = 0
  lastTs = null
  simulator = createGameSession(props.gameConfig).simulator
  syncHud()
  nextTick(() => {
    applyCanvasSize()
    commandInputRef.value?.focus()
  })
}

// --- Web Speech: hold KeyK in voice mode (capture phase), release to stop+submit ---
function stopSpeechRecognition(): void {
  speechEndAction = 'none'
  if (!speechRecognition) return
  try {
    speechRecognition.abort()
  } catch {
    try {
      speechRecognition.stop()
    } catch {
      /* ignore */
    }
  }
  speechRecognition = null
  speechListening.value = false
}

function onRecognitionEnd(): void {
  speechRecognition = null
  speechListening.value = false
  const action = speechEndAction
  speechEndAction = 'none'
  if (action === 'submit') {
    submitCommandLine()
  }
}

watch(gameOver, (over) => {
  if (over) stopSpeechRecognition()
})

watch(inputMode, () => {
  stopSpeechRecognition()
})

watch(speechSupported, (ok) => {
  if (!ok && inputMode.value === 'voice') inputMode.value = 'manual'
})

watch(
  () => hud.commsBroken,
  (broken) => {
    if (broken) {
      inputMode.value = 'manual'
      stopSpeechRecognition()
    }
  },
)

// Wire recognition events: stream transcript into commandLine; map errors to feedback.
function bindSpeechHandlers(
  rec: SpeechRecognitionLike,
  opts: { readonly baseText: string; readonly continuous: boolean },
): void {
  let finals = ''
  rec.lang = props.gameConfig.language === 'ru' ? 'ru-RU' : 'en-US'
  rec.interimResults = true
  rec.continuous = opts.continuous

  rec.onresult = (ev: SpeechRecognitionEventLike) => {
    let interim = ''
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const r = ev.results[i]
      const piece = r[0]?.transcript ?? ''
      if (r.isFinal) finals += piece
      else interim += piece
    }
    commandLine.value = (opts.baseText + finals + interim).slice(0, 400)
  }

  rec.onerror = (ev: SpeechRecognitionErrorEventLike) => {
    speechEndAction = 'none'
    if (ev.error === 'aborted' || ev.error === 'no-speech') {
      return
    }
    if (ev.error === 'not-allowed') {
      feedback.value = t('game.speechMicBlocked')
    } else {
      feedback.value = t('game.speechError')
    }
    feedbackOk.value = false
  }

  rec.onend = () => {
    if (speechRecognition !== rec) return
    onRecognitionEnd()
  }
}

function startHoldVoiceRecognition(): void {
  if (!speechSupported.value || gameOver.value || inputMode.value !== 'voice' || hud.commsBroken) return
  if (speechListening.value) return

  const Ctor = getSpeechRecognitionConstructor()
  if (!Ctor) return

  stopSpeechRecognition()
  speechEndAction = 'none'
  commandLine.value = ''
  feedback.value = ''

  const rec = new Ctor()
  bindSpeechHandlers(rec, { baseText: '', continuous: true })

  try {
    speechRecognition = rec
    rec.start()
    speechListening.value = true
    void commandInputRef.value?.focus()
  } catch {
    speechRecognition = null
    speechListening.value = false
    feedback.value = t('game.speechStartFailed')
    feedbackOk.value = false
  }
}

function finishHoldVoiceRecognition(): void {
  if (inputMode.value !== 'voice' || !speechRecognition) return
  speechEndAction = 'submit'
  try {
    speechRecognition.stop()
  } catch {
    speechEndAction = 'none'
    speechRecognition = null
    speechListening.value = false
  }
}

function onVoiceKeyDownCapture(e: KeyboardEvent): void {
  if (inputMode.value !== 'voice' || !speechSupported.value || hud.commsBroken) return
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (lexiconOpen.value || gameOver.value || !simulator) return
  if (e.code !== 'KeyK' || e.repeat) return
  e.preventDefault()
  startHoldVoiceRecognition()
}

function onVoiceKeyUpCapture(e: KeyboardEvent): void {
  if (inputMode.value !== 'voice') return
  if (e.code !== 'KeyK') return
  e.preventDefault()
  finishHoldVoiceRecognition()
}

// --- Command line: Enter submits in manual mode; Escape clears; simulator parses line ---
function onCommandEnter(): void {
  if (inputMode.value === 'manual') {
    submitCommandLine()
  }
}

function submitCommandLine(): void {
  if (!simulator || gameOver.value) return
  const line = commandLine.value
  commandLine.value = ''
  const result = simulator.submitCommandLine(line)
  const fb = formatFeedback(result)
  feedback.value = fb.text
  feedbackOk.value = fb.ok
}

function onCommandEscape(): void {
  commandLine.value = ''
  feedback.value = ''
}

// Map parser outcomes to localized strings (unknown reason falls back to server message).
function formatFeedback(result: ParseResult): { text: string; ok: boolean } {
  if (result.ok) {
    return { text: t('game.feedback.ok'), ok: true }
  }
  const fail = result as ParseFailure
  switch (fail.reason) {
    case 'empty':
      return { text: t('game.feedback.empty'), ok: false }
    case 'unknown':
      return { text: t('game.feedback.unknown'), ok: false }
    case 'ambiguous':
      return { text: t('game.feedback.ambiguous'), ok: false }
    case 'too_many_typos':
      return { text: t('game.feedback.tooManyTypos'), ok: false }
    case 'invalid_number':
      return { text: t('game.feedback.invalidNumber'), ok: false }
    case 'out_of_range':
      return { text: t('game.feedback.outOfRange'), ok: false }
    default:
      return { text: fail.message || t('game.feedback.generic'), ok: false }
  }
}

// Pull scalar HUD fields from world each frame (after ticks); also mirrors gameOver into Vue.
function syncHud(): void {
  if (!simulator) return
  const ship = simulator.getWorld().ship
  const v = ship.body.velocity
  hud.speed = Math.sqrt(v.x * v.x + v.y * v.y);
  const px = ship.body.position.x
  const py = ship.body.position.y
  hud.dist = Math.sqrt(px * px + py * py)
  hud.mainPct = Math.round(ship.mainEngine.throttlePercent)
  hud.mainStop = ship.mainEngine.commandedStop
  hud.torque = Math.round(ship.rotation.torquePercent)
  const fuelCap = getFuelCapacityTons(sessionShipMesh.value)
  const fuel = ship.cargo.fuelTons
  hud.fuelTons = fuel
  hud.fuelCapacityTons = fuelCap
  hud.fuelFillPct = fuelCap > 0 ? Math.min(100, (fuel / fuelCap) * 100) : 0
  hud.fuelLabel = `${fuel.toFixed(1)} / ${fuelCap.toFixed(0)} t`
  hud.mainFuelBroken = ship.mainFuelLine.broken
  hud.maneuverBroken = ship.maneuverFuelLine.broken
  hud.mainDamaged = ship.mainEngine.damaged
  hud.rcsDamaged = ship.rotation.rcsDamaged
  hud.commsBroken = ship.commsBroken
  hud.planetCount = simulator.getWorld().planets.length
  const progress = simulator.getLevelProgress()
  hud.levelTasks = progress.tasks.map((task) => ({
    kind: task.kind,
    current: task.current,
    target: task.target,
    complete: task.complete,
  }))
  hud.levelComplete = progress.levelComplete
  tryRecordLevelCompletion()
  gameOver.value = simulator.getWorld().gameOver
}

function tryRecordLevelCompletion(): void {
  if (!simulator || levelCompletionRecorded) return
  const { level, difficulty } = props.gameConfig
  if (level.tasks.length === 0) return
  if (!simulator.isLevelComplete()) return
  recordLevelCompletion(level.id, difficulty)
  levelCompletionRecorded = true
}

// Match canvas bitmap size to container × DPR; refresh renderer internal viewport.
function applyCanvasSize(): void {
  const canvas = canvasRef.value
  const wrap = canvasWrapRef.value

  if (!canvas || !wrap) return

  const dpr = window.devicePixelRatio ?? 1
  const rect = wrap.getBoundingClientRect()
  const w = Math.max(1, rect.width)
  const h = Math.max(1, rect.height)
  canvas.width = Math.floor(w * dpr)
  canvas.height = Math.floor(h * dpr)
  canvas.style.width = `${w}px`
  canvas.style.height = `${h}px`
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  renderCtx = ctx
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  renderer.resize(w, h)
}

// One animation frame: cap elapsed time, run fixed dt steps, sync HUD, render if context ready.
function frame(ts: number): void {
  if (!animLoopActive) return

  try {
    if (simulator) {
      if (!renderCtx && canvasRef.value && canvasWrapRef.value) {
        applyCanvasSize()
      }

      if (lastTs === null) {
        lastTs = ts
      }

      // limit time leap when return from another tab/window
      const elapsed = Math.min((ts - lastTs) / 1000, 0.25)
      lastTs = ts

      const dt = props.gameConfig.fixedDeltaTimeSec
      acc += elapsed

      while (acc >= dt) {
        if (!simulator.getWorld().gameOver) {
          simulator.tick(dt)
        }
        acc -= dt
      }

      syncHud()

      const wrap = canvasWrapRef.value
      if (renderCtx && wrap) {
        const model = buildGameRenderModel(
          simulator.getWorld(),
          sessionShipMesh.value,
          sessionHullTexture.value,
          sessionHullTextureW.value,
          sessionHullTextureH.value,
        )
        renderer.render(renderCtx, model)
      }
    }
  } finally {
    if (animLoopActive) {
      raf = requestAnimationFrame(frame)
    }
  }
}

let resizeObserver: ResizeObserver | null = null

function onWindowResize(): void {
  applyCanvasSize()
}

// When tab becomes visible again: reset clock baseline (pairs with elapsed cap in `frame`).
function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    lastTs = null
    nextTick(() => applyCanvasSize())
  }
}

// --- Global key routing: lexicon Escape; manual mode types into commandLine without focusing input ---
function onGlobalKeyDown(e: KeyboardEvent): void {
  if (e.ctrlKey || e.metaKey || e.altKey) return

  const el = e.target
  if (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement
  ) {
    return
  }

  if (lexiconOpen.value) {
    if (e.key === 'Escape') {
      e.preventDefault()
      lexiconOpen.value = false
    }
    return
  }

  if (!simulator) return
  if (gameOver.value) return

  if (inputMode.value === 'voice') {
    if (e.key === 'Escape') {
      e.preventDefault()
      commandLine.value = ''
      feedback.value = ''
    }
    return
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    submitCommandLine()
    return
  }
  if (e.key === 'Backspace') {
    e.preventDefault()
    commandLine.value = commandLine.value.slice(0, -1)
    return
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    commandLine.value = ''
    feedback.value = ''
    return
  }
  if (e.key.length === 1) {
    e.preventDefault()
    if (commandLine.value.length < 400) {
      commandLine.value += e.key
    }
  }
}

// Mount: create session, start RAF, listeners (resize, visibility, capture K for voice).
onMounted(() => {
  speechSupported.value = !!getSpeechRecognitionConstructor()
  levelCompletionRecorded = false
  simulator = createGameSession(props.gameConfig).simulator
  animLoopActive = true
  lastTs = null
  renderCtx = null
  window.addEventListener('keydown', onGlobalKeyDown)
  window.addEventListener('keydown', onVoiceKeyDownCapture, true)
  window.addEventListener('keyup', onVoiceKeyUpCapture, true)
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  nextTick(() => {
    applyCanvasSize()
    const wrap = canvasWrapRef.value
    if (wrap && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => applyCanvasSize())
      resizeObserver.observe(wrap)
    }
    commandInputRef.value?.focus()
  })
  raf = requestAnimationFrame(frame)
})

// Teardown: stop speech, cancel RAF, drop observers and 2D context reference.
onUnmounted(() => {
  stopSpeechRecognition()
  animLoopActive = false
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onGlobalKeyDown)
  window.removeEventListener('keydown', onVoiceKeyDownCapture, true)
  window.removeEventListener('keyup', onVoiceKeyUpCapture, true)
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  resizeObserver?.disconnect()
  resizeObserver = null
  renderCtx = null
})
</script>

<style scoped>
.game-shell {
  width: 90vw;
  height: 90vh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.75rem 0 3rem;
  outline: none;
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.game-shell:focus-visible {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-dim) 45%, transparent);
  border-radius: 12px;
}

.game-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.sheet-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-h);
  background: color-mix(in srgb, var(--accent-dim) 22%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent-dim) 40%, var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.sheet-btn:hover {
  border-color: var(--accent-dim);
  background: color-mix(in srgb, var(--accent-dim) 30%, var(--surface));
}

.game-meta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.game-meta strong {
  color: var(--text-h);
  font-weight: 600;
}

.back-btn,
.restart-btn {
  padding: 0.45rem 0.85rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease;
}

.back-btn:hover,
.restart-btn:hover {
  border-color: color-mix(in srgb, var(--accent-dim) 45%, var(--border));
  color: var(--text-h);
}

.game-stage {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr minmax(16rem, 20rem);
  grid-template-rows: minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

@media (max-width: 840px) {
  .game-stage {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(180px, 38vh) minmax(0, 1fr);
  }
}

.canvas-wrap {
  position: relative;
  min-height: min(42vh, 560px);
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: #05080e;
}

.game-over-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.25rem;
  text-align: center;
  background: color-mix(in srgb, #05080e 78%, transparent);
  pointer-events: none;
}

.game-over-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #f0c0b8;
}

.game-over-hint {
  margin: 0;
  font-size: 0.9rem;
  color: color-mix(in srgb, var(--fg, #e8eaed) 72%, transparent);
  max-width: 22rem;
}

.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  max-height: 100%;
}

.command-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  min-width: 0;
  overflow: auto;
}

.hud {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
}

.hud-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 0.6rem;
  margin-bottom: 0.35rem;
}

.hud-row:last-child {
  margin-bottom: 0;
}

.hud-row--small {
  font-size: 0.76rem;
  color: var(--muted);
}

.hud-tasks {
  margin-top: 0.65rem;
  padding-top: 0.55rem;
  border-top: 1px solid var(--border);
}

.hud-tasks-title {
  margin: 0 0 0.35rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.hud-tasks-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.hud-task {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.hud-task--done {
  color: var(--accent-dim);
}

.hud-task-progress {
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.hud-task--done .hud-task-progress {
  color: inherit;
}

.hud-level-complete {
  margin: 0.45rem 0 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--accent-dim);
}

.hud-label {
  color: var(--muted);
  min-width: 4.5rem;
}

.hud-val {
  color: var(--text-h);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.hud-tag {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--accent-dim);
}

.hud-row--fuel {
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
}

.hud-row--fuel .hud-label {
  min-width: 0;
}

.hud-fuel-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.hud-fuel-bar {
  height: 0.55rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--input-bg) 85%, #000);
  border: 1px solid var(--border);
  overflow: hidden;
}

.hud-fuel-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--accent-dim) 75%, #3a6a4a),
    var(--accent-dim)
  );
  transition: width 0.12s ease-out;
}

.hud-fuel-tonnes {
  font-size: 0.76rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--text-h);
  text-align: right;
}

.fault {
  color: #e8a598;
  margin-right: 0.5rem;
}

.command-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.mode-btn {
  flex: 1;
  min-width: 5rem;
  padding: 0.4rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    color 0.15s ease,
    background 0.15s ease;
}

.mode-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--accent-dim) 35%, var(--border));
  color: var(--text-h);
}

.mode-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.mode-btn--active {
  color: var(--text-h);
  border-color: var(--accent-dim);
  background: color-mix(in srgb, var(--accent-dim) 16%, var(--surface));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-dim) 35%, transparent);
}

.command-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.command-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.command-line {
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.92rem;
  padding: 0.55rem 0.65rem;
  background: var(--input-bg);
  border-radius: 8px;
  border: 1px solid var(--border);
  min-height: 2.25rem;
  word-break: break-word;
  outline: none;
}

.command-line--field {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.command-line--field:focus-within {
  border-color: color-mix(in srgb, var(--accent-dim) 55%, var(--border));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-dim) 35%, transparent);
}

.command-input {
  flex: 1;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: var(--text-h);
  outline: none;
}

.command-input:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.prompt {
  color: var(--accent-dim);
  margin-right: 0.35rem;
}

.hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.4;
}

.feedback {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.35;
}

.feedback.ok {
  color: var(--accent-dim);
}

.feedback.err {
  color: #e8a598;
}
</style>
