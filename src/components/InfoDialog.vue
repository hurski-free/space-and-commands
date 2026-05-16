<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="info-overlay"
      role="presentation"
      @click.self="close"
    >
      <div
        class="info-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.stop
      >
        <div class="info-modal-head">
          <h2 class="info-title">{{ title }}</h2>
          <button type="button" class="info-close" :aria-label="closeAria" @click="close">
            ×
          </button>
        </div>
        <div class="info-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  closeAria: string
}>()

const open = defineModel<boolean>({ required: true })

function close(): void {
  open.value = false
}
</script>

<style scoped>
.info-overlay {
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

.info-modal {
  width: min(32rem, 100%);
  max-height: min(88vh, 640px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.info-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.info-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-h);
}

.info-close {
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

.info-close:hover {
  color: var(--text-h);
  border-color: var(--border);
}

.info-body {
  margin: 0;
  padding: 1rem 1.1rem 1.15rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  font-size: 0.88rem;
  line-height: 1.45;
  color: var(--text-h);
}

.info-body :deep(p) {
  margin: 0 0 0.75rem;
  color: color-mix(in srgb, var(--text-h) 92%, var(--muted));
}

.info-body :deep(p:last-child) {
  margin-bottom: 0;
}

.info-body :deep(.info-lead) {
  font-size: 0.92rem;
  color: var(--text-h);
}

.info-body :deep(.info-section-title) {
  margin: 1rem 0 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-dim);
}

.info-body :deep(.info-section-title:first-of-type) {
  margin-top: 0.65rem;
}

.info-body :deep(.info-list) {
  margin: 0 0 0.75rem;
  padding-left: 1.15rem;
  color: color-mix(in srgb, var(--text-h) 92%, var(--muted));
}

.info-body :deep(.info-list li) {
  margin-bottom: 0.35rem;
}

.info-body :deep(.info-list li:last-child) {
  margin-bottom: 0;
}
</style>
