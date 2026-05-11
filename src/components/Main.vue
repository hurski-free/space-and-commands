<template>
  <main class="main-screen">
    <header class="main-header">
      <h1 class="title">Space &amp; Commands</h1>
      <p class="subtitle">Choose language, ship, and difficulty, then start the run.</p>
    </header>

    <div class="lobby-settings-row">
      <section class="panel panel-compact" aria-labelledby="language-heading">
        <h2 id="language-heading" class="panel-title">Language</h2>
        <ul class="option-list option-list--row" role="radiogroup" aria-label="Command language">
          <li v-for="opt in languageOptions" :key="opt.value" class="option-list-item">
            <label class="difficulty-option">
              <input
                v-model="selectedLanguage"
                type="radio"
                name="command-language"
                :value="opt.value"
                class="sr-only"
              />
              <span class="option-card">
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-hint">{{ opt.hint }}</span>
              </span>
            </label>
          </li>
        </ul>
      </section>

      <section class="panel panel-compact" aria-labelledby="difficulty-heading">
        <h2 id="difficulty-heading" class="panel-title">Difficulty</h2>
        <ul class="option-list option-list--row" role="radiogroup" aria-label="Difficulty">
          <li v-for="opt in options" :key="opt.value" class="option-list-item">
            <label class="difficulty-option">
              <input
                v-model="selected"
                type="radio"
                name="difficulty"
                :value="opt.value"
                class="sr-only"
              />
              <span class="option-card">
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-hint">{{ opt.hint }}</span>
              </span>
            </label>
          </li>
        </ul>
      </section>

      <section class="panel panel-compact panel-ship-pick" aria-labelledby="ship-heading">
        <h2 id="ship-heading" class="panel-title">Ship</h2>
        <ul class="option-list option-list--row" role="radiogroup" aria-label="Ship hull">
          <li v-for="opt in shipOptions" :key="opt.id" class="option-list-item">
            <label class="difficulty-option">
              <input
                v-model="selectedShipId"
                type="radio"
                name="ship-hull"
                :value="opt.id"
                class="sr-only"
              />
              <span class="option-card">
                <span class="option-label">{{ shipLabel(opt.id) }}</span>
                <span class="option-hint">{{ shipHint(opt.id) }}</span>
              </span>
            </label>
          </li>
          <li class="option-list-item" role="presentation">
            <div class="option-card option-card--todo" aria-hidden="true">
              <span class="option-label">TODO</span>
              <span class="option-hint">More hulls</span>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <div class="ship-preview-wrap" role="region" aria-label="Ship preview">
      <canvas ref="shipPreviewCanvasRef" class="ship-preview-canvas" aria-label="Selected ship preview" />
    </div>

    <button type="button" class="start-btn" @click="onStart">Start game</button>
  </main>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { Difficulty } from '../game'
import type { CommandLanguage, GameConfig } from '../game'
import { drawShipMeshTextured } from '../game/rendering/draw-ship-mesh'
import { loadLobbyPreferences, saveLobbyPreferences } from '../preferences-storage'
import {
  DEFAULT_SHIP_MESH,
  loadHullTexture,
  meshLocalToWorldMeters,
  SHIP_HULL_TEXTURE_URLS,
  SHIP_MESH_TEMPLATES,
} from '../ships'

type DifficultyLevel = GameConfig['difficulty']

export interface MainStartPayload {
  readonly difficulty: DifficultyLevel
  readonly language: CommandLanguage
  readonly shipMeshId: string
}

const emit = defineEmits<{
  start: [payload: MainStartPayload]
}>()

const languageOptions: { value: CommandLanguage; label: string; hint: string }[] = [
  {
    value: 'en',
    label: 'English',
    hint: 'Commands typed in English.',
  },
  {
    value: 'ru',
    label: 'Русский',
    hint: 'Команды на русском языке.',
  },
]

const selectedLanguage = ref<CommandLanguage>('en')

const shipOptions = Object.values(SHIP_MESH_TEMPLATES).sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
)

const shipLabels: Record<string, { en: string; ru: string }> = {
  'orca-hauler': {
    en: 'Orca hauler',
    ru: 'Грузовик «Орка»',
  },
}

const shipHints: Record<string, { en: string; ru: string }> = {
  'orca-hauler': {
    en: 'Wide cargo spine; heavier, slower feel.',
    ru: 'Широкий грузовой корпус; ощущение большей массы.',
  },
}

function shipLabel(id: string): string {
  const row = shipLabels[id]
  if (!row) return SHIP_MESH_TEMPLATES[id]?.displayName ?? id
  return selectedLanguage.value === 'ru' ? row.ru : row.en
}

function shipHint(id: string): string {
  const row = shipHints[id]
  if (!row) return ''
  return selectedLanguage.value === 'ru' ? row.ru : row.en
}

const selectedShipId = ref<string>(DEFAULT_SHIP_MESH.id)
const shipPreviewCanvasRef = ref<HTMLCanvasElement | null>(null)
const selectedHullTexture = shallowRef<HTMLImageElement | null>(null)
const selectedHullTextureW = ref(512)
const selectedHullTextureH = ref(512)

const options: { value: DifficultyLevel; label: string; hint: string }[] = [
  {
    value: Difficulty.Cadet,
    label: 'Cadet',
    hint: 'Forgiving typos, no hazards.',
  },
  {
    value: Difficulty.Officer,
    label: 'Officer',
    hint: 'Balanced challenge.',
  },
  {
    value: Difficulty.Captain,
    label: 'Captain',
    hint: 'Exact commands, sharper pressure.',
  },
]

