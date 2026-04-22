<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDraggable, useLocalStorage } from '@vueuse/core'
import { useTabStore } from '@/stores/useTabStore'
import { INSTRUMENT_ROWS, type InstrumentId, type NoteSymbol } from '@/types/tab'
import { usePlayhead } from './usePlayhead'

const store = useTabStore()

// ─── Draggable toolbar position (persisted) ──────────────────────────────────
const toolbarEl = ref<HTMLElement | null>(null)
const handleEl = ref<HTMLElement | null>(null)

const savedPosition = useLocalStorage('tablature-io-toolbar-pos', { x: 24, y: 80 })

const { x, y, isDragging } = useDraggable(toolbarEl, {
  handle: handleEl,
  initialValue: savedPosition.value,
  onEnd(pos) {
    savedPosition.value = { x: pos.x, y: pos.y }
  },
})

const toolbarStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
}))

// ─── Instrument + subdivision buttons ────────────────────────────────────────
const SUBDIVISIONS: { value: 1 | 2 | 4; label: string }[] = [
  { value: 1, label: '♩' },
  { value: 2, label: '♪' },
  { value: 4, label: '𝅘𝅥𝅯' },
]

function selectInstrument(id: InstrumentId, symbol: NoteSymbol) {
  if (store.activeInstrument === id) {
    store.clearActiveInstrument()
  } else {
    store.setActiveInstrument(id, symbol)
  }
}

function setSubdivision(v: 1 | 2 | 4) {
  store.activeSubdivision = v
}

// ─── Playhead ────────────────────────────────────────────────────────
const { toggle: togglePlayback } = usePlayhead()

// ─── Collapsed state (persisted) ────────────────────────────────────────────
const isCollapsed = useLocalStorage('tablature-io-toolbar-collapsed', false)

// Symbol overrides per instrument (cymbal = x, drums = o)
const CYMBAL_IDS: InstrumentId[] = ['CR', 'RD', 'HH']
function defaultSymbol(id: InstrumentId): NoteSymbol {
  return CYMBAL_IDS.includes(id) ? 'x' : 'o'
}
</script>

<template>
  <div
    ref="toolbarEl"
    :style="toolbarStyle"
    class="fixed z-50 flex flex-col gap-3 p-3 rounded-2xl shadow-xl select-none
           bg-slate-900/60 backdrop-blur-md border border-slate-800"
    :class="{ 'cursor-grabbing': isDragging }"
  >
    <!-- Drag handle + collapse toggle -->
    <div
      ref="handleEl"
      class="flex items-center justify-between w-full cursor-grab active:cursor-grabbing"
    >
      <!-- Dots -->
      <div class="flex-1 flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors duration-150">
        <svg width="20" height="8" viewBox="0 0 20 8" fill="currentColor">
          <circle cx="4"  cy="2" r="1.5" />
          <circle cx="10" cy="2" r="1.5" />
          <circle cx="16" cy="2" r="1.5" />
          <circle cx="4"  cy="6" r="1.5" />
          <circle cx="10" cy="6" r="1.5" />
          <circle cx="16" cy="6" r="1.5" />
        </svg>
      </div>
      <!-- Collapse / expand button -->
      <button
        class="ml-1 w-5 h-5 flex items-center justify-center rounded text-slate-600
               hover:text-slate-300 hover:bg-slate-800 transition-all duration-150
               cursor-pointer"
        :title="isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'"
        @click.stop="isCollapsed = !isCollapsed"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
          <template v-if="isCollapsed">
            <!-- chevron down (expand) -->
            <polyline points="2,3 5,7 8,3" />
          </template>
          <template v-else>
            <!-- chevron up (collapse) -->
            <polyline points="2,7 5,3 8,7" />
          </template>
        </svg>
      </button>
    </div>

    <!-- Collapsible body -->
    <template v-if="!isCollapsed">

    <div class="flex flex-col gap-1">
      <p class="text-slate-600 text-xs uppercase tracking-widest mb-1 text-center">Kit</p>
      <button
        v-for="row in INSTRUMENT_ROWS"
        :key="row.id"
        :title="row.label"
        :class="[
          'w-full px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-150',
          store.activeInstrument === row.id
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent',
        ]"
        @click="selectInstrument(row.id, defaultSymbol(row.id))"
      >
        <span class="font-bold tracking-wide">{{ row.id }}</span>
        <span class="text-slate-600 ml-1">{{ row.label }}</span>
      </button>
    </div>

    <!-- Divider -->
    <div class="border-t border-slate-800" />

    <!-- Subdivision selector -->
    <div class="flex flex-col gap-1">
      <p class="text-slate-600 text-xs uppercase tracking-widest mb-1 text-center">Grid</p>
      <div class="flex gap-1 justify-center">
        <button
          v-for="sub in SUBDIVISIONS"
          :key="sub.value"
          :title="`${sub.value === 1 ? 'Quarter' : sub.value === 2 ? 'Eighth' : 'Sixteenth'} notes`"
          :class="[
            'w-8 h-8 rounded-lg text-sm transition-all duration-150',
            store.activeSubdivision === sub.value
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50'
              : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200 border border-transparent',
          ]"
          @click="setSubdivision(sub.value)"
        >
          {{ sub.label }}
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-slate-800" />

    <!-- Play / Stop -->
    <div class="border-t border-slate-800" />
    <div class="flex flex-col gap-1">
      <p class="text-slate-600 text-xs uppercase tracking-widest mb-1 text-center">Transport</p>
      <button
        :class="[
          'w-full px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-150 border',
          store.isPlaying
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 hover:bg-rose-500/30'
            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30',
        ]"
        :title="store.isPlaying ? 'Stop (Space)' : `Play at ${store.document.bpm} BPM`"
        @click="togglePlayback()"
      >
        {{ store.isPlaying ? '⏹ Stop' : '▶ Play' }}
      </button>
      <p class="text-slate-700 text-xs text-center tabular-nums">
        {{ store.document.bpm }} BPM
      </p>
    </div>

    <!-- Add bar / Undo / Redo -->
    <div class="flex flex-col gap-1">
      <button
        class="w-full px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800
               hover:text-slate-200 border border-transparent transition-all duration-150"
        title="Add measure"
        @click="store.addBar()"
      >
        + Bar
      </button>
      <div class="flex gap-1">
        <button
          :disabled="!store.canUndo"
          class="flex-1 py-1.5 rounded-lg text-xs transition-all duration-150
                 border border-transparent disabled:opacity-30 flex flex-col items-center gap-0.5
                 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
          @click="store.undo()"
        >
          <span>↩</span>
          <span>Undo</span>
        </button>
        <button
          :disabled="!store.canRedo"
          class="flex-1 py-1.5 rounded-lg text-xs transition-all duration-150
                 border border-transparent disabled:opacity-30 flex flex-col items-center gap-0.5
                 text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
          @click="store.redo()"
        >
          <span>↪</span>
          <span>Redo</span>
        </button>
      </div>
    </div>
    </template><!-- end collapsible body -->
  </div>
</template>
