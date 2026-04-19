<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTabStore } from '@/stores/useTabStore'
import { INSTRUMENT_ROWS, GRID, type InstrumentId, type NoteSymbol, type TabNote } from '@/types/tab'
import TabNoteSymbol from './TabNoteSymbol.vue'

const store = useTabStore()

// ─── Grid dimensions ─────────────────────────────────────────────────────────
const BEATS_PER_BAR = 4
const NUM_ROWS = INSTRUMENT_ROWS.length

const rowY = (rowIndex: number) =>
  GRID.TOP_PADDING + rowIndex * GRID.ROW_HEIGHT + GRID.ROW_HEIGHT / 2

/** X pixel coordinate for a given bar index + beat + subdivision offset */
function tickX(barIndex: number, beat: number, tickOffset: number): number {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  return barStartX + (beat + tickOffset) * GRID.BEAT_WIDTH
}

/** X pixel for a tick within a bar. tick = beats from bar start. */
function absoluteTickX(barIndex: number, tick: number): number {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  return barStartX + tick * GRID.BEAT_WIDTH
}

const svgWidth = computed(() => {
  const bars = store.document.bars.length
  return GRID.LABEL_WIDTH + bars * BEATS_PER_BAR * GRID.BEAT_WIDTH + 40
})

const svgHeight = computed(
  () => GRID.TOP_PADDING + NUM_ROWS * GRID.ROW_HEIGHT + 20,
)

// ─── SVG element ref (exposed for export) ────────────────────────────────────
const svgRef = ref<SVGSVGElement | null>(null)
defineExpose({ svgRef })

