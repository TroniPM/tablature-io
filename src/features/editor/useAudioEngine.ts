/**
 * Procedural drum synthesis via Web Audio API.
 * No audio files — every sound is synthesized on the fly.
 */
import type { InstrumentId } from '@/types/tab'

// Safari on iOS < 14.5 shipped the AudioContext under the webkit prefix.
// The cast is required because TypeScript's lib.dom doesn't include it.
const AudioCtxImpl =
  (window.AudioContext ??
  (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as typeof AudioContext

let audioCtx: AudioContext | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioCtxImpl()
  // Resume if browser suspended it (autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ─── Noise buffer cache ───────────────────────────────────────────────────────
// AudioBuffer data (the random PCM samples) is immutable and reusable across
// multiple AudioBufferSourceNode instances. Pre-generate every duration that
// the synthesis functions need so zero allocation happens during playback.
// This is especially important on iOS where on-the-fly allocation during Play
// can be silently dropped by the system.

/** All noise durations (seconds) used by the synthesis functions below. */
const NOISE_DURATIONS = [0.06, 0.18, 0.25, 0.35, 0.9] as const

const noiseBufferCache = new Map<number, AudioBuffer>()

function ensureNoiseCache(context: AudioContext): void {
  for (const dur of NOISE_DURATIONS) {
    if (noiseBufferCache.has(dur)) continue
    const bufferSize = Math.ceil(context.sampleRate * dur)
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    noiseBufferCache.set(dur, buffer)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function noise(context: AudioContext, duration: number): AudioBufferSourceNode {
  const src = context.createBufferSource()
  const cached = noiseBufferCache.get(duration)
  if (cached) {
    src.buffer = cached
  } else {
    // Cold-path fallback (should never happen after forceUnlockAudio ran).
    const bufferSize = Math.ceil(context.sampleRate * duration)
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    noiseBufferCache.set(duration, buffer)
    src.buffer = buffer
  }
  return src
}

function osc(context: AudioContext, type: OscillatorType, freq: number): OscillatorNode {
  const o = context.createOscillator()
  o.type = type
  o.frequency.value = freq
  return o
}

// ─── Instrument synthesis ─────────────────────────────────────────────────────

function playBD(c: AudioContext) {
  const now = c.currentTime
  const o = osc(c, 'sine', 150)
  const g = c.createGain()
  o.frequency.exponentialRampToValueAtTime(35, now + 0.22)
  g.gain.setValueAtTime(1.2, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  o.connect(g); g.connect(c.destination)
  o.start(now); o.stop(now + 0.35)
}

function playSD(c: AudioContext) {
  const now = c.currentTime
  // Tonal body
  const o = osc(c, 'triangle', 220)
  const og = c.createGain()
  og.gain.setValueAtTime(0.5, now)
  og.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  o.connect(og); og.connect(c.destination)
  o.start(now); o.stop(now + 0.12)
  // Snare rattle (filtered noise)
  const n = noise(c, 0.18)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 1800
  const ng = c.createGain()
  ng.gain.setValueAtTime(0.7, now)
  ng.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
  n.connect(hp); hp.connect(ng); ng.connect(c.destination)
  n.start(now); n.stop(now + 0.18)
}

function playHH(c: AudioContext, open = false) {
  const now = c.currentTime
  const dur = open ? 0.35 : 0.06
  const n = noise(c, dur)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 7000
  const g = c.createGain()
  g.gain.setValueAtTime(0.4, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + dur)
  n.connect(hp); hp.connect(g); g.connect(c.destination)
  n.start(now); n.stop(now + dur)
}

function playCymbal(c: AudioContext, dur: number, bp: number, gain = 0.35) {
  const now = c.currentTime
  const n = noise(c, dur)
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'; filter.frequency.value = bp; filter.Q.value = 0.7
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'; hp.frequency.value = 4000
  const g = c.createGain()
  g.gain.setValueAtTime(gain, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + dur)
  n.connect(filter); filter.connect(hp); hp.connect(g); g.connect(c.destination)
  n.start(now); n.stop(now + dur)
}

function playTom(c: AudioContext, startFreq: number, endFreq: number) {
  const now = c.currentTime
  const o = osc(c, 'sine', startFreq)
  const g = c.createGain()
  o.frequency.exponentialRampToValueAtTime(endFreq, now + 0.2)
  g.gain.setValueAtTime(0.9, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
  o.connect(g); g.connect(c.destination)
  o.start(now); o.stop(now + 0.28)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function triggerNote(instrument: InstrumentId) {
  const c = ctx()
  switch (instrument) {
    case 'BD': playBD(c); break
    case 'SD': playSD(c); break
    case 'HH': playHH(c, false); break
    case 'CR': playCymbal(c, 0.9,  8000, 0.3); break
    case 'RD': playCymbal(c, 0.25, 5500, 0.28); break
    case 'T1': playTom(c, 320, 110); break
    case 'T2': playTom(c, 260, 90); break
    case 'FT': playTom(c, 180, 65); break
  }
}

/**
 * Synchronous iOS AudioContext unlocker. Must be called directly from a user
 * gesture handler (touchstart / touchend / click) — no async calls before it.
 *
 * Strategy:
 *  1. Create the AudioContext with a webkit-prefix fallback for iOS < 14.5.
 *  2. Pre-warm the noise buffer cache BEFORE the early-return so drums never
 *     allocate buffers on-the-fly during playback (critical on iOS).
 *  3. If already running, return. Otherwise call resume() fire-and-forget and
 *     schedule a 1-frame silent buffer at the context's NATIVE sample rate.
 *     Using ctx.sampleRate (not hardcoded 22050) prevents the silent format-
 *     mismatch that some iOS builds silently reject.
 */
export function forceUnlockAudio(): void {
  if (!audioCtx) audioCtx = new AudioCtxImpl()

  // Always ensure the noise cache is warm — cost-free if already populated.
  ensureNoiseCache(audioCtx)

  if (audioCtx.state === 'running') return

  audioCtx.resume() // fire-and-forget — no await

  const silent = audioCtx.createBuffer(1, 1, audioCtx.sampleRate)
  const src = audioCtx.createBufferSource()
  src.buffer = silent
  src.connect(audioCtx.destination)
  src.start(0)
}
