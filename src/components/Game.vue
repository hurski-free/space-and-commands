<template>
  <div ref="shellRef" class="game-shell" tabindex="-1">
    <header class="game-header">
      <p class="game-meta">
        Language: <strong>{{ languageLabel }}</strong>
        ·
        Difficulty: <strong>{{ difficultyLabel }}</strong>
      </p>
      <div class="header-actions">
        <button type="button" class="sheet-btn" @click="lexiconOpen = true">
          {{ t.commandsBtn }}
        </button>
        <button type="button" class="back-btn" @click="emit('back')">Back to menu</button>
      </div>
    </header>

    <div class="game-stage">
      <div ref="canvasWrapRef" class="canvas-wrap" @click="focusShell">
        <canvas ref="canvasRef" class="game-canvas" aria-label="Space view" />
        <div v-if="gameOver" class="game-over-overlay" role="alert">
          <p class="game-over-title">{{ t.gameOverTitle }}</p>
          <p class="game-over-hint">{{ t.gameOverHint }}</p>
        </div>
      </div>

      <aside class="command-panel">
        <div class="hud">
          <div class="hud-row">
            <span class="hud-label">{{ t.hudSpeed }}</span>
            <span class="hud-val">{{ hud.speed.toFixed(1) }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t.hudDist }}</span>
            <span class="hud-val">{{ Math.round(hud.dist) }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t.hudMain }}</span>
            <span class="hud-val">{{ hud.mainPct }}%</span>
            <span v-if="hud.mainStop" class="hud-tag">{{ t.hudStop }}</span>
          </div>
          <div class="hud-row">
            <span class="hud-label">{{ t.hudRot }}</span>
            <span class="hud-val">{{ hud.torque > 0 ? '+' : '' }}{{ hud.torque }}</span>
          </div>
          <div class="hud-row hud-row--small">
            <span v-if="hud.mainFuelBroken" class="fault">{{ t.faultMainLine }}</span>
            <span v-if="hud.maneuverBroken" class="fault">{{ t.faultManeuver }}</span>
            <span v-if="hud.mainDamaged" class="fault">{{ t.faultMainEng }}</span>
            <span v-if="hud.rcsDamaged" class="fault">{{ t.faultRcs }}</span>
          </div>
          <div class="hud-row hud-row--small">
            <span class="hud-label">{{ t.hudBodies }}</span>
            <span class="hud-val">{{ hud.planetCount }}</span>
          </div>
        </div>

        <div class="command-box">
          <label class="command-label" for="cmd-readonly">{{ t.commandLabel }}</label>
          <div id="cmd-readonly" class="command-line" aria-live="polite" tabindex="0">
            <span class="prompt">&gt;</span>
            <span class="command-text">{{ commandLine }}</span>
            <span class="cursor" :class="{ blink: cursorOn }">▍</span>
          </div>
          <p class="hint">{{ t.hint }}</p>
          <p v-if="feedback" class="feedback" :class="{ ok: feedbackOk, err: !feedbackOk }">{{ feedback }}</p>
        </div>
      </aside>
    </div>

    <Teleport to="body">
      <div
        v-show="lexiconOpen"
        class="lex-overlay"
        role="presentation"
        @click.self="lexiconOpen = false"
      >
        <div
          class="lex-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="t.commandsTitle"
          @click.stop
        >
          <div class="lex-modal-head">
            <h2 class="lex-title">{{ t.commandsTitle }}</h2>
            <button type="button" class="lex-close" :aria-label="t.closeAria" @click="lexiconOpen = false">
              ×
            </button>
          </div>
          <p class="lex-note">{{ t.commandsNote }}</p>
          <ul class="lex-list">
            <li v-for="row in lexiconRows" :key="row.id" class="lex-item">
              <span class="lex-kind">{{ row.kind }}</span>
              <code class="lex-phrase">{{ row.phrase }}</code>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  buildGameRenderModel,
  CanvasGameRenderer,
  createGameSession,
  Difficulty,
} from '../game'
import type { GameConfig, GameSimulator, ParseFailure, ParseResult } from '../game'

