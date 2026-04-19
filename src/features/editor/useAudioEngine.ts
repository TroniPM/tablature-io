/**
 * Procedural drum synthesis via Web Audio API.
 * No audio files — every sound is synthesized on the fly.
 */
import type { InstrumentId } from '@/types/tab'

let audioCtx: AudioContext | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  // Resume if browser suspended it (autoplay policy)
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function noise(context: AudioContext, duration: number): AudioBufferSourceNode {
  const bufferSize = Math.ceil(context.sampleRate * duration)
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const src = context.createBufferSource()
  src.buffer = buffer
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

/** Call once on first user gesture to unlock the AudioContext. */
export function unlockAudio() {
  ctx()
}
