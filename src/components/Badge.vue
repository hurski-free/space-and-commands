<template>
  <span
    class="badge"
    :class="`badge--${difficulty}`"
    :style="badgeStyle"
    :title="ariaTitle"
    :aria-label="ariaTitle"
  >
    <span class="badge-check" aria-hidden="true">✓</span>
    <span class="badge-text">{{ difficultyLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Difficulty } from '../game/core/difficulty'

const props = withDefaults(
  defineProps<{
    difficulty: Difficulty
    /** CSS `left` offset from the positioned parent. */
    left?: string
    /** CSS `top` offset from the positioned parent. */
    top?: string
  }>(),
  {
    left: 'calc(100% - 0.65rem)',
    top: '0.45rem',
  },
)

const { t } = useI18n()

const difficultyLabel = computed(() => t(`game.difficultyName.${props.difficulty}`))

const ariaTitle = computed(() =>
  t('main.levelBadgeAria', { difficulty: difficultyLabel.value }),
)

const badgeStyle = computed(() => ({
  left: props.left,
  top: props.top,
}))
</script>

<style scoped>
.badge {
  position: absolute;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  transform: translateX(-100%);
  padding: 0.12rem 0.45rem 0.12rem 0.35rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.2;
  border: 1px solid transparent;
  white-space: nowrap;
  pointer-events: none;
}

.badge-check {
  font-size: 0.62rem;
  opacity: 0.92;
}

.badge--cadet {
  color: #9ed4b8;
  background: color-mix(in srgb, #9ed4b8 14%, transparent);
  border-color: color-mix(in srgb, #9ed4b8 38%, transparent);
}

.badge--officer {
  color: #9ec4e8;
  background: color-mix(in srgb, #9ec4e8 14%, transparent);
  border-color: color-mix(in srgb, #9ec4e8 38%, transparent);
}

.badge--captain {
  color: #e8b89e;
  background: color-mix(in srgb, #e8b89e 14%, transparent);
  border-color: color-mix(in srgb, #e8b89e 40%, transparent);
}
</style>