const selected = ref<DifficultyLevel>(Difficulty.Officer)

function drawSelectedShipPreview(): void {
  const canvas = shipPreviewCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const cssW = canvas.clientWidth || 300
  const cssH = canvas.clientHeight || 176
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssW, cssH)

  const mesh = SHIP_MESH_TEMPLATES[selectedShipId.value] ?? DEFAULT_SHIP_MESH
  const verts = mesh.vertices
  const worldVerts = verts.map((v) => meshLocalToWorldMeters(mesh, v.x, v.y))
  const xs = worldVerts.map((p) => p.x)
  const ys = worldVerts.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const meshW = Math.max(1, maxX - minX)
  const meshH = Math.max(1, maxY - minY)

  const pad = 16
  const scale = Math.min((cssW - pad * 2) / meshW, (cssH - pad * 2) / meshH) * 1.08
  const centerX = (minX + maxX) * 0.5
  const centerY = (minY + maxY) * 0.5
  const screenCenterX = cssW * 0.5
  const screenCenterY = cssH * 0.5

  drawShipMeshTextured(
    ctx,
    mesh,
    selectedHullTexture.value,
    selectedHullTextureW.value,
    selectedHullTextureH.value,
    0,
    0,
    0,
    (wx, wy) => ({
      x: screenCenterX + (wx - centerX) * scale,
      y: screenCenterY + (wy - centerY) * scale,
    }),
  )
}

watch(
  () => selectedShipId.value,
  (id, _prev, onCleanup) => {
    const url = SHIP_HULL_TEXTURE_URLS[id]
    if (!url) {
      selectedHullTexture.value = null
      drawSelectedShipPreview()
      return
    }
    let cancelled = false
    onCleanup(() => {
      cancelled = true
    })
    void loadHullTexture(url).then(
      (img) => {
        if (cancelled) return
        selectedHullTexture.value = img
        selectedHullTextureW.value = img.naturalWidth || 512
        selectedHullTextureH.value = img.naturalHeight || 512
        drawSelectedShipPreview()
      },
      () => {
        if (cancelled) return
        selectedHullTexture.value = null
        drawSelectedShipPreview()
      },
    )
  },
  { immediate: true },
)

onMounted(() => {
  const saved = loadLobbyPreferences()
  if (saved.language) selectedLanguage.value = saved.language
  if (saved.difficulty) selected.value = saved.difficulty
  if (saved.shipMeshId && saved.shipMeshId in SHIP_MESH_TEMPLATES) {
    selectedShipId.value = saved.shipMeshId
  }
})

watch([selectedLanguage, selected, selectedShipId], () => {
  saveLobbyPreferences({
    language: selectedLanguage.value,
    difficulty: selected.value,
    shipMeshId: selectedShipId.value,
  })
})

watch([selectedShipId, selectedHullTexture], () => {
  drawSelectedShipPreview()
})

function onStart(): void {
  saveLobbyPreferences({
    language: selectedLanguage.value,
    difficulty: selected.value,
    shipMeshId: selectedShipId.value,
  })
  emit('start', {
    difficulty: selected.value,
    language: selectedLanguage.value,
    shipMeshId: selectedShipId.value,
  })
}

function onWindowResize(): void {
  drawSelectedShipPreview()
}

onMounted(() => {
  nextTick(() => drawSelectedShipPreview())
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
})
</script>

<style scoped>
.main-screen {
  max-width: min(100%, 46rem);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 2rem 1rem 4rem;
}

.lobby-settings-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 0.75rem;
}

.lobby-settings-row .panel-compact {
  flex: 1 1 12rem;
  min-width: 0;
}

.panel-ship-pick {
  flex: 1 1 16rem;
}

.main-header {
  text-align: center;
}

.title {
  margin: 0 0 0.35rem;
  font-size: 1.65rem;
  letter-spacing: -0.02em;
}

.subtitle {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 1.25rem 1.35rem;
}

.panel-compact {
  padding: 1rem 0.85rem 1.1rem;
}

.panel-title {
  margin: 0 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.ship-preview-wrap {
  margin: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #070b14;
  overflow: hidden;
}

.ship-preview-canvas {
  display: block;
  width: 100%;
  height: 12rem;
}

.option-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.option-list--row {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.option-list-item {
  flex: 1 1 auto;
  min-width: 0;
}

.option-list--row .option-list-item {
  flex: 1 1 6.5rem;
}

.difficulty-option {
  display: block;
  cursor: pointer;
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.65rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  min-height: 100%;
  box-sizing: border-box;
}

.option-card--todo {
  opacity: 0.55;
  border-style: dashed;
  cursor: default;
  pointer-events: none;
}

.difficulty-option:hover .option-card {
  border-color: color-mix(in srgb, var(--accent-dim) 35%, var(--border));
}

.difficulty-option input:focus-visible + .option-card {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.difficulty-option input:checked + .option-card {
  border-color: var(--accent-dim);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-dim) 45%, transparent);
}

.option-label {
  font-weight: 600;
  color: var(--text-h);
}

.option-hint {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.3;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.start-btn {
  align-self: center;
  min-width: 12rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--bg);
  background: linear-gradient(165deg, var(--accent) 0%, var(--accent-dim) 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 2px 12px color-mix(in srgb, var(--accent-dim) 28%, transparent);
  transition:
    filter 0.15s ease,
    transform 0.12s ease;
}

.start-btn:hover {
  filter: brightness(1.06);
}

.start-btn:active {
  transform: translateY(1px);
}
</style>
