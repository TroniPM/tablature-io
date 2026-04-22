import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRefHistory, useLocalStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import type { TabDocument, TabNote, TabBar, InstrumentId, NoteSymbol, Project } from '@/types/tab'
import { GRID } from '@/types/tab'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createDefaultBars(): TabBar[] {
  return [
    {
      id: uuidv4(),
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      notes: [],
    },
  ]
}

function createDefaultDocument(name = 'Tablatura sem título'): TabDocument {
  return { title: name, bpm: 120, bars: createDefaultBars() }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTabStore = defineStore('tab', () => {
  // ─── Projects list + current ID — persisted via useLocalStorage ───────────
  const projects = useLocalStorage<Project[]>('tablature-io-projects', [])
  const currentProjectId = useLocalStorage<string>('tablature-io-current-project', '')

  // ─── Working document (tracked by useRefHistory for undo / redo) ──────────
  const document = ref<TabDocument>(createDefaultDocument())

  // ─── Undo / Redo ──────────────────────────────────────────────────────────
  const { undo, redo, canUndo, canRedo, clear: clearHistory } = useRefHistory(document, {
    deep: true,
    capacity: 50,
  })

  // ─── Transient editor state ───────────────────────────────────────────────
  const activeInstrument = ref<InstrumentId | null>(null)
  const activeSymbol = ref<NoteSymbol>('x')
  const selectedNoteId = ref<string | null>(null)
  const activeSubdivision = ref<1 | 2 | 4>(2)

  // ─── Playhead state (not persisted) ──────────────────────────────────────
  const isPlaying = ref(false)
  const playheadX = ref<number>(GRID.LABEL_WIDTH)

  // ─── UI state ─────────────────────────────────────────────────────────────
  const showToolbar = useLocalStorage<boolean>('tablature-io-show-toolbar', true)

  // ─── Computed ─────────────────────────────────────────────────────────────
  const allNotes = computed(() => document.value.bars.flatMap((bar) => bar.notes))

  const currentProject = computed(
    () => projects.value.find((p) => p.id === currentProjectId.value) ?? null,
  )

  const sortedProjects = computed(() =>
    [...projects.value].sort((a, b) => b.lastModified - a.lastModified),
  )

  // ─── Auto-save: document changes → write back to projects list ───────────
  watch(
    document,
    () => {
      const idx = projects.value.findIndex((p) => p.id === currentProjectId.value)
      if (idx < 0) return
      projects.value[idx] = {
        ...projects.value[idx],
        name: document.value.title,
        bars: document.value.bars,
        bpm: document.value.bpm,
        lastModified: Date.now(),
      }
    },
    { deep: true },
  )

  // ─── Internal: push a project's data into the working document ────────────
  function _loadProject(project: Project) {
    document.value = {
      title: project.name,
      bpm: project.bpm,
      bars: JSON.parse(JSON.stringify(project.bars)),
    }
    clearHistory()
    selectedNoteId.value = null
    activeInstrument.value = null
  }

  // ─── Project management ───────────────────────────────────────────────────

  function openProject(id: string) {
    const project = projects.value.find((p) => p.id === id)
    if (!project) return
    currentProjectId.value = id
    _loadProject(project)
  }

  function createProject(name?: string): string {
    const id = uuidv4()
    projects.value.push({
      id,
      name: name ?? 'Tablatura sem título',
      bars: createDefaultBars(),
      bpm: 120,
      lastModified: Date.now(),
    })
    openProject(id)
    return id
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter((p) => p.id !== id)
    if (currentProjectId.value === id) {
      if (projects.value.length > 0) {
        const recent = [...projects.value].sort((a, b) => b.lastModified - a.lastModified)[0]
        openProject(recent.id)
      } else {
        createProject()
      }
    }
  }

  function renameCurrentProject(name: string) {
    document.value = { ...document.value, title: name || 'Tablatura sem título' }
  }

  function updateBpm(bpm: number) {
    document.value = { ...document.value, bpm }
  }

  /**
   * Force-saves the current document and refreshes lastModified.
   * Used for explicit "Salvar" user action feedback.
   */
  function forceSave() {
    const idx = projects.value.findIndex((p) => p.id === currentProjectId.value)
    if (idx < 0) return
    projects.value[idx] = {
      ...projects.value[idx],
      name: document.value.title,
      bars: document.value.bars,
      bpm: document.value.bpm,
      lastModified: Date.now(),
    }
  }

  /**
   * Imports a TabDocument JSON payload as a brand-new project (new UUID).
   * Returns true on success, false if data is structurally invalid.
   */
  function importProjectFromJSON(data: unknown): boolean {
    if (typeof data !== 'object' || data === null) return false
    const d = data as Record<string, unknown>
    if (typeof d.title !== 'string' || typeof d.bpm !== 'number' || !Array.isArray(d.bars))
      return false

    const id = uuidv4()
    projects.value.push({
      id,
      name: (d.title as string) || 'Tablatura sem título',
      bars: d.bars as TabBar[],
      bpm: d.bpm as number,
      lastModified: Date.now(),
    })
    openProject(id)
    return true
  }

  // ─── Init: restore last session or bootstrap first project ───────────────
  ;(() => {
    if (projects.value.length === 0) {
      createProject()
      return
    }
    const target = projects.value.find((p) => p.id === currentProjectId.value)
    if (target) {
      _loadProject(target)
    } else {
      const recent = [...projects.value].sort((a, b) => b.lastModified - a.lastModified)[0]
      openProject(recent.id)
    }
  })()

  // ─── Note actions ─────────────────────────────────────────────────────────

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
    document.value = {
      title: document.value.title,
      bpm: document.value.bpm,
      bars: createDefaultBars(),
    }
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
    // working document
    document,
    // transient editor state
    activeInstrument,
    activeSymbol,
    selectedNoteId,
    activeSubdivision,
    isPlaying,
    playheadX,
    showToolbar,
    // projects
    projects,
    currentProjectId,
    currentProject,
    sortedProjects,
    // computed
    allNotes,
    // undo / redo
    undo,
    redo,
    canUndo,
    canRedo,
    // project actions
    openProject,
    createProject,
    deleteProject,
    renameCurrentProject,
    updateBpm,
    forceSave,
    importProjectFromJSON,
    // note actions
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
  // No persist option — projects & currentProjectId are persisted via useLocalStorage.
})
