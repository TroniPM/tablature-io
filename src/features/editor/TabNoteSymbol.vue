<script setup lang="ts">
import type { TabNote, NoteSymbol } from '@/types/tab'

const props = defineProps<{
  note: TabNote
  x: number
  y: number
  selected: boolean
  ghost?: boolean
}>()

const emit = defineEmits<{
  click: []
  delete: []
}>()

const FONT_SIZE = 16
const opacity = props.ghost ? 0.3 : 1

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
    style="cursor: pointer"
    tabindex="0"
    @click.stop="emit('click')"
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

  <!-- SVG filter for selected note glow (defined once, re-used) -->
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
</template>
