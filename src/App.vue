<script setup lang="ts">
import { useTabStore } from '@/stores/useTabStore'
import TabGrid from '@/features/editor/TabGrid.vue'
import EditorToolbar from '@/features/editor/EditorToolbar.vue'

const store = useTabStore()

function handleKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo() }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); store.redo() }
  if (e.key === 'Escape') store.clearActiveInstrument()
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
  >
    <!-- Header -->
    <header class="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
      <div class="flex items-center gap-3">
        <span class="text-lg font-bold tracking-tight text-slate-100">tablature<span class="text-emerald-400">.io</span></span>
      </div>
      <div class="flex items-center gap-4">
        <span class="text-slate-500 text-sm font-mono">{{ store.document.title }}</span>
        <span class="text-slate-600 text-sm">{{ store.document.bpm }} BPM</span>
      </div>
    </header>

    <!-- Editor area -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Toolbar top bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50">
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
        <div class="ml-auto flex items-center gap-2 text-xs text-slate-600">
          <span v-if="store.activeInstrument" class="text-emerald-400">
            Stamp: <span class="font-mono font-bold">{{ store.activeInstrument }}</span>
          </span>
          <span v-else class="text-slate-600">Select an instrument to begin</span>
          <span class="text-slate-700">|</span>
          <span>Press <kbd class="bg-slate-800 px-1 rounded text-slate-400">Esc</kbd> to deselect</span>
        </div>
      </div>

      <!-- SVG canvas area -->
      <div class="p-6 overflow-auto h-full">
        <TabGrid />
      </div>

      <!-- Floating toolbar -->
      <EditorToolbar />
    </main>
  </div>
</template>
