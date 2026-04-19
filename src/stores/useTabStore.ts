import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRefHistory } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import type { TabDocument, TabNote, InstrumentId, NoteSymbol } from '@/types/tab'

const DEFAULT_DOCUMENT: TabDocument = {
  title: 'Untitled Tab',
  bpm: 120,
  bars: [
    {
      id: uuidv4(),
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      notes: [],
    },
  ],
}

export const useTabStore = defineStore(
  'tab',
  () => {
    // ─── State ───────────────────────────────────────────────────────────────
    const document = ref<TabDocument>(structuredClone(DEFAULT_DOCUMENT))

    // ─── Undo / Redo via useRefHistory ───────────────────────────────────────
    const { undo, redo, canUndo, canRedo } = useRefHistory(document, {
      deep: true,
      capacity: 50,
    })

    // ─── Active editor state (not persisted in history) ──────────────────────
    const activeInstrument = ref<InstrumentId | null>(null)
    const activeSymbol = ref<NoteSymbol>('x')
    const selectedNoteId = ref<string | null>(null)
    const activeSubdivision = ref<1 | 2 | 4>(2)

    // ─── Computed ────────────────────────────────────────────────────────────
    const allNotes = computed(() =>
      document.value.bars.flatMap((bar) => bar.notes),
    )

    // ─── Actions ─────────────────────────────────────────────────────────────
    function addNote(barId: string, note: Omit<TabNote, 'id'>) {
      const bar = document.value.bars.find((b) => b.id === barId)
      if (!bar) return
      bar.notes.push({ ...note, id: uuidv4() })
    }

    function removeNote(barId: string, noteId: string) {
      const bar = document.value.bars.find((b) => b.id === barId)
      if (!bar) return
      bar.notes = bar.notes.filter((n) => n.id !== noteId)
      if (selectedNoteId.value === noteId) selectedNoteId.value = null
    }

    function moveNote(
      barId: string,
      noteId: string,
      newTick: number,
      newInstrument: InstrumentId,
    ) {
      const bar = document.value.bars.find((b) => b.id === barId)
      if (!bar) return
      const note = bar.notes.find((n) => n.id === noteId)
      if (!note) return
      note.tick = newTick
      note.instrument = newInstrument
    }

    /** Move a note to a different bar atomically (single undo/redo step). */
    function moveNoteAcrossBar(
      fromBarId: string,
      noteId: string,
      toBarId: string,
      newTick: number,
      newInstrument: InstrumentId,
    ) {
      const fromBar = document.value.bars.find((b) => b.id === fromBarId)
      const toBar = document.value.bars.find((b) => b.id === toBarId)
      if (!fromBar || !toBar) return
      const noteIndex = fromBar.notes.findIndex((n) => n.id === noteId)
      if (noteIndex === -1) return
      const [note] = fromBar.notes.splice(noteIndex, 1)
      note.tick = newTick
      note.instrument = newInstrument
      toBar.notes.push(note)
    }

    function addBar() {
      document.value.bars.push({
        id: uuidv4(),
        timeSignatureNumerator: 4,
        timeSignatureDenominator: 4,
        notes: [],
      })
    }

    function clearAll() {
      document.value = structuredClone(DEFAULT_DOCUMENT)
      selectedNoteId.value = null
    }

    function setActiveInstrument(id: InstrumentId, symbol: NoteSymbol) {
      activeInstrument.value = id
      activeSymbol.value = symbol
    }

    function clearActiveInstrument() {
      activeInstrument.value = null
    }

    function selectNote(id: string | null) {
      selectedNoteId.value = id
    }

    return {
      // state
      document,
      activeInstrument,
      activeSymbol,
      selectedNoteId,
      activeSubdivision,
      // computed
      allNotes,
      // undo/redo
      undo,
      redo,
      canUndo,
      canRedo,
      // actions
      addNote,
      removeNote,
      moveNote,
      moveNoteAcrossBar,
      addBar,
      clearAll,
      setActiveInstrument,
      clearActiveInstrument,
      selectNote,
    }
  },
  {
    persist: {
      key: 'tablature-io-document',
      pick: ['document'],
    },
  },
)
