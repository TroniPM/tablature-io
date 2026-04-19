import { onUnmounted } from 'vue'
import { useTabStore } from '@/stores/useTabStore'
import { GRID } from '@/types/tab'
import { triggerNote } from './useAudioEngine'

const BEATS_PER_BAR = 4

// Module-level handles ensure only one rAF loop runs at a time,
// regardless of how many components call usePlayhead().
let rafId: number | null = null
let lastTimestamp: number | null = null
let prevX: number = GRID.LABEL_WIDTH

export function usePlayhead() {
  const store = useTabStore()

  const startX = GRID.LABEL_WIDTH
  const endX = () => startX + store.document.bars.length * BEATS_PER_BAR * GRID.BEAT_WIDTH

  /** Pixel X of a note given its bar index and tick offset. */
  function noteX(barIndex: number, tick: number): number {
    return GRID.LABEL_WIDTH + barIndex * BEATS_PER_BAR * GRID.BEAT_WIDTH + tick * GRID.BEAT_WIDTH
  }

  /** Fire sounds for every note whose X falls in (prevX, newX]. */
  function triggerNotesInRange(from: number, to: number) {
    store.document.bars.forEach((bar, barIndex) => {
      bar.notes.forEach((note) => {
        const x = noteX(barIndex, note.tick)
        if (x > from && x <= to) {
          triggerNote(note.instrument)
        }
      })
    })
  }

  function tick(timestamp: number) {
    if (lastTimestamp === null) lastTimestamp = timestamp
    const elapsed = (timestamp - lastTimestamp) / 1000 // seconds
    lastTimestamp = timestamp

    // pixels per second = beats-per-minute × pixels-per-beat ÷ seconds-per-minute
    const pps = (store.document.bpm * GRID.BEAT_WIDTH) / 60
    const newX = store.playheadX + elapsed * pps

    triggerNotesInRange(prevX, newX)
    prevX = newX
    store.playheadX = newX

    if (store.playheadX >= endX()) {
      stop()
      return
    }

    rafId = requestAnimationFrame(tick)
  }

  function play() {
    if (store.isPlaying) return
    store.playheadX = startX
    store.isPlaying = true
    lastTimestamp = null
    prevX = startX - 1  // one pixel before so tick-0 notes are included
    rafId = requestAnimationFrame(tick)
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
    store.isPlaying = false
    store.playheadX = startX
    lastTimestamp = null
    prevX = startX - 1
  }

  function toggle() {
    if (store.isPlaying) stop()
    else play()
  }

  // Cleanup if the component using this composable is destroyed mid-playback.
  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  return { play, stop, toggle }
}