const props = defineProps<{
  gameConfig: GameConfig
}>()

const emit = defineEmits<{
  back: []
}>()

const shellRef = ref<HTMLElement | null>(null)
const canvasWrapRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

/** Reactive command buffer (class-based buffer is not tracked by Vue). */
const commandLine = ref('')
const lexiconOpen = ref(false)

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
  mainFuelBroken: false,
  maneuverBroken: false,
  mainDamaged: false,
  rcsDamaged: false,
  planetCount: 0,
})

const feedback = ref('')
const feedbackOk = ref(true)
const cursorOn = ref(true)
const gameOver = ref(false)

let simulator: GameSimulator | null = null
const renderer = new CanvasGameRenderer()

let raf = 0
let acc = 0
/** `null` = wait for next frame before integrating (avoids bogus Δt and tab-switch spikes). */
let lastTs: number | null = null
let renderCtx: CanvasRenderingContext2D | null = null
let animLoopActive = false
let cursorInterval = 0

const isRu = computed(() => props.gameConfig.language === 'ru')

const t = computed(() => {
  const ru = isRu.value
  return {
    hudSpeed: ru ? 'Скорость' : 'Speed',
    hudDist: ru ? 'Дистанция' : 'Distance',
    hudMain: ru ? 'Главный' : 'Main',
    hudStop: ru ? 'СТОП' : 'STOP',
    hudRot: ru ? 'RCS' : 'RCS',
    hudBodies: ru ? 'Тел' : 'Bodies',
    faultMainLine: ru ? 'Магистраль ГД' : 'Main fuel line',
    faultManeuver: ru ? 'Маневр.' : 'Maneuver line',
    faultMainEng: ru ? 'ГД повреждён' : 'Main eng dmg',
    faultRcs: ru ? 'РДМТ' : 'RCS dmg',
    commandLabel: ru ? 'Команда' : 'Command',
    hint: ru
      ? 'Печатайте ниже (клавиатура всегда активна). Enter — отправить. N — число (% или отсек/модуль).'
      : 'Keyboard is always active. Enter to send. N = number (percent or compartment/module).',
    commandsBtn: ru ? 'Команды' : 'Commands',
    commandsTitle: ru ? 'Список фраз' : 'Command phrases',
    commandsNote: ru
      ? 'Те же строки, что в лексиконе. Пробелы и регистр не важны.'
      : 'Same phrases as the game lexicon. Spaces and letter case are ignored.',
    closeAria: ru ? 'Закрыть' : 'Close',
    gameOverTitle: ru ? 'Катастрофа: столкновение с планетой' : 'Hull breach: planetary impact',
    gameOverHint: ru ? 'Симуляция остановлена. Вернитесь в меню.' : 'Simulation halted. Return to the menu.',
  }
})

const difficultyLabel = computed(() => {
  switch (props.gameConfig.difficulty) {
    case Difficulty.Cadet:
      return 'Cadet'
    case Difficulty.Officer:
      return 'Officer'
    case Difficulty.Captain:
      return 'Captain'
    default:
      return props.gameConfig.difficulty
  }
})

const languageLabel = computed(() => (isRu.value ? 'Русский' : 'English'))

function focusShell(): void {
  shellRef.value?.focus()
}

