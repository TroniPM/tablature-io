// ─── Instrument types (Y-axis) ────────────────────────────────────────────────
export type InstrumentId = 'CR' | 'RD' | 'HH' | 'T1' | 'T2' | 'SD' | 'BD' | 'FT'

export interface InstrumentRow {
  id: InstrumentId
  label: string
  /** Default symbol when clicking/stamping this instrument */
  defaultSymbol: NoteSymbol
}

/** Top-to-bottom order matches the Y-axis of the grid */
export const INSTRUMENT_ROWS: InstrumentRow[] = [
  { id: 'CR', label: 'Crash',      defaultSymbol: 'x' },
  { id: 'RD', label: 'Ride',       defaultSymbol: 'x' },
  { id: 'HH', label: 'Hi-Hat',     defaultSymbol: 'x' },
  { id: 'T1', label: 'Tom 1',      defaultSymbol: 'o' },
  { id: 'T2', label: 'Tom 2',      defaultSymbol: 'o' },
  { id: 'SD', label: 'Snare',      defaultSymbol: 'o' },
  { id: 'BD', label: 'Bass Drum',  defaultSymbol: 'o' },
  { id: 'FT', label: 'Floor Tom',  defaultSymbol: 'o' },
]

// ─── Note symbols ─────────────────────────────────────────────────────────────
export type NoteSymbol = 'x' | 'o' | '>' | '(x)'

// ─── Core domain entity ───────────────────────────────────────────────────────
export interface TabNote {
  id: string          // UUID for DOM tracking
  instrument: InstrumentId
  tick: number        // Rhythmic position: 0, 0.25, 0.5, 0.75, 1, …
  symbol: NoteSymbol
}

// ─── Bar / measure ────────────────────────────────────────────────────────────
export interface TabBar {
  id: string
  timeSignatureNumerator: number    // e.g. 4
  timeSignatureDenominator: number  // e.g. 4
  notes: TabNote[]
}

// ─── Full tab document ────────────────────────────────────────────────────────
export interface TabDocument {
  title: string
  bpm: number
  bars: TabBar[]
}

// ─── Project (multi-document management) ─────────────────────────────────────
export interface Project {
  id: string
  name: string
  bars: TabBar[]
  bpm: number
  lastModified: number
}

// ─── Grid layout constants ────────────────────────────────────────────────────
export const GRID = {
  /** Pixels between two adjacent beat lines (quarter notes) */
  BEAT_WIDTH: 80,
  /** Pixels between two adjacent instrument rows */
  ROW_HEIGHT: 40,
  /** Left margin for instrument labels */
  LABEL_WIDTH: 60,
  /** Top padding before the first row */
  TOP_PADDING: 20,
  /** Supported subdivisions per beat (1 = quarter, 2 = eighth, 4 = sixteenth) */
  SUBDIVISIONS: [1, 2, 4] as const,
  /** Default active subdivision (eighth notes) */
  DEFAULT_SUBDIVISION: 2 as const,
} as const
