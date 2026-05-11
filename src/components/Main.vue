<template>
  <main class="main-screen">
    <header class="main-header">
      <h1 class="title">{{ t('main.title') }}</h1>
      <p class="subtitle">{{ t('main.subtitle') }}</p>
    </header>

    <div class="lobby-settings-row">
      <section class="panel panel-compact" aria-labelledby="language-heading">
        <div class="language-panel-head">
          <h2 id="language-heading" class="panel-title panel-title--tight">{{ t('main.panelLanguage') }}</h2>
          <button type="button" class="lobby-lex-btn" @click="lexiconOpen = true">
            {{ t('main.commandsBtn') }}
          </button>
        </div>
        <ul class="option-list option-list--row" role="radiogroup" :aria-label="t('main.ariaCommandLanguage')">
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
        <h2 id="difficulty-heading" class="panel-title">{{ t('main.panelDifficulty') }}</h2>
        <ul class="option-list option-list--row" role="radiogroup" :aria-label="t('main.ariaDifficulty')">
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
        <h2 id="ship-heading" class="panel-title">{{ t('main.panelShip') }}</h2>
        <ul class="option-list option-list--row" role="radiogroup" :aria-label="t('main.ariaShipHull')">
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
              <span class="option-label">{{ t('main.shipTodoLabel') }}</span>
              <span class="option-hint">{{ t('main.shipTodoHint') }}</span>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <ShipPreviewLobby
      :ship-mesh-id="selectedShipId"
      :region-aria="t('main.ariaShipPreview')"
      :canvas-aria="t('main.ariaShipPreviewCanvas')"
    />

    <div class="lobby-actions">
      <button type="button" class="info-btn" @click="infoOpen = true">
        {{ t('main.infoBtn') }}
      </button>
      <button type="button" class="start-btn" @click="onStart">{{ t('main.startGame') }}</button>
    </div>

    <InfoDialog v-model="infoOpen" :title="t('main.infoTitle')" :close-aria="t('main.close')">
      <p>{{ t('main.infoLine0') }}</p>
      <p>{{ t('main.infoLine1') }}</p>
      <p>{{ t('main.infoLineVoice') }}</p>
    </InfoDialog>

    <LexiconNotesDialog
      v-model="lexiconOpen"
      :lexicon-rows="lexiconRows"
      :title="t('main.commandsTitle')"
      :note="t('main.commandsNote')"
      :close-aria="t('main.close')"
      :search-label="t('main.lexSearchLabel')"
      :search-placeholder="t('main.lexSearchPlaceholder')"
      :search-aria-label="t('main.lexSearchAria')"
      :search-empty="t('main.lexSearchEmpty')"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Difficulty, getLocalePreset } from '../game'
import type { CommandLanguage, GameConfig } from '../game'
import InfoDialog from './InfoDialog.vue'
import LexiconNotesDialog from './LexiconNotesDialog.vue'
import ShipPreviewLobby from './ShipPreviewLobby.vue'
import { loadLobbyPreferences, saveLobbyPreferences } from '../preferences-storage'
import { DEFAULT_SHIP_MESH, SHIP_MESH_TEMPLATES } from '../ships'

type DifficultyLevel = GameConfig['difficulty']

export interface MainStartPayload {
  readonly difficulty: DifficultyLevel
  readonly language: CommandLanguage
  readonly shipMeshId: string
}

const emit = defineEmits<{
  start: [payload: MainStartPayload]
}>()

const { t, te, locale } = useI18n()

// --- Lobby: command language (drives i18n locale + lexicon preset) ---
const languageCodes: CommandLanguage[] = ['en', 'ru']
const languageOptions = computed(() =>
  languageCodes.map((value) => ({
    value,
    label: t(`main.language.${value}.label`),
    hint: t(`main.language.${value}.hint`),
  })),
)

const selectedLanguage = ref<CommandLanguage>('en')

watch(
  selectedLanguage,
  (lang) => {
    locale.value = lang
  },
  { immediate: true },
)

const lexiconOpen = ref(false)
const infoOpen = ref(false)

// Lexicon rows for the modal: sorted copy of preset for the selected UI language.
const lexiconRows = computed(() =>
  [...getLocalePreset(selectedLanguage.value).lexicon].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.phrase.localeCompare(b.phrase),
  ),
)

// --- Ship hull choice (lobby preview lives in ShipPreviewLobby.vue) ---
const shipOptions = Object.values(SHIP_MESH_TEMPLATES).sort((a, b) =>
  a.displayName.localeCompare(b.displayName),
)

function shipLabel(id: string): string {
  const key = `main.ship.${id}.label`
  return te(key) ? t(key) : SHIP_MESH_TEMPLATES[id]?.displayName ?? id
}

function shipHint(id: string): string {
  const key = `main.ship.${id}.hint`
  return te(key) ? t(key) : ''
}

const selectedShipId = ref<string>(DEFAULT_SHIP_MESH.id)

const difficultyOrder = [Difficulty.Cadet, Difficulty.Officer, Difficulty.Captain] as const

const options = computed(() =>
  difficultyOrder.map((value) => ({
    value,
    label: t(`main.difficulty.${value}.label`),
    hint: t(`main.difficulty.${value}.hint`),
  })),
)

const selected = ref<DifficultyLevel>(Difficulty.Officer)

// Restore last lobby choices; invalid ship id is ignored.
onMounted(() => {
  const saved = loadLobbyPreferences()
  if (saved.language) selectedLanguage.value = saved.language
  if (saved.difficulty) selected.value = saved.difficulty
  if (saved.shipMeshId && saved.shipMeshId in SHIP_MESH_TEMPLATES) {
    selectedShipId.value = saved.shipMeshId
  }
})

// Persist on any change so refresh keeps settings.
watch([selectedLanguage, selected, selectedShipId], () => {
  saveLobbyPreferences({
    language: selectedLanguage.value,
    difficulty: selected.value,
    shipMeshId: selectedShipId.value,
  })
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

.language-panel-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.panel-title {
  margin: 0 0 0.65rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.panel-title--tight {
  margin: 0;
}

.lobby-lex-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-h);
  background: color-mix(in srgb, var(--accent-dim) 22%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent-dim) 40%, var(--border));
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.lobby-lex-btn:hover {
  border-color: var(--accent-dim);
  background: color-mix(in srgb, var(--accent-dim) 30%, var(--surface));
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

.lobby-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  align-self: center;
}

.info-btn {
  min-width: 6.5rem;
  padding: 0.65rem 1rem;
  font-size: 0.88rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--text-h);
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.info-btn:hover {
  border-color: color-mix(in srgb, var(--accent-dim) 45%, var(--border));
  background: color-mix(in srgb, var(--accent-dim) 12%, var(--input-bg));
}

.start-btn {
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
