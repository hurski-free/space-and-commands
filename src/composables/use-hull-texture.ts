import type { MaybeRefOrGetter } from 'vue'
import { ref, shallowRef, toValue, watch } from 'vue'
import { loadHullTexture, SHIP_HULL_TEXTURE_URLS } from '../ships'

/**
 * Loads the hull PNG for a mesh id; cancels in-flight fetch when id changes (onCleanup).
 */
export function useHullTexture(meshId: MaybeRefOrGetter<string>) {
  const texture = shallowRef<HTMLImageElement | null>(null)
  const textureW = ref(512)
  const textureH = ref(512)

  watch(
    () => toValue(meshId),
    (id, _prev, onCleanup) => {
      const url = SHIP_HULL_TEXTURE_URLS[id]
      if (!url) {
        texture.value = null
        return
      }
      let cancelled = false
      onCleanup(() => {
        cancelled = true
      })
      void loadHullTexture(url).then(
        (img) => {
          if (cancelled) return
          texture.value = img
          textureW.value = img.naturalWidth || 512
          textureH.value = img.naturalHeight || 512
        },
        () => {
          if (cancelled) return
          texture.value = null
        },
      )
    },
    { immediate: true },
  )

  return { texture, textureW, textureH }
}
