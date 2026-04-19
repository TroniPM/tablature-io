<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTabStore } from '@/stores/useTabStore'
import { INSTRUMENT_ROWS, GRID, type InstrumentId } from '@/types/tab'
import TabNoteSymbol from './TabNoteSymbol.vue'

const store = useTabStore()

// ─── Grid dimensions ─────────────────────────────────────────────────────────
const BEATS_PER_BAR = 4
const NUM_ROWS = INSTRUMENT_ROWS.length

const rowY = (rowIndex: number) =>
  GRID.TOP_PADDING + rowIndex * GRID.ROW_HEIGHT + GRID.ROW_HEIGHT / 2

/** All subdivision tick offsets within one beat, based on active subdivision */
const subdivisionTicks = computed(() => {
  const ticks: number[] = []
  const steps = store.activeSubdivision
  for (let s = 0; s < steps; s++) {
    ticks.push(s / steps)
  }
  return ticks
})

/** X pixel coordinate for a given bar index + beat + tick-within-beat */
function tickX(barIndex: number, beat: number, tickOffset: number): number {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  return barStartX + (beat + tickOffset) * GRID.BEAT_WIDTH
}

/** X pixel for absolute tick within a bar */
function absoluteTickX(barIndex: number, tick: number): number {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  return barStartX + tick * BEATS_PER_BAR * GRID.BEAT_WIDTH
}

const svgWidth = computed(() => {
  const bars = store.document.bars.length
  return GRID.LABEL_WIDTH + bars * BEATS_PER_BAR * GRID.BEAT_WIDTH + 40
})

const svgHeight = computed(
  () => GRID.TOP_PADDING + NUM_ROWS * GRID.ROW_HEIGHT + 20,
)

// ─── Ghost note (snapping preview) ───────────────────────────────────────────
const ghostNote = ref<{ x: number; y: number; instrument: InstrumentId } | null>(null)

function snapToGrid(svgX: number, svgY: number, barIndex: number) {
  const barStartX = GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH
  const localX = svgX - barStartX
  const totalBeats = BEATS_PER_BAR
  const stepSize = GRID.BEAT_WIDTH / store.activeSubdivision
  const snappedBeatFloat = Math.round(localX / stepSize) / store.activeSubdivision
  const clampedTick = Math.max(0, Math.min(snappedBeatFloat, totalBeats - 1 / store.activeSubdivision))

  const rowIndex = Math.round((svgY - GRID.TOP_PADDING - GRID.ROW_HEIGHT / 2) / GRID.ROW_HEIGHT)
  const clampedRow = Math.max(0, Math.min(rowIndex, NUM_ROWS - 1))

  return {
    tick: clampedTick,
    instrument: INSTRUMENT_ROWS[clampedRow].id as InstrumentId,
    snappedX: barStartX + clampedTick * BEATS_PER_BAR * GRID.BEAT_WIDTH,
    snappedY: rowY(clampedRow),
  }
}

function getSVGCoords(e: PointerEvent): { x: number; y: number } {
  const svg = (e.currentTarget as SVGSVGElement)
  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  const transformed = pt.matrixTransform(svg.getScreenCTM()!.inverse())
  return { x: transformed.x, y: transformed.y }
}

function getBarIndexFromX(svgX: number): number {
  const bars = store.document.bars.length
  const idx = Math.floor((svgX - GRID.LABEL_WIDTH) / (BEATS_PER_BAR * GRID.BEAT_WIDTH))
  return Math.max(0, Math.min(idx, bars - 1))
}

function onPointerMove(e: PointerEvent) {
  if (!store.activeInstrument) {
    ghostNote.value = null
    return
  }
  const { x, y } = getSVGCoords(e)
  if (x < GRID.LABEL_WIDTH) { ghostNote.value = null; return }
  const barIndex = getBarIndexFromX(x)
  const snapped = snapToGrid(x, y, barIndex)
  ghostNote.value = { x: snapped.snappedX, y: snapped.snappedY, instrument: snapped.instrument }
}