function formatFeedback(result: ParseResult): { text: string; ok: boolean } {
  const ru = isRu.value
  if (result.ok) {
    return { text: ru ? 'Команда принята.' : 'Command acknowledged.', ok: true }
  }
  const fail = result as ParseFailure
  switch (fail.reason) {
    case 'empty':
      return { text: ru ? 'Пустая строка.' : 'Empty input.', ok: false }
    case 'unknown':
      return { text: ru ? 'Неизвестная команда.' : 'Unknown command.', ok: false }
    case 'ambiguous':
      return { text: ru ? 'Неоднозначная фраза.' : 'Ambiguous command.', ok: false }
    case 'too_many_typos':
      return { text: ru ? 'Слишком много опечаток.' : 'Too many typos.', ok: false }
    case 'invalid_number':
      return { text: ru ? 'Нужно число.' : 'Number required.', ok: false }
    case 'out_of_range':
      return { text: ru ? 'Вне диапазона.' : 'Out of range.', ok: false }
    default:
      return { text: fail.message || (ru ? 'Ошибка.' : 'Error.'), ok: false }
  }
}

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
  hud.mainFuelBroken = ship.mainFuelLine.broken
  hud.maneuverBroken = ship.maneuverFuelLine.broken
  hud.mainDamaged = ship.mainEngine.damaged
  hud.rcsDamaged = ship.rotation.rcsDamaged
  hud.planetCount = simulator.getWorld().planets.length
  gameOver.value = simulator.getWorld().gameOver
}

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
        const rect = wrap.getBoundingClientRect()
        const w = Math.max(1, rect.width)
        const h = Math.max(1, rect.height)
        const model = buildGameRenderModel(simulator.getWorld(), w, h)
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

function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    lastTs = null
    nextTick(() => applyCanvasSize())
  }
}

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

  if (e.key === 'Enter') {
    e.preventDefault()
    const line = commandLine.value
    commandLine.value = ''
    const result = simulator.submitCommandLine(line)
    const fb = formatFeedback(result)
    feedback.value = fb.text
    feedbackOk.value = fb.ok
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

onMounted(() => {
  simulator = createGameSession(props.gameConfig).simulator
  animLoopActive = true
  lastTs = null
  renderCtx = null
  window.addEventListener('keydown', onGlobalKeyDown)
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  nextTick(() => {
    applyCanvasSize()
    const wrap = canvasWrapRef.value
    if (wrap && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => applyCanvasSize())
      resizeObserver.observe(wrap)
    }
    shellRef.value?.focus()
  })
  raf = requestAnimationFrame(frame)
  cursorInterval = window.setInterval(() => {
    cursorOn.value = !cursorOn.value
  }, 530)
})

onUnmounted(() => {
  animLoopActive = false
  cancelAnimationFrame(raf)
  window.removeEventListener('keydown', onGlobalKeyDown)
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  resizeObserver?.disconnect()
  resizeObserver = null
  renderCtx = null
  window.clearInterval(cursorInterval)
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

.back-btn {
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

.back-btn:hover {
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

.command-line:focus-visible {
  border-color: color-mix(in srgb, var(--accent-dim) 55%, var(--border));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-dim) 35%, transparent);
}

.prompt {
  color: var(--accent-dim);
  margin-right: 0.35rem;
}

.command-text {
  color: var(--text-h);
}

.cursor {
  color: var(--accent);
  margin-left: 1px;
  animation: none;
}

.cursor.blink {
  opacity: 0.2;
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

.lex-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(4, 8, 14, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
}

.lex-modal {
  width: min(36rem, 100%);
  max-height: min(85vh, 640px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lex-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
}

.lex-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-h);
}

.lex-close {
  width: 2rem;
  height: 2rem;
  padding: 0;
  font-size: 1.35rem;
  line-height: 1;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}

.lex-close:hover {
  color: var(--text-h);
  border-color: var(--border);
}

.lex-note {
  margin: 0;
  padding: 0.65rem 1rem 0;
  font-size: 0.8rem;
  color: var(--muted);
  line-height: 1.35;
}

.lex-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem 1rem 1rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.lex-item {
  display: grid;
  grid-template-columns: minmax(7rem, 32%) 1fr;
  gap: 0.5rem 0.75rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
  font-size: 0.8rem;
  align-items: start;
}

.lex-item:last-child {
  border-bottom: none;
}

.lex-kind {
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  color: var(--muted);
  word-break: break-all;
}

.lex-phrase {
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.78rem;
  color: var(--text-h);
  background: var(--input-bg);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  word-break: break-word;
}
</style>
