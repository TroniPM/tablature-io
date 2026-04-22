<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useTabStore } from '@/stores/useTabStore'

const store = useTabStore()

// ─── Emits ────────────────────────────────────────────────────────────────────
const emit = defineEmits<{
  (e: 'open-history'): void
  (e: 'export-pdf'): void
  (e: 'export-image'): void
  (e: 'export-json'): void
  (e: 'import-json'): void
}>()

// ─── Toast ────────────────────────────────────────────────────────────────────
const toastMessage = ref<string | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(msg: string) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 2000)
}

// ─── Dropdown menus ───────────────────────────────────────────────────────────
// When a menu is open, hovering another menu header switches to it (Windows-style).
const activeMenu = ref<string | null>(null)
const isMenuBarActive = ref(false)

function toggleMenu(name: string) {
  if (activeMenu.value === name) {
    activeMenu.value = null
    isMenuBarActive.value = false
  } else {
    activeMenu.value = name
    isMenuBarActive.value = true
  }
}

function hoverMenu(name: string) {
  if (isMenuBarActive.value) {
    activeMenu.value = name
  }
}

function closeMenus() {
  activeMenu.value = null
  isMenuBarActive.value = false
  exportSubOpen.value = false
}

// Sub-menu for Exportar
const exportSubOpen = ref(false)

// Close on outside click
function onDocClick(e: MouseEvent) {
  const el = (e.target as HTMLElement).closest('[data-navmenu]')
  if (!el) closeMenus()
}

onMounted(() => window.addEventListener('click', onDocClick, true))
onUnmounted(() => {
  window.removeEventListener('click', onDocClick, true)
  if (toastTimer) clearTimeout(toastTimer)
})

// ─── Project name editing ─────────────────────────────────────────────────────
const nameInput = ref<HTMLInputElement | null>(null)
const localName = ref(store.document.title)

// Keep localName in sync when project switches
watch(() => store.document.title, (v) => { localName.value = v })

function focusName() {
  nextTick(() => nameInput.value?.select())
}

function commitName() {
  const trimmed = localName.value.trim()
  store.renameCurrentProject(trimmed || 'Tablatura sem título')
  localName.value = store.document.title
}

function onNameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
  if (e.key === 'Escape') {
    localName.value = store.document.title
    ;(e.target as HTMLInputElement).blur()
  }
}

// ─── BPM editing ──────────────────────────────────────────────────────────────
const localBpm = ref(String(store.document.bpm))

watch(() => store.document.bpm, (v) => { localBpm.value = String(v) })

function commitBpm() {
  const parsed = parseInt(localBpm.value, 10)
  const clamped = Number.isNaN(parsed) ? 120 : Math.min(400, Math.max(20, parsed))
  store.updateBpm(clamped)
  localBpm.value = String(clamped)
}

function onBpmKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
  if (e.key === 'Escape') {
    localBpm.value = String(store.document.bpm)
    ;(e.target as HTMLInputElement).blur()
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function handleSave() {
  store.forceSave()
  showToast('Salvo ✓')
  closeMenus()
}

function handleNewProject() {
  store.createProject()
  closeMenus()
}

function handleLoadJSON() {
  emit('import-json')
  closeMenus()
}

function handleHistory() {
  emit('open-history')
  closeMenus()
}

function handleExportPDF() {
  emit('export-pdf')
  closeMenus()
}

function handleExportImage() {
  emit('export-image')
  closeMenus()
}

function handleExportJSON() {
  emit('export-json')
  closeMenus()
}

function handleUndo() {
  store.undo()
  closeMenus()
}

function handleRedo() {
  store.redo()
  closeMenus()
}

function handleToggleToolbar() {
  store.showToolbar = !store.showToolbar
  closeMenus()
}
</script>

<template>
  <!-- ── Fixed top navigation bar ────────────────────────────────────────── -->
  <nav
    class="fixed top-0 left-0 right-0 z-40 h-9 bg-slate-950 border-b border-slate-800
           flex items-stretch select-none"
  >
    <!-- Logo -->
    <div class="flex items-center px-3 shrink-0 border-r border-slate-800">
      <span class="text-sm font-bold tracking-tight text-slate-100">
        tablature<span class="text-emerald-400">.io</span>
      </span>
    </div>

    <!-- Menu items -->
    <div class="flex items-stretch" data-navmenu>

      <!-- ── Arquivo ──────────────────────────────────────────────────────── -->
      <div class="relative">
        <button
          class="h-full px-3 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          :class="{ 'bg-slate-800': activeMenu === 'arquivo' }"
          @click.stop="toggleMenu('arquivo')"
          @mouseenter="hoverMenu('arquivo')"
        >
          Arquivo
        </button>

        <Transition
          enter-active-class="transition-all duration-100"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-75"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <ul
            v-if="activeMenu === 'arquivo'"
            class="absolute top-full left-0 mt-0 min-w-52 bg-slate-900 border border-slate-700
                   rounded-b-lg shadow-2xl py-1 z-50"
          >
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors"
                @click="handleNewProject"
              >
                Nova Tablatura
              </button>
            </li>
            <li class="my-1 border-t border-slate-700/60" />
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors"
                @click="handleSave"
              >
                Salvar
                <span class="float-right text-slate-500">Ctrl+S</span>
              </button>
            </li>
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors"
                @click="handleLoadJSON"
              >
                Carregar projeto (.json)
              </button>
            </li>
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors"
                @click="handleHistory"
              >
                Histórico
              </button>
            </li>
            <li class="my-1 border-t border-slate-700/60" />

            <!-- Exportar submenu -->
            <li
              class="relative"
              @mouseenter="exportSubOpen = true"
              @mouseleave="exportSubOpen = false"
            >
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors flex justify-between"
              >
                Exportar
                <span class="text-slate-500">▸</span>
              </button>
              <ul
                v-if="exportSubOpen"
                class="absolute left-full top-0 min-w-36 bg-slate-900 border border-slate-700
                       rounded-lg shadow-2xl py-1"
              >
                <li>
                  <button
                    class="w-full text-left px-4 py-1.5 text-xs text-slate-300
                           hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    @click="handleExportPDF"
                  >
                    PDF
                  </button>
                </li>
                <li>
                  <button
                    class="w-full text-left px-4 py-1.5 text-xs text-slate-300
                           hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    @click="handleExportImage"
                  >
                    PNG
                  </button>
                </li>
                <li>
                  <button
                    class="w-full text-left px-4 py-1.5 text-xs text-slate-300
                           hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    @click="handleExportJSON"
                  >
                    Projeto (.json)
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </Transition>
      </div>

      <!-- ── Editar ───────────────────────────────────────────────────────── -->
      <div class="relative">
        <button
          class="h-full px-3 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          :class="{ 'bg-slate-800': activeMenu === 'editar' }"
          @click.stop="toggleMenu('editar')"
          @mouseenter="hoverMenu('editar')"
        >
          Editar
        </button>

        <Transition
          enter-active-class="transition-all duration-100"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-75"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <ul
            v-if="activeMenu === 'editar'"
            class="absolute top-full left-0 mt-0 min-w-48 bg-slate-900 border border-slate-700
                   rounded-b-lg shadow-2xl py-1 z-50"
          >
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs transition-colors flex justify-between"
                :class="store.canUndo
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  : 'text-slate-600 cursor-not-allowed'"
                :disabled="!store.canUndo"
                @click="handleUndo"
              >
                Desfazer
                <span class="text-slate-500">Ctrl+Z</span>
              </button>
            </li>
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs transition-colors flex justify-between"
                :class="store.canRedo
                  ? 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  : 'text-slate-600 cursor-not-allowed'"
                :disabled="!store.canRedo"
                @click="handleRedo"
              >
                Refazer
                <span class="text-slate-500">Ctrl+Y</span>
              </button>
            </li>
          </ul>
        </Transition>
      </div>

      <!-- ── Opções ───────────────────────────────────────────────────────── -->
      <div class="relative">
        <button
          class="h-full px-3 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          :class="{ 'bg-slate-800': activeMenu === 'opcoes' }"
          @click.stop="toggleMenu('opcoes')"
          @mouseenter="hoverMenu('opcoes')"
        >
          Opções
        </button>

        <Transition
          enter-active-class="transition-all duration-100"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-75"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-1"
        >
          <ul
            v-if="activeMenu === 'opcoes'"
            class="absolute top-full left-0 mt-0 min-w-52 bg-slate-900 border border-slate-700
                   rounded-b-lg shadow-2xl py-1 z-50"
          >
            <li>
              <button
                class="w-full text-left px-4 py-1.5 text-xs text-slate-300 hover:bg-slate-800
                       hover:text-slate-100 transition-colors flex items-center gap-2"
                @click="handleToggleToolbar"
              >
                <span
                  class="inline-block w-3 h-3 rounded-sm border border-slate-500"
                  :class="store.showToolbar ? 'bg-emerald-500 border-emerald-500' : 'bg-transparent'"
                />
                {{ store.showToolbar ? 'Ocultar Toolbar' : 'Mostrar Toolbar' }}
              </button>
            </li>
          </ul>
        </Transition>
      </div>
    </div>

    <!-- Centre: project name + BPM -->
    <div class="flex-1 flex items-center justify-center gap-4 px-4">

      <!-- Nome do projeto -->
      <label class="flex items-center gap-1.5">
        <span class="text-xs text-slate-500 shrink-0">Projeto</span>
        <input
          ref="nameInput"
          v-model="localName"
          type="text"
          placeholder="Tablatura sem título"
          class="w-52 text-sm text-slate-200 bg-transparent border-b border-transparent
                 hover:border-slate-600 focus:border-slate-400 focus:outline-none
                 placeholder:text-slate-600 transition-colors px-1 py-0.5"
          @focus="focusName"
          @blur="commitName"
          @keydown="onNameKeydown"
        />
      </label>

      <!-- Divider -->
      <span class="w-px h-4 bg-slate-700 shrink-0" />

      <!-- BPM -->
      <label class="flex items-center gap-1.5">
        <span class="text-xs text-slate-500 shrink-0">BPM</span>
        <input
          v-model="localBpm"
          type="number"
          min="20"
          max="400"
          step="1"
          class="w-14 text-sm text-slate-200 bg-transparent border-b border-transparent
                 hover:border-slate-600 focus:border-slate-400 focus:outline-none
                 placeholder:text-slate-600 transition-colors px-1 py-0.5
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                 [&::-webkit-inner-spin-button]:appearance-none"
          @blur="commitBpm"
          @keydown="onBpmKeydown"
        />
      </label>
    </div>

    <!-- Right spacer (mirrors logo width for perfect centering) -->
    <div class="w-28 shrink-0" />
  </nav>

  <!-- ── Toast notification ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="toastMessage"
        class="fixed top-12 left-1/2 -translate-x-1/2 z-50
               bg-slate-800 text-slate-200 text-xs px-4 py-2 rounded-full
               shadow-lg border border-slate-700 pointer-events-none"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </Teleport>
</template>
