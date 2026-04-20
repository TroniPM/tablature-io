<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { forceUnlockAudio } from '@/features/editor/useAudioEngine'

// Attempt to unlock the AudioContext on any user interaction.
// capture:true — handler fires in the capture phase, before any component preventDefault().
// passive is intentionally OMITTED: Safari/iOS disqualifies passive listeners as valid
// "user gesture" origins for media unlock, so we must allow blocking behaviour.
function handleUserInteraction(): void {
  forceUnlockAudio()
}

const INTERACTION_EVENTS = ['touchstart', 'touchend', 'click', 'keydown'] as const
const CAPTURE_OPTS = { capture: true } as const

onMounted(() => {
  for (const evt of INTERACTION_EVENTS) {
    document.addEventListener(evt, handleUserInteraction, CAPTURE_OPTS)
  }
  // iOS re-suspends the AudioContext whenever the browser is backgrounded.
  // Re-unlock on every visibility restoration.
  document.addEventListener('visibilitychange', handleUserInteraction)
})

onUnmounted(() => {
  for (const evt of INTERACTION_EVENTS) {
    document.removeEventListener(evt, handleUserInteraction, CAPTURE_OPTS)
  }
  document.removeEventListener('visibilitychange', handleUserInteraction)
})
</script>

<template>
  <RouterView />
</template>
