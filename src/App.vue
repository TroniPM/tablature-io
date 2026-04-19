<script setup lang="ts">
import { ref } from 'vue'
import { useTabStore } from '@/stores/useTabStore'
import TabGrid from '@/features/editor/TabGrid.vue'
import EditorToolbar from '@/features/editor/EditorToolbar.vue'
import { useExport } from '@/features/editor/useExport'
import { usePlayhead } from '@/features/editor/usePlayhead'
import { unlockAudio } from '@/features/editor/useAudioEngine'

const store = useTabStore()

// ─── Export ──────────────────────────────────────────────────────────────────
const tabGridRef = ref<InstanceType<typeof TabGrid> | null>(null)
const { exportPDF, exportImage, isExportingPDF, isExportingImage, exportError, exportJSON, importJSON } = useExport(
  () => tabGridRef.value?.svgRef ?? null,
)

// ─── Playhead ────────────────────────────────────────────────────────────────
const { toggle: togglePlayback } = usePlayhead()

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo() }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); store.redo() }
  if (e.key === ' ') { e.preventDefault(); togglePlayback() }
  if (e.key === 'Escape') { store.clearActiveInstrument(); if (store.isPlaying) togglePlayback() }
  if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNoteId) {
    const barWithNote = store.document.bars.find(b => b.notes.some(n => n.id === store.selectedNoteId))
    if (barWithNote) store.removeNote(barWithNote.id, store.selectedNoteId!)
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-slate-950 text-slate-100 flex flex-col"
    tabindex="-1"
    @keydown="handleKeyDown"
    @pointerdown.once="unlockAudio()"
  >
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-lg font-bold tracking-tight text-slate-100">
          tablature<span class="text-emerald-400">.io</span>
        </span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-slate-500 text-sm font-mono">{{ store.document.title }}</span>
        <span class="text-slate-600 text-sm">{{ store.document.bpm }} BPM</span>
      </div>
    </header>

    <!-- Editor area -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Action bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50">
        <!-- Edit actions -->
        <button
          class="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200
                 border border-slate-800 transition-all duration-200"
          @click="store.addBar()"
        >
          + Add Bar
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200
                 border border-slate-800 transition-all duration-200"
          @click="store.clearAll()"
        >
          Clear All
        </button>

        <div class="w-px h-4 bg-slate-800 mx-1" />

        <!-- JSON import / export -->
        <button
          class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                 text-sky-400 border-sky-900 hover:bg-sky-950 hover:border-sky-700"
          title="Save as .tablature.json"
          @click="exportJSON()"
        >
          ↓ Save JSON
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                 text-sky-400 border-sky-900 hover:bg-sky-950 hover:border-sky-700"
          title="Load a .tablature.json file"
          @click="importJSON()"
        >
          ↑ Load JSON
        </button>

        <div class="w-px h-4 bg-slate-800 mx-1" />

        <!-- Export actions -->
        <button
          :disabled="isExportingPDF"
          class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 text-emerald-400 border-emerald-900 hover:bg-emerald-950 hover:border-emerald-700"
          @click="exportPDF()"
        >
          <span v-if="isExportingPDF">Exporting PDF…</span>
          <span v-else>↓ Export PDF</span>
        </button>
        <button
          :disabled="isExportingImage"
          class="px-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                 disabled:opacity-50 disabled:cursor-not-allowed
                 text-indigo-400 border-indigo-900 hover:bg-indigo-950 hover:border-indigo-700"
          @click="exportImage()"
        >
          <span v-if="isExportingImage">Exporting…</span>
          <span v-else>↓ Export PNG</span>
        </button>

        <!-- Error toast -->
        <span v-if="exportError" class="text-red-400 text-xs ml-2">{{ exportError }}</span>

        <!-- Status hint -->
        <div class="ml-auto flex items-center gap-2 text-xs text-slate-600">
          <span v-if="store.activeInstrument" class="text-emerald-400">
            Stamp: <span class="font-mono font-bold">{{ store.activeInstrument }}</span>
          </span>
          <span v-else class="text-slate-600">Select an instrument or drag a note</span>
          <span class="text-slate-700">|</span>
          <span>
            <kbd class="bg-slate-800 px-1 rounded text-slate-400">Esc</kbd> deselect ·
            <kbd class="bg-slate-800 px-1 rounded text-slate-400">Del</kbd> delete note
          </span>
        </div>
      </div>

      <!-- SVG canvas area -->
      <div class="p-6 overflow-auto h-full">
        <TabGrid ref="tabGridRef" />
      </div>

      <!-- Floating toolbar -->
      <EditorToolbar />
    </main>
  </div>
</template>
