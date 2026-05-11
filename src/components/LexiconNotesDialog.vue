<template>
  <Teleport to="body">
    <div
      v-show="open"
      class="lex-overlay"
      role="presentation"
      @click.self="close"
    >
      <div
        class="lex-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.stop
      >
        <div class="lex-modal-head">
          <h2 class="lex-title">{{ title }}</h2>
          <button type="button" class="lex-close" :aria-label="closeAria" @click="close">
            ×
          </button>
        </div>
        <p class="lex-note">{{ note }}</p>
        <div class="lex-search">
          <label class="lex-search-label" for="lex-search-input">{{ searchLabel }}</label>
          <input
            id="lex-search-input"
            ref="searchInputRef"
            v-model="searchQuery"
            type="search"
            class="lex-search-input"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            :placeholder="searchPlaceholder"
            :aria-label="searchAriaLabel"
          />
        </div>
        <p v-if="showEmptyHint" class="lex-empty">{{ searchEmpty }}</p>
        <ul v-else class="lex-list">
          <li v-for="group in lexiconGroupedFiltered" :key="group.kind" class="lex-item">
            <span class="lex-kind">{{ group.kind }}</span>
            <div class="lex-phrases">
              <code v-for="e in group.entries" :key="e.id" class="lex-phrase">{{ e.phrase }}</code>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { LexiconEntry } from '../game/commands/lexicon'

const props = withDefaults(
  defineProps<{
    lexiconRows: readonly LexiconEntry[]
    title: string
    note: string
    closeAria: string
    searchLabel?: string
    searchPlaceholder?: string
    searchAriaLabel?: string
    searchEmpty?: string
  }>(),
  {
    searchLabel: 'Search',
    searchPlaceholder: 'Filter by phrase or type…',
    searchAriaLabel: 'Filter command list',
    searchEmpty: 'No matching commands',
  },
)

const open = defineModel<boolean>({ required: true })

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) {
    searchQuery.value = ''
    return
  }
  void nextTick(() => {
    searchInputRef.value?.focus()
  })
})

function normalizeForSearch(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function entryMatches(entry: LexiconEntry, queryRaw: string): boolean {
  const q = normalizeForSearch(queryRaw)
  if (!q) return true
  const blob = normalizeForSearch(`${entry.kind} ${entry.phrase} ${entry.id}`)
  return blob.includes(q)
}

/** One row per `kind`: left column once, right — all phrases for that kind (parent row order). */
const lexiconGrouped = computed(() => {
  const rows = props.lexiconRows
  const kindOrder: string[] = []
  const byKind = new Map<string, LexiconEntry[]>()
  for (const row of rows) {
    if (!byKind.has(row.kind)) {
      byKind.set(row.kind, [])
      kindOrder.push(row.kind)
    }
    byKind.get(row.kind)!.push(row)
  }
  return kindOrder.map((kind) => ({ kind, entries: byKind.get(kind)! }))
})

const lexiconGroupedFiltered = computed(() => {
  const q = searchQuery.value
  if (!normalizeForSearch(q)) return lexiconGrouped.value
  return lexiconGrouped.value
    .map((g) => ({
      kind: g.kind,
      entries: g.entries.filter((e) => entryMatches(e, q)),
    }))
    .filter((g) => g.entries.length > 0)
})

const showEmptyHint = computed(() => {
  if (props.lexiconRows.length === 0) return false
  if (lexiconGroupedFiltered.value.length > 0) return false
  return normalizeForSearch(searchQuery.value) !== ''
})

function close(): void {
  open.value = false
}
</script>

<style scoped>
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
  min-height: min(50vh, 640px);
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

.lex-search {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.65rem 1rem 0;
  flex-shrink: 0;
}

.lex-search-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
}

.lex-search-input {
  width: 100%;
  box-sizing: border-box;
  font-family: ui-monospace, 'Cascadia Code', 'Consolas', monospace;
  font-size: 0.82rem;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-h);
  outline: none;
}

.lex-search-input:focus {
  border-color: color-mix(in srgb, var(--accent-dim) 55%, var(--border));
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent-dim) 35%, transparent);
}

.lex-empty {
  margin: 0;
  padding: 1rem 1rem 1.25rem;
  font-size: 0.82rem;
  color: var(--muted);
  text-align: center;
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

.lex-phrases {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  min-width: 0;
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
