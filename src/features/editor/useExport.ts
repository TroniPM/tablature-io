import { ref } from 'vue'
import jsPDF from 'jspdf'
import { svg2pdf } from 'svg2pdf.js'
import { useTabStore } from '@/stores/useTabStore'
import type { TabDocument } from '@/types/tab'

export function useExport(getSvgEl: () => SVGSVGElement | null) {
  const store = useTabStore()
  const isExportingPDF = ref(false)
  const isExportingImage = ref(false)
  const exportError = ref<string | null>(null)

  // ─── PDF (vector, via jspdf + svg2pdf.js) ──────────────────────────────────
  async function exportPDF() {
    const svgEl = getSvgEl()
    if (!svgEl) return
    isExportingPDF.value = true
    exportError.value = null
    try {
      const w = svgEl.width.baseVal.value
      const h = svgEl.height.baseVal.value

      const pdf = new jsPDF({
        orientation: w > h ? 'l' : 'p',
        unit: 'px',
        format: [w, h],
        hotfixes: ['px_scaling'],
      })

      // Dark background for the PDF page
      pdf.setFillColor(2, 6, 23) // slate-950
      pdf.rect(0, 0, w, h, 'F')

      await svg2pdf(svgEl, pdf, { x: 0, y: 0, width: w, height: h })
      pdf.save(`${store.document.title}.pdf`)
    } catch (err) {
      exportError.value = 'PDF export failed. Please try again.'
      console.error('[exportPDF]', err)
    } finally {
      isExportingPDF.value = false
    }
  }

  // ─── PNG (SVG → Canvas → Blob, 2× resolution) ──────────────────────────────
  async function exportImage() {
    const svgEl = getSvgEl()
    if (!svgEl) return
    isExportingImage.value = true
    exportError.value = null
    try {
      const w = svgEl.width.baseVal.value
      const h = svgEl.height.baseVal.value
      const scale = 2 // retina

      // Serialize SVG to a Blob URL
      const svgData = new XMLSerializer().serializeToString(svgEl)
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(blob)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = w * scale
          canvas.height = h * scale
          const ctx = canvas.getContext('2d')!

          // Fill dark background before drawing the SVG
          ctx.fillStyle = '#020617' // slate-950
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.scale(scale, scale)
          ctx.drawImage(img, 0, 0)
          URL.revokeObjectURL(svgUrl)

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) { reject(new Error('toBlob returned null')); return }
            const pngUrl = URL.createObjectURL(pngBlob)
            const a = document.createElement('a')
            a.href = pngUrl
            a.download = `${store.document.title}.png`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(pngUrl)
            resolve()
          }, 'image/png')
        }
        img.onerror = (err) => { URL.revokeObjectURL(svgUrl); reject(err) }
        img.src = svgUrl
      })
    } catch (err) {
      exportError.value = 'Image export failed. Please try again.'
      console.error('[exportImage]', err)
    } finally {
      isExportingImage.value = false
    }
  }

  // ─── JSON export ───────────────────────────────────────────────────────────
  function exportJSON() {
    const json = JSON.stringify(store.document, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${store.document.title}.tablature.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ─── JSON import ───────────────────────────────────────────────────────────
  function importJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target!.result as string) as TabDocument
          // Basic structural validation
          if (
            typeof parsed.title !== 'string' ||
            typeof parsed.bpm !== 'number' ||
            !Array.isArray(parsed.bars)
          ) {
            exportError.value = 'Invalid file: not a tablature JSON.'
            return
          }
          exportError.value = null
          store.document = parsed
        } catch {
          exportError.value = 'Failed to read file. Make sure it is a valid tablature JSON.'
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return { exportPDF, exportImage, isExportingPDF, isExportingImage, exportError, exportJSON, importJSON }
}
