<template>
  <main class="main-screen">
    <header class="main-header">
      <h1 class="title">Space &amp; Commands</h1>
      <p class="subtitle">Choose command language and difficulty, then start the run.</p>
    </header>

    <section class="panel" aria-labelledby="language-heading">
      <h2 id="language-heading" class="panel-title">Command language</h2>
      <ul class="difficulty-list" role="radiogroup" aria-label="Command language">
        <li v-for="opt in languageOptions" :key="opt.value">
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

    <section class="panel" aria-labelledby="difficulty-heading">
      <h2 id="difficulty-heading" class="panel-title">Difficulty</h2>
      <ul class="difficulty-list" role="radiogroup" aria-label="Difficulty">
        <li v-for="opt in options" :key="opt.value">
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

    <button type="button" class="start-btn" @click="onStart">Start game</button>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Difficulty } from '../game'
import type { CommandLanguage, GameConfig } from '../game'

type DifficultyLevel = GameConfig['difficulty']

export interface MainStartPayload {
  readonly difficulty: DifficultyLevel
  readonly language: CommandLanguage
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

function onStart(): void {
  emit('start', {
    difficulty: selected.value,
    language: selectedLanguage.value,
  })
}
</script>

<style scoped>
.main-screen {
  max-width: 28rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 2rem 0 4rem;
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

.panel-title {
  margin: 0 0 1rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
}

.difficulty-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.difficulty-option {
  display: block;
  cursor: pointer;
}

.option-card {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.75rem 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
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
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.35;
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
