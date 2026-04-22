<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import FooterBar from '@/components/FooterBar.vue'

const router = useRouter()
const { t, tm } = useI18n()
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
        {{ t('home.open_editor') }}
      </button>
    </nav>

    <!-- ── Hero ─────────────────────────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col items-center justify-center px-6 text-center">

      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full
                  bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                  text-xs font-medium tracking-wide mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        {{ t('home.badge') }}
      </div>

      <!-- Headline -->
      <h1 class="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 max-w-4xl">
        {{ t('home.headline_1') }}
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
          {{ t('home.headline_2') }}
        </span>
      </h1>

      <!-- Sub-headline -->
      <i18n-t keypath="home.sub" tag="p" class="text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
        <template #svg>
          <span class="text-slate-200 font-medium">SVG</span>
        </template>
        <template #pdf>
          <span class="text-slate-200 font-medium">PDF</span>
        </template>
        <template #png>
          <span class="text-slate-200 font-medium">PNG</span>
        </template>
      </i18n-t>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row items-center gap-4">
        <button
          class="px-8 py-4 rounded-xl text-base font-semibold
                 bg-emerald-400 text-slate-950 hover:bg-emerald-300
                 shadow-[0_0_32px_rgba(52,211,153,0.25)] hover:shadow-[0_0_48px_rgba(52,211,153,0.4)]
                 transition-all duration-200 active:scale-95"
          @click="router.push('/editor')"
        >
          {{ t('home.cta_button') }}
        </button>
        <span class="text-slate-600 text-sm">
          {{ t('home.cta_sub') }}
        </span>
      </div>

      <!-- Feature pills -->
      <div class="flex flex-wrap justify-center gap-3 mt-16">
        <span
          v-for="feat in (tm('home.features') as string[])"
          :key="feat"
          class="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800
                 text-slate-400 text-xs font-mono"
        >
          {{ feat }}
        </span>
      </div>
    </main>

    <!-- ── Footer ────────────────────────────────────────────────────────────── -->
    <FooterBar />

  </div>
</template>

