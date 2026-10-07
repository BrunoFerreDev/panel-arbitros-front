<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import {
  AlertOctagon,
  AlertTriangle,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2
} from "@lucide/vue"

const loading = ref(true)
const suspenciones = ref([])
const currentPage = ref(0)
const totalPages = ref(1)
const totalElements = ref(0)

async function cargarSuspenciones(page = 0) {
  loading.value = true
  try {
    const res = await arbitroService.getSuspenciones(page, 10)
    if (res && res.content) {
      suspenciones.value = res.content
      currentPage.value = res.number ?? page
      totalPages.value = res.totalPages ?? 1
      totalElements.value = res.totalElements ?? res.content.length
    } else if (Array.isArray(res)) {
      suspenciones.value = res
      totalElements.value = res.length
      totalPages.value = 1
    }
  } catch (err) {
    console.error('Error al cargar suspensiones:', err)
  } finally {
    loading.value = false
  }
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function tipoLabel(tipo) {
  // tipoSuspencion: 1 = Llamado de atención, 2 = Suspensión
  if (tipo === 1) {
    return {
      text: 'Llamado de Atención',
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      border: 'border-amber-300'
    }
  }
  return {
    text: 'Suspensión Disciplinaria',
    badge: 'bg-rose-100 text-rose-900 border-rose-300',
    border: 'border-rose-300'
  }
}

onMounted(() => {
  cargarSuspenciones()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="pb-2 border-b border-zinc-200">
        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Sanciones y Disciplina</h1>
        <p class="text-xs sm:text-sm text-zinc-600 font-medium">
          Registro de llamados de atención y suspensiones aplicadas por el Tribunal de Disciplina o Secretaría.
        </p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Consultando registro disciplinario...</span>
      </div>

      <template v-else>
        <!-- Lista de Sanciones -->
        <div v-if="suspenciones.length > 0" class="space-y-4">
          <div
            v-for="s in suspenciones"
            :key="s.idSuspencion || s.id"
            class="bg-white border rounded-2xl p-5 sm:p-6 shadow-xs"
            :class="tipoLabel(s.tipoSuspencion).border"
          >
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-2 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border"
                    :class="tipoLabel(s.tipoSuspencion).badge"
                  >
                    {{ tipoLabel(s.tipoSuspencion).text }}
                  </span>

                  <span class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Duración: {{ s.cantidadDias }} días
                  </span>
                </div>

                <h3 class="text-base sm:text-lg font-black text-zinc-900">
                  {{ s.motivo || 'Sin motivo detallado' }}
                </h3>

                <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-600 pt-1">
                  <div class="flex items-center gap-1.5">
                    <Calendar class="w-4 h-4 text-zinc-700" />
                    <span class="capitalize">Fecha del Hecho: {{ formatFecha(s.fechaIncidente) }}</span>
                  </div>

                  <div v-if="s.cancha || s.nombreCancha" class="flex items-center gap-1.5">
                    <MapPin class="w-4 h-4 text-zinc-700" />
                    <span>Lugar: {{ s.cancha?.nombreCancha || s.nombreCancha || s.cancha }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Paginación -->
          <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-zinc-200">
            <span class="text-xs text-zinc-600 font-medium">
              Página {{ currentPage + 1 }} de {{ totalPages }} ({{ totalElements }} registros)
            </span>

            <div class="flex gap-2">
              <button
                @click="cargarSuspenciones(currentPage - 1)"
                :disabled="currentPage === 0"
                class="p-2 border border-zinc-300 rounded-lg bg-white disabled:opacity-40 hover:bg-zinc-50 transition"
              >
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button
                @click="cargarSuspenciones(currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="p-2 border border-zinc-300 rounded-lg bg-white disabled:opacity-40 hover:bg-zinc-50 transition"
              >
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Sin Sanciones (Excelente conducta) -->
        <div v-else class="bg-white border border-emerald-200 rounded-2xl p-10 text-center shadow-xs">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <h3 class="text-base font-black text-zinc-900">Conducta Disciplinaria Ejemplar</h3>
          <p class="text-xs text-zinc-600 max-w-sm mx-auto mt-1 font-medium">
            No registrás suspensiones ni llamados de atención activos en tu legajo arbitral.
          </p>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

