<script setup lang="ts">
import type { TabNote } from '@/types/tab'

const props = defineProps<{
  note: TabNote
  x: number
  y: number
  selected: boolean
  ghost?: boolean
  dragging?: boolean
}>()

const emit = defineEmits<{
  'note-pointer-down': [e: PointerEvent]
  delete: []
}>()

const FONT_SIZE = 16
const opacity = props.ghost ? 0.3 : props.dragging ? 0.35 : 1

function handleKeyDown(e: KeyboardEvent) {
  if ((e.key === 'Delete' || e.key === 'Backspace') && props.selected) {
    emit('delete')
  }
}
</script>

<template>
  <g
    :opacity="opacity"
    class="note-symbol"
    :style="{ cursor: dragging ? 'grabbing' : 'grab' }"
    tabindex="0"
    @pointerdown.stop="emit('note-pointer-down', $event)"
    @keydown="handleKeyDown"
  >
    <!-- Selection ring -->
    <circle
      v-if="selected"
      :cx="x"
      :cy="y"
      r="14"
      fill="none"
      stroke="#34d399"
      stroke-width="1.5"
      filter="url(#glow)"
    />

    <!-- Symbol text (monospace, centered) -->
    <text
      :x="x"
      :y="y"
      text-anchor="middle"
      dominant-baseline="middle"
      :font-size="FONT_SIZE"
      font-family="'JetBrains Mono', 'Fira Code', 'Courier New', monospace"
      :fill="selected ? '#34d399' : '#e2e8f0'"
      style="transition: fill 0.15s ease"
    >
      {{ note.symbol }}
    </text>
  </g>
</template>
