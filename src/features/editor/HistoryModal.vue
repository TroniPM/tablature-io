<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTabStore } from '@/stores/useTabStore'

const store = useTabStore()
const { t, locale } = useI18n()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function formatDate(ts: number): string {
  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

function openProject(id: string) {
  store.openProject(id)
  emit('close')
}

function deleteProject(id: string) {
  store.deleteProject(id)
}
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background: rgba(2,6,23,0.75); backdrop-filter: blur(4px)"
        @click.self="emit('close')"
      >
        <!-- Modal panel -->
        <div
          class="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl
                 flex flex-col overflow-hidden max-h-[80vh]"
          @click.stop
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 class="text-sm font-semibold text-slate-200">{{ t('history.title') }}</h2>
            <button
              class="text-slate-500 hover:text-slate-200 transition-colors text-lg leading-none"
              @click="emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Project list -->
          <ul class="overflow-y-auto flex-1 divide-y divide-slate-800">
            <li
              v-for="project in store.sortedProjects"
              :key="project.id"
              class="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors group"
            >
              <!-- Active indicator -->
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :class="project.id === store.currentProjectId
                  ? 'bg-emerald-400'
                  : 'bg-transparent'"
              />

              <!-- Name + meta -->
              <div class="flex-1 min-w-0">
                <p
                  class="text-sm truncate"
                  :class="project.id === store.currentProjectId
                    ? 'text-slate-100 font-medium'
                    : 'text-slate-300'"
                >
                  {{ project.name || t('history.untitled') }}
                </p>
                <p class="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>BPM: {{ project.bpm }}</span>
                  <span class="text-slate-700">·</span>
                  <span>{{ t('history.last_modified') }}: {{ formatDate(project.lastModified) }}</span>
                </p>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  v-if="project.id !== store.currentProjectId"
                  class="px-3 py-1 text-xs rounded-md bg-slate-700 text-slate-200
                         hover:bg-emerald-700 hover:text-white transition-colors"
                  @click="openProject(project.id)"
                >
                  {{ t('history.open') }}
                </button>
                <span
                  v-else
                  class="px-3 py-1 text-xs rounded-md bg-emerald-900/40 text-emerald-400
                         border border-emerald-800"
                >
                  {{ t('history.opened') }}
                </span>
                <button
                  class="p-1.5 rounded-md text-slate-500 hover:bg-red-950 hover:text-red-400
                         transition-colors"
                  :title="t('history.delete')"
                  @click="deleteProject(project.id)"
                >
                  <!-- Trash icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </li>

            <!-- Empty state -->
            <li v-if="store.sortedProjects.length === 0" class="px-5 py-8 text-center">
              <p class="text-sm text-slate-500">{{ t('history.empty') }}</p>
            </li>
          </ul>

          <!-- Footer -->
          <div class="px-5 py-3 border-t border-slate-800 flex justify-between items-center">
            <span class="text-xs text-slate-600">
              {{ t('history.footer_count', store.projects.length) }}
            </span>
            <button
              class="px-4 py-1.5 text-xs rounded-lg bg-slate-800 text-slate-300
                     hover:bg-slate-700 transition-colors"
              @click="emit('close')"
            >
              {{ t('history.close') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
