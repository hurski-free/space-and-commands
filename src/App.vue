<template>
  <div class="app-root">
    <Main v-if="screen === 'main'" @start="onStart" />
    <Game v-else-if="sessionGameConfig" :game-config="sessionGameConfig" @back="onBackToMenu" />

    <footer class="dev-contact-badge">
      <span class="dev-contact-label">{{ t('app.devContact') }}</span>
      <a class="dev-contact-mail" href="mailto:hurski.free@gmail.com">hurski.free@gmail.com</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Main from './components/Main.vue'
import type { MainStartPayload } from './components/Main.vue'
import Game from './components/Game.vue'
import { buildGameConfigFromPreset, getLocalePreset } from './game'
import type { GameConfig } from './game'

const { t } = useI18n()

type Screen = 'main' | 'game'

const screen = ref<Screen>('main')
const sessionGameConfig = ref<GameConfig | null>(null)

function onStart(payload: MainStartPayload): void {
  const preset = getLocalePreset(payload.language)
  sessionGameConfig.value = {
    ...buildGameConfigFromPreset(preset, payload.difficulty, payload.levelId),
    shipMeshId: payload.shipMeshId,
  }
  screen.value = 'game'
}

function onBackToMenu(): void {
  screen.value = 'main'
  sessionGameConfig.value = null
}
</script>

<style scoped>
/* Lobby / room UI (shared across components) */
.app-root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 1.5rem;
  box-sizing: border-box;
}

.dev-contact-badge {
  position: fixed;
  bottom: 0.75rem;
  left: 0.75rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  z-index: 10;
  pointer-events: none;
}

.dev-contact-label {
  text-transform: uppercase;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  color: var(--muted);
  opacity: 0.42;
}

.dev-contact-mail {
  pointer-events: auto;
  color: var(--text);
  text-decoration: none;
  opacity: 0.4;
  border-bottom: 1px solid transparent;
}

.dev-contact-mail:hover {
  opacity: 0.92;
  color: var(--accent-dim);
  border-bottom-color: color-mix(in srgb, var(--accent-dim) 45%, transparent);
}
</style>
