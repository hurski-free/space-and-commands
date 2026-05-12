<template>
  <div class="ship-preview-wrap" role="region" :aria-label="regionAria">
    <canvas ref="canvasRef" class="ship-preview-canvas" :aria-label="canvasAria" />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { drawShipMeshTextured } from '../game/rendering/draw-ship-mesh'
import { DEFAULT_SHIP_MESH, meshLocalToWorldMeters, SHIP_MESH_TEMPLATES } from '../ships'
import { useHullTexture } from '../composables/use-hull-texture'

const props = defineProps<{
  shipMeshId: string
  regionAria: string
  canvasAria: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { texture, textureW, textureH } = useHullTexture(() => props.shipMeshId)

function draw(): void {
  const canvas = canvasRef.value
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

  if (!texture.value) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('No texture', cssW * 0.5, cssH * 0.5)
    ctx.fill()
  } else {
    const mesh = SHIP_MESH_TEMPLATES[props.shipMeshId] ?? DEFAULT_SHIP_MESH
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
      texture.value,
      textureW.value,
      textureH.value,
      0,
      0,
      0,
      (wx, wy) => ({
        x: screenCenterX + (wx - centerX) * scale,
        y: screenCenterY + (wy - centerY) * scale,
      }),
    )
  }
}

watch([() => props.shipMeshId, texture], () => {
  draw()
})

onMounted(() => {
  nextTick(() => draw())
  window.addEventListener('resize', draw)
})

onUnmounted(() => {
  window.removeEventListener('resize', draw)
})
</script>

<style scoped>
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
</style>
