<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTabStore } from '@/stores/useTabStore'
import TabGrid from '@/features/editor/TabGrid.vue'
import EditorToolbar from '@/features/editor/EditorToolbar.vue'
import TopNavBar from '@/features/editor/TopNavBar.vue'
import HistoryModal from '@/features/editor/HistoryModal.vue'
import { useExport } from '@/features/editor/useExport'
import { usePlayhead } from '@/features/editor/usePlayhead'
import FooterBar from '@/components/FooterBar.vue'

const store = useTabStore()
const { t } = useI18n()

// ─── Export ──────────────────────────────────────────────────────────────────
const tabGridRef = ref<InstanceType<typeof TabGrid> | null>(null)
const { exportPDF, exportImage, exportError, exportJSON, importJSON } = useExport(
  () => tabGridRef.value?.svgRef ?? null,
)

// ─── Playhead ────────────────────────────────────────────────────────────────
const { toggle: togglePlayback } = usePlayhead()

// ─── History modal ────────────────────────────────────────────────────────────
const showHistory = ref(false)

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────
function handleKeyDown(e: KeyboardEvent) {
  // Don't intercept shortcuts while typing in an input
  if ((e.target as HTMLElement).tagName === 'INPUT') return
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); store.undo() }
  if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); store.redo() }
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); store.forceSave() }
  if (e.key === ' ') { e.preventDefault(); togglePlayback() }
  if (e.key === 'Escape') { store.clearActiveInstrument(); if (store.isPlaying) togglePlayback() }
  if ((e.key === 'Delete' || e.key === 'Backspace') && store.selectedNoteId) {
    const barWithNote = store.document.bars.find(b => b.notes.some(n => n.id === store.selectedNoteId))
    if (barWithNote) store.removeNote(barWithNote.id, store.selectedNoteId!)
  }
}
</script>

<template>
  <!-- Top nav bar (fixed, h-9 = 36px) -->
  <TopNavBar
    @open-history="showHistory = true"
    @export-pdf="exportPDF()"
    @export-image="exportImage()"
    @export-json="exportJSON()"
    @import-json="importJSON()"
  />

  <!-- Main editor — offset top by nav height (pt-9) -->
  <div
    class="min-h-screen bg-slate-950 text-slate-100 flex flex-col pt-[4.5rem] lg:pt-9"
    tabindex="-1"
    @keydown="handleKeyDown"
  >
    <!-- Editor area -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Action bar -->
      <div class="flex items-center gap-2 px-4 py-2 border-b border-slate-800/50 flex-wrap">
        <!-- Edit actions -->
        <button
          class="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200
                 border border-slate-800 transition-all duration-200"
          @click="store.addBar()"
        >
          {{ t('editor_view.add_bar') }}
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200
                 border border-slate-800 transition-all duration-200"
          @click="store.clearAll()"
        >
          {{ t('editor_view.clear_all') }}
        </button>

        <!-- Export error -->
        <span v-if="exportError" class="text-red-400 text-xs ml-2">{{ exportError }}</span>

        <!-- Status hint -->
        <div class="ml-auto flex items-center gap-2 text-xs text-slate-600">
          <span v-if="store.activeInstrument" class="text-emerald-400">
            {{ t('editor_view.stamp') }}: <span class="font-mono font-bold">{{ store.activeInstrument }}</span>
          </span>
          <span v-else class="text-slate-600">{{ t('editor_view.hint_idle') }}</span>
          <span class="text-slate-700">|</span>
          <span>
            <kbd class="bg-slate-800 px-1 rounded text-slate-400">Space</kbd> {{ t('editor_view.hint_play') }} ·
            <kbd class="bg-slate-800 px-1 rounded text-slate-400">Del</kbd> {{ t('editor_view.hint_delete') }}
          </span>
        </div>
      </div>

      <!-- SVG canvas area -->
      <div class="p-6 overflow-auto h-full">
        <TabGrid ref="tabGridRef" />
      </div>

      <!-- Floating toolbar (respects showToolbar from store) -->
      <EditorToolbar v-if="store.showToolbar" />
    </main>
    <FooterBar />
  </div>

  <!-- History modal -->
  <HistoryModal v-if="showHistory" @close="showHistory = false" />
</template>