function onPointerLeave() {
  ghostNote.value = null
}

function onPointerDown(e: PointerEvent) {
  if (!store.activeInstrument) return
  e.preventDefault()
  const { x, y } = getSVGCoords(e)
  if (x < GRID.LABEL_WIDTH) return
  const barIndex = getBarIndexFromX(x)
  const snapped = snapToGrid(x, y, barIndex)
  const bar = store.document.bars[barIndex]
  if (!bar) return

  // Avoid duplicate notes on same tick + instrument
  const exists = bar.notes.find(
    (n) => n.instrument === snapped.instrument && Math.abs(n.tick - snapped.tick) < 0.001,
  )
  if (exists) {
    store.selectNote(exists.id)
    return
  }

  store.addNote(bar.id, {
    instrument: snapped.instrument,
    tick: snapped.tick,
    symbol: store.activeSymbol,
  })
}
</script>

<template>
  <div class="w-full overflow-x-auto">
    <svg
      :width="svgWidth"
      :height="svgHeight"
      class="select-none"
      :style="{ cursor: store.activeInstrument ? 'crosshair' : 'default' }"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
      @pointerdown="onPointerDown"
    >
      <!-- ── Instrument labels (Y-axis) ──────────────────────────────────── -->
      <g class="instrument-labels">
        <text
          v-for="(row, i) in INSTRUMENT_ROWS"
          :key="row.id"
          :x="GRID.LABEL_WIDTH - 8"
          :y="rowY(i)"
          text-anchor="end"
          dominant-baseline="middle"
          class="fill-slate-400 text-xs font-mono"
          font-size="11"
        >
          {{ row.label }}
        </text>
      </g>

      <!-- ── Row guide lines (horizontal) ───────────────────────────────── -->
      <g class="row-lines">
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

      <!-- ── Bar + beat lines (vertical) per bar ────────────────────────── -->
      <g
        v-for="(bar, barIndex) in store.document.bars"
        :key="`bar-${bar.id}`"
      >
        <!-- Bar boundary (bold left edge) -->
        <line
          :x1="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH"
          :y1="GRID.TOP_PADDING"
          :x2="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH"
          :y2="svgHeight - 20"
          stroke="#475569"
          stroke-width="1.5"
        />

        <!-- Beat lines within bar -->
        <g v-for="beat in BEATS_PER_BAR" :key="`beat-${barIndex}-${beat}`">
          <!-- Beat line (strong) -->
          <line
            v-if="beat > 1"
            :x1="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + (beat - 1) * GRID.BEAT_WIDTH"
            :y1="GRID.TOP_PADDING"
            :x2="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + (beat - 1) * GRID.BEAT_WIDTH"
            :y2="svgHeight - 20"
            stroke="#475569"
            stroke-width="1"
          />

          <!-- Subdivision lines (dotted, subtle) -->
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

        <!-- Bar number label -->
        <text
          :x="GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + 4"
          :y="GRID.TOP_PADDING - 4"
          font-size="10"
          class="fill-slate-600"
        >
          {{ barIndex + 1 }}
        </text>

        <!-- Notes in this bar -->
        <TabNoteSymbol
          v-for="note in bar.notes"
          :key="note.id"
          :note="note"
          :x="absoluteTickX(barIndex, note.tick)"
          :y="rowY(INSTRUMENT_ROWS.findIndex((r) => r.id === note.instrument))"
          :selected="store.selectedNoteId === note.id"
          @click="store.selectNote(note.id)"
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

      <!-- ── Ghost note (snapping preview) ──────────────────────────────── -->
      <TabNoteSymbol
        v-if="ghostNote && store.activeInstrument"
        :note="{
          id: '__ghost__',
          instrument: ghostNote.instrument,
          tick: 0,
          symbol: store.activeSymbol,
        }"
        :x="ghostNote.x"
        :y="ghostNote.y"
        :ghost="true"
        :selected="false"
      />
    </svg>
  </div>
</template>
