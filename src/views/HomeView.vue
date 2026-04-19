<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  'SVG nativo',
  'Drag & Drop',
  'Snap rítmico',
  'Exportar PDF vetorial',
  'Exportar PNG 2×',
  'Salvar / Carregar JSON',
  'Undo / Redo',
  'Playback BPM',
  'Web Audio API',
  'Dark Mode',
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">

    <!-- ── Nav ──────────────────────────────────────────────────────────────── -->
    <nav class="flex items-center justify-between px-8 py-5 border-b border-slate-900">
      <span class="text-lg font-bold tracking-tight">
        tablature<span class="text-emerald-400">.io</span>
      </span>
      <button
        class="px-4 py-2 rounded-lg text-sm font-medium border border-slate-800
               text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-all duration-200"
        @click="router.push('/editor')"
      >
        Abrir Editor →
      </button>
    </nav>

    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">

      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                  text-xs font-medium tracking-wide mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Editor vetorial SVG · Gratuito · Open Source
      </div>

      <!-- Headline -->
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 max-w-4xl">
        Escreva tablaturas de bateria
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          na velocidade do som.
        </span>
      </h1>

      <!-- Sub-headline -->
      <p class="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
        Um editor vetorial <span class="text-slate-200 font-medium">SVG</span>,
        com drag-and-drop inteligente, playback rítmico e exportação perfeita
        para <span class="text-slate-200 font-medium">PDF</span> e
        <span class="text-slate-200 font-medium">PNG</span>.
        Nenhuma instalação — roda direto no navegador.
      </p>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button
          class="px-8 py-4 rounded-xl text-base font-semibold
                 bg-emerald-400 text-slate-950 hover:bg-emerald-300
                 shadow-[0_0_32px_rgba(52,211,153,0.25)] hover:shadow-[0_0_48px_rgba(52,211,153,0.4)]
                 transition-all duration-200 active:scale-95"
          @click="router.push('/editor')"
        >
          Abrir Editor
        </button>
        <span class="text-slate-600 text-sm">
          Sem cadastro · Trabalho salvo automaticamente
        </span>
      </div>

      <!-- Feature pills -->
      <div class="flex flex-wrap justify-center gap-3 mt-16">
        <span
          v-for="feat in features"
          :key="feat"
          class="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800
                 text-slate-400 text-xs font-mono"
        >
          {{ feat }}
        </span>
      </div>
    </main>

    <!-- ── Footer ────────────────────────────────────────────────────────────── -->
    <footer class="flex items-center justify-center px-8 py-5 border-t border-slate-900">
      <span class="text-slate-700 text-xs">
        tablature<span class="text-emerald-600">.io</span> · feito com SVG, Vue 3 &amp; Web Audio API
      </span>
    </footer>

  </div>
</template>