/** clientX/Y and getBoundingClientRect are both in viewport space — exact regardless of scroll. */
function toSVGCoords(e: PointerEvent): { x: number; y: number } {
  const rect = svgRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

// ─── Snap helpers ─────────────────────────────────────────────────────────────
function snapToGrid(svgX: number, svgY: number, barIndex: number) {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  const localX = svgX - barStartX
  const stepSize = GRID.BEAT_WIDTH / store.activeSubdivision
  const snappedBeatFloat = Math.round(localX / stepSize) / store.activeSubdivision
  const maxTick = BEATS_PER_BAR - 1 / store.activeSubdivision
  const clampedTick = Math.max(0, Math.min(snappedBeatFloat, maxTick))

  const rowIndex = Math.round((svgY - GRID.TOP_PADDING - GRID.ROW_HEIGHT / 2) / GRID.ROW_HEIGHT)
  const clampedRow = Math.max(0, Math.min(rowIndex, NUM_ROWS - 1))

  return {
    tick: clampedTick,
    instrument: INSTRUMENT_ROWS[clampedRow].id as InstrumentId,
    snappedX: barStartX + clampedTick * GRID.BEAT_WIDTH,
    snappedY: rowY(clampedRow),
  }
}

function getBarIndexFromX(svgX: number): number {
  const bars = store.document.bars.length
  const idx = Math.floor((svgX - GRID.LABEL_WIDTH) / (BEATS_PER_BAR * GRID.BEAT_WIDTH))
  return Math.max(0, Math.min(idx, bars - 1))
}

// ─── Ghost note (shared by stamp mode + drag mode) ───────────────────────────
const ghostNote = ref<{
  x: number
  y: number
  instrument: InstrumentId
  symbol: NoteSymbol
} | null>(null)

// ─── Drag state ───────────────────────────────────────────────────────────────
interface DragState {
  noteId: string
  barId: string
  barIndex: number
  symbol: NoteSymbol
}
const dragState = ref<DragState | null>(null)

function onNotePointerDown(e: PointerEvent, note: TabNote, barId: string, barIndex: number) {
  // In stamp mode: just select the note (propagation already stopped)
  if (store.activeInstrument) {
    store.selectNote(note.id)
    return
  }
  e.preventDefault()
  store.selectNote(note.id)
  dragState.value = { noteId: note.id, barId, barIndex, symbol: note.symbol }
  // Capture the pointer so pointermove/pointerup fire even outside the SVG
  svgRef.value?.setPointerCapture(e.pointerId)
}

// ─── Pointer handlers on the SVG ─────────────────────────────────────────────
function onPointerMove(e: PointerEvent) {
  const { x, y } = toSVGCoords(e)

  if (dragState.value) {
    const barIndex = getBarIndexFromX(Math.max(GRID.LABEL_WIDTH, x))
    const snapped = snapToGrid(x, y, barIndex)
    ghostNote.value = { x: snapped.snappedX, y: snapped.snappedY, instrument: snapped.instrument, symbol: dragState.value.symbol }
    return
  }

  if (!store.activeInstrument) { ghostNote.value = null; return }
  if (x < GRID.LABEL_WIDTH) { ghostNote.value = null; return }
  const barIndex = getBarIndexFromX(x)
  const snapped = snapToGrid(x, y, barIndex)
  ghostNote.value = { x: snapped.snappedX, y: snapped.snappedY, instrument: snapped.instrument, symbol: store.activeSymbol }
}

function onPointerUp(e: PointerEvent) {
  if (!dragState.value) return
  const { x, y } = toSVGCoords(e)
  ghostNote.value = null

  const svgX = Math.max(GRID.LABEL_WIDTH, x)
  const newBarIndex = getBarIndexFromX(svgX)
  const snapped = snapToGrid(svgX, y, newBarIndex)
  const newBar = store.document.bars[newBarIndex]

  if (!newBar) { dragState.value = null; return }

  if (newBarIndex === dragState.value.barIndex) {
    store.moveNote(dragState.value.barId, dragState.value.noteId, snapped.tick, snapped.instrument)
  } else {
    store.moveNoteAcrossBar(
      dragState.value.barId,
      dragState.value.noteId,
      newBar.id,
      snapped.tick,
      snapped.instrument,
    )
  }

  dragState.value = null
}

function onPointerLeave() {
  if (!dragState.value) ghostNote.value = null
}

function onPointerDown(e: PointerEvent) {
  // Only stamp mode — note pointerdown stops propagation, so this only fires on empty grid areas
  if (!store.activeInstrument) return
  e.preventDefault()
  const { x, y } = toSVGCoords(e)
  if (x < GRID.LABEL_WIDTH) return
  const barIndex = getBarIndexFromX(x)
  const snapped = snapToGrid(x, y, barIndex)
  const bar = store.document.bars[barIndex]
  if (!bar) return

  const exists = bar.notes.find(
    (n) => n.instrument === snapped.instrument && Math.abs(n.tick - snapped.tick) < 0.001,
  )
  if (exists) { store.selectNote(exists.id); return }

  store.addNote(bar.id, {
    instrument: snapped.instrument,
    tick: snapped.tick,
    symbol: store.activeSymbol,
  })
}

const cursorStyle = computed(() => {
  if (dragState.value) return 'grabbing'
  if (store.activeInstrument) return 'crosshair'
  return 'default'
})
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      ref="svgRef"
      :width="svgWidth"
      :height="svgHeight"
      class="select-none"
      :style="{ cursor: cursorStyle }"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerLeave"
      @pointerdown="onPointerDown"
    >
      <!-- ── Instrument labels (Y-axis) ──────────────────────────────────── -->
      <g>
        <text
          v-for="(row, i) in INSTRUMENT_ROWS"
          :key="row.id"
          :x="GRID.LABEL_WIDTH - 8"
          :y="rowY(i)"
          text-anchor="end"
          dominant-baseline="middle"
          fill="#94a3b8"
          font-size="11"
          font-family="'JetBrains Mono', 'Fira Code', monospace"
        >
          {{ row.label }}
        </text>
      </g>

      <!-- ── Row guide lines (horizontal) ───────────────────────────────── -->
      <g>
        <line
          v-for="(row, i) in INSTRUMENT_ROWS"
          :key="`hline-${row.id}`"
          :x1="GRID.LABEL_WIDTH"
          :y1="rowY(i)"
          :x2="svgWidth - 20"
          :y2="rowY(i)"
          stroke="#334155"
          stroke-width="1"
        />
      </g>

      <!-- ── Bars ────────────────────────────────────────────────────────── -->
      <g
        v-for="(bar, barIndex) in store.document.bars"
        :key="`bar-${bar.id}`"
      >
        <!-- Bar boundary -->
        <line
          :x1="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH"
          :y1="GRID.TOP_PADDING"
          :x2="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH"
          :y2="svgHeight - 20"
          stroke="#475569"
          stroke-width="1.5"
        />

        <!-- Beat and subdivision lines -->
        <g v-for="beat in BEATS_PER_BAR" :key="`beat-${barIndex}-${beat}`">
          <line
            v-if="beat > 1"
            :x1="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + (beat - 1) * GRID.BEAT_WIDTH"
            :y1="GRID.TOP_PADDING"
            :x2="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + (beat - 1) * GRID.BEAT_WIDTH"
            :y2="svgHeight - 20"
            stroke="#475569"
            stroke-width="1"
          />
          <line
            v-for="sub in store.activeSubdivision - 1"
            :key="`sub-${barIndex}-${beat}-${sub}`"
            :x1="tickX(barIndex, beat - 1, sub / store.activeSubdivision)"
            :y1="GRID.TOP_PADDING"
            :x2="tickX(barIndex, beat - 1, sub / store.activeSubdivision)"
            :y2="svgHeight - 20"
            stroke="#1e293b"
            stroke-width="1"
            stroke-dasharray="4 3"
          />
        </g>

        <!-- Bar number -->
        <text
          :x="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + 4"
          :y="GRID.TOP_PADDING - 4"
          font-size="10"
          fill="#475569"
        >
          {{ barIndex + 1 }}
        </text>

        <!-- Notes -->
        <TabNoteSymbol
          v-for="note in bar.notes"
          :key="note.id"
          :note="note"
          :x="absoluteTickX(barIndex, note.tick)"
          :y="rowY(INSTRUMENT_ROWS.findIndex((r) => r.id === note.instrument))"
          :selected="store.selectedNoteId === note.id"
          :dragging="dragState?.noteId === note.id"
          @note-pointer-down="onNotePointerDown($event, note, bar.id, barIndex)"
          @delete="store.removeNote(bar.id, note.id)"
        />
      </g>

      <!-- Closing bar line -->
      <line
        :x1="GRID.LABEL_WIDTH + store.document.bars.length * BEATS_PER_BAR * GRID.BEAT_WIDTH"
        :y1="GRID.TOP_PADDING"
        :x2="GRID.LABEL_WIDTH + store.document.bars.length * BEATS_PER_BAR * GRID.BEAT_WIDTH"
        :y2="svgHeight - 20"
        stroke="#475569"
        stroke-width="1.5"
      />

      <!-- ── Ghost note (stamp preview + drag preview) ───────────────────── -->
      <TabNoteSymbol
        v-if="ghostNote && (store.activeInstrument || dragState)"
        :note="{
          id: '__ghost__',
          instrument: ghostNote.instrument,
          tick: 0,
          symbol: ghostNote.symbol,
        }"
        :x="ghostNote.x"
        :y="ghostNote.y"
        :ghost="true"
        :selected="false"
      />

      <!-- SVG filter for selection glow -->
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  </div>
</template>

