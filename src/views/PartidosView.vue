<script setup>
import { ref, onMounted, computed } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Compass,
  FileText
} from "@lucide/vue"

const loading = ref(true)
const designaciones = ref([])
const currentPage = ref(0)
const pageSize = ref(10)
const totalPages = ref(1)
const totalElements = ref(0)
const activeTab = ref('todas') // 'todas', 'proximas', 'historial'

async function cargarDesignaciones(page = 0) {
  loading.value = true
  try {
    const res = await arbitroService.getDesignaciones(page, pageSize.value)
    if (res && res.content) {
      designaciones.value = res.content
      currentPage.value = res.number ?? page
      totalPages.value = res.totalPages ?? 1
      totalElements.value = res.totalElements ?? res.content.length
    } else if (Array.isArray(res)) {
      designaciones.value = res
      totalElements.value = res.length
      totalPages.value = 1
    }
  } catch (err) {
    console.error('Error al cargar designaciones:', err)
  } finally {
    loading.value = false
  }
}

const designacionesFiltradas = computed(() => {
  const now = new Date()
  if (activeTab.value === 'proximas') {
    return designaciones.value.filter(d => {
      const fecha = new Date(d.fecha)
      return fecha >= now || d.estadoDesignacion === 0 || d.estadoDesignacion === 1
    })
  } else if (activeTab.value === 'historial') {
    return designaciones.value.filter(d => {
      const fecha = new Date(d.fecha)
      return fecha < now || d.estadoDesignacion === 2 || d.estadoDesignacion === 3
    })
  }
  return designaciones.value
})

function formatFecha(fechaStr) {
  if (!fechaStr) return 'Fecha a confirmar'
  const d = new Date(fechaStr)
  return d.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function estadoInfo(estadoCode) {
  switch (estadoCode) {
    case 0:
      return { label: 'Pendiente', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
    case 1:
      return { label: 'Aceptada', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
    case 2:
      return { label: 'Finalizada', badge: 'bg-zinc-100 text-zinc-900 border-zinc-300' }
    case 3:
      return { label: 'Cancelada', badge: 'bg-rose-100 text-rose-900 border-rose-300' }
    default:
      return { label: 'Asignada', badge: 'bg-zinc-100 text-zinc-900 border-zinc-300' }
  }
}

function cambiarPagina(nuevaPag) {
  if (nuevaPag >= 0 && nuevaPag < totalPages.value) {
    cargarDesignaciones(nuevaPag)
  }
}

onMounted(() => {
  cargarDesignaciones()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Mis Partidos y Designaciones</h1>
          <p class="text-xs sm:text-sm text-zinc-600 font-medium">
            Historial de jornadas oficiales, fechas asignadas y canchas del torneo.
          </p>
        </div>

        <!-- Selector de Pestañas / Filtro -->
        <div class="flex items-center bg-zinc-200/80 p-1 rounded-xl text-xs font-bold">
          <button
            @click="activeTab = 'todas'"
            class="px-3 py-1.5 rounded-lg transition"
            :class="activeTab === 'todas' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'"
          >
            Todas ({{ designaciones.length }})
          </button>
          <button
            @click="activeTab = 'proximas'"
            class="px-3 py-1.5 rounded-lg transition"
            :class="activeTab === 'proximas' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'"
          >
            Próximas
          </button>
          <button
            @click="activeTab = 'historial'"
            class="px-3 py-1.5 rounded-lg transition"
            :class="activeTab === 'historial' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'"
          >
            Historial
          </button>
        </div>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Cargando partidos...</span>
      </div>

      <!-- Lista de Partidos -->
      <div v-else-if="designacionesFiltradas.length > 0" class="space-y-4">
        <div
          v-for="partido in designacionesFiltradas"
          :key="partido.idDesignacion || partido.id || partido.fecha"
          class="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-zinc-400 transition"
        >
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div class="space-y-2 flex-1">
              <!-- Estado y Etapa -->
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border"
                  :class="estadoInfo(partido.estadoDesignacion).badge"
                >
                  {{ estadoInfo(partido.estadoDesignacion).label }}
                </span>

                <span
                  v-if="partido.etapaCampeonato"
                  class="px-2.5 py-0.5 rounded-md text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200"
                >
                  {{ partido.etapaCampeonato }}
                </span>

                <span
                  v-if="partido.cancha?.necesitaViaje || partido.necesitaViaje"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300"
                >
                  <Car class="w-3.5 h-3.5 text-amber-700" />
                  Requiere Traslado
                </span>
              </div>

              <!-- Fecha y Cancha -->
              <div>
                <h3 class="text-lg sm:text-xl font-black text-zinc-950 capitalize">
                  {{ formatFecha(partido.fecha) }}
                </h3>

                <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-zinc-700 mt-1">
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-4 h-4 text-zinc-900" />
                    <span class="text-zinc-900 font-bold">
                      {{ partido.cancha?.nombreCancha || partido.nombreCancha || 'Cancha Asignada' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-bold text-zinc-800">
                      {{ partido.cantidadPartidos || 1 }} {{ (partido.cantidadPartidos || 1) === 1 ? 'partido' : 'partidos consecutivos' }}
                    </span>
                  </div>

                  <div v-if="partido.cancha?.categoria" class="flex items-center gap-1.5">
                    <span class="text-zinc-600 font-medium">
                      Categoría: {{ partido.cancha.categoria }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Detalle o Instrucciones -->
              <div v-if="partido.detalle" class="pt-2">
                <div class="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-700 font-medium flex items-start gap-2">
                  <FileText class="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span>{{ partido.detalle }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 border-t border-zinc-200">
          <span class="text-xs text-zinc-600 font-medium">
            Página {{ currentPage + 1 }} de {{ totalPages }} ({{ totalElements }} designaciones)
          </span>

          <div class="flex gap-2">
            <button
              @click="cambiarPagina(currentPage - 1)"
              :disabled="currentPage === 0"
              class="p-2 border border-zinc-300 rounded-lg bg-white disabled:opacity-40 hover:bg-zinc-50 transition"
              aria-label="Página anterior"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              @click="cambiarPagina(currentPage + 1)"
              :disabled="currentPage >= totalPages - 1"
              class="p-2 border border-zinc-300 rounded-lg bg-white disabled:opacity-40 hover:bg-zinc-50 transition"
              aria-label="Página siguiente"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Estado Vacío -->
      <div v-else class="bg-white border border-zinc-200 rounded-2xl p-12 text-center">
        <Compass class="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 class="text-base font-bold text-zinc-900">No se encontraron designaciones</h3>
        <p class="text-xs text-zinc-600 max-w-sm mx-auto mt-1 font-medium">
          No tenés partidos asignados en este filtro por el momento.
        </p>
      </div>
    </div>
  </AppLayout>
</template>

