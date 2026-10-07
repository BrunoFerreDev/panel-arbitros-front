<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PieChart
} from "@lucide/vue"

const loading = ref(true)
const stats = ref(null)

// Filtros
const fechaInicio = ref('')
const fechaFin = ref('')
const orden = ref('DESC')
const canchaPage = ref(0)

async function cargarEstadisticas(page = 0) {
  loading.value = true
  canchaPage.value = page
  try {
    const data = await arbitroService.getEstadisticas({
      inicio: fechaInicio.value || undefined,
      fin: fechaFin.value || undefined,
      orden: orden.value,
      page,
      size: 10
    })
    stats.value = data
  } catch (err) {
    console.error('Error al cargar estadísticas:', err)
  } finally {
    loading.value = false
  }
}

function formatMoneda(val) {
  if (val === undefined || val === null) return '$0'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)
}

function handleFiltrar() {
  cargarEstadisticas(0)
}

function limpiarFiltros() {
  fechaInicio.value = ''
  fechaFin.value = ''
  orden.value = 'DESC'
  cargarEstadisticas(0)
}

onMounted(() => {
  cargarEstadisticas(0)
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="pb-2 border-b border-zinc-200">
        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Estadísticas y Rendimiento</h1>
        <p class="text-xs sm:text-sm text-zinc-600 font-medium">
          Métricas de desempeño, distribución por canchas y aranceles acumulados.
        </p>
      </div>

      <!-- Barra de Filtros por Fecha -->
      <div class="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
        <form @submit.prevent="handleFiltrar" class="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="fechaInicio">
              Fecha Desde
            </label>
            <input
              id="fechaInicio"
              v-model="fechaInicio"
              type="date"
              class="w-full py-2 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="fechaFin">
              Fecha Hasta
            </label>
            <input
              id="fechaFin"
              v-model="fechaFin"
              type="date"
              class="w-full py-2 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="orden">
              Orden Cronológico
            </label>
            <select
              id="orden"
              v-model="orden"
              class="w-full py-2 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
            >
              <option value="DESC">Más recientes primero</option>
              <option value="ASC">Más antiguos primero</option>
            </select>
          </div>

          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 py-2 px-3 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Filter class="w-3.5 h-3.5" />
              <span>Filtrar</span>
            </button>
            <button
              type="button"
              @click="limpiarFiltros"
              class="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Calculando métricas...</span>
      </div>

      <template v-else-if="stats">
        <!-- Tarjetas de Totales -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <!-- Total Partidos -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Partidos Dirigidos</span>
              <TrendingUp class="w-4 h-4 text-emerald-600" />
            </div>
            <div class="text-3xl font-black text-zinc-900">
              {{ stats.totalPartidosDirigidos ?? 0 }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              En {{ stats.totalDesignaciones ?? 0 }} jornadas convocadas
            </div>
          </div>

          <!-- Total Percibido -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Aranceles Totales</span>
              <DollarSign class="w-4 h-4 text-zinc-900" />
            </div>
            <div class="text-3xl font-black text-zinc-900">
              {{ formatMoneda(stats.totalMontoPercibido) }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              Liquidado en el rango seleccionado
            </div>
          </div>

          <!-- Promedio Partidos por Jornada -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Promedio Partidos</span>
              <BarChart3 class="w-4 h-4 text-zinc-900" />
            </div>
            <div class="text-3xl font-black text-zinc-900">
              {{ stats.totalDesignaciones > 0 ? (stats.totalPartidosDirigidos / stats.totalDesignaciones).toFixed(1) : '0.0' }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              Por fecha de designación
            </div>
          </div>
        </div>

        <!-- Desglose por Estado y Categoría -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Por Estado -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 class="text-base font-black text-zinc-900">Partidos por Estado de Designación</h2>
            <div class="space-y-2 pt-2">
              <div
                v-for="(cantidad, estado) in (stats.designacionesPorEstado || {})"
                :key="estado"
                class="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl text-xs font-semibold"
              >
                <span class="text-zinc-800">{{ estado }}</span>
                <span class="px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-extrabold text-zinc-900">
                  {{ cantidad }}
                </span>
              </div>
            </div>
          </div>

          <!-- Por Categoría -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h2 class="text-base font-black text-zinc-900">Designaciones por Rol / Categoría</h2>
            <div class="space-y-2 pt-2">
              <div
                v-for="(cantidad, cat) in (stats.designacionesPorCategoria || {})"
                :key="cat"
                class="flex items-center justify-between p-2.5 bg-zinc-50 rounded-xl text-xs font-semibold"
              >
                <span class="text-zinc-800">{{ cat }}</span>
                <span class="px-2 py-0.5 rounded-md bg-white border border-zinc-200 font-extrabold text-zinc-900">
                  {{ cantidad }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Desglose por Canchas -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h2 class="text-lg font-black text-zinc-900">Actividad por Cancha y Predio</h2>
              <p class="text-xs text-zinc-600 font-medium">Lugares donde dirigiste durante el período.</p>
            </div>
          </div>

          <div v-if="stats.estadisticasCanchas?.content && stats.estadisticasCanchas.content.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs uppercase bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th class="py-3 px-4">Cancha / Predio</th>
                  <th class="py-3 px-4 text-center">Jornadas</th>
                  <th class="py-3 px-4 text-center">Partidos</th>
                  <th class="py-3 px-4 text-center">Finalizadas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 font-medium">
                <tr v-for="c in stats.estadisticasCanchas.content" :key="c.idCancha || c.nombreCancha">
                  <td class="py-3 px-4 font-bold text-zinc-900 flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-zinc-600 shrink-0" />
                    <span>{{ c.nombreCancha }}</span>
                  </td>
                  <td class="py-3 px-4 text-center">{{ c.totalDesignaciones }}</td>
                  <td class="py-3 px-4 text-center font-bold">{{ c.totalPartidos }}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-900">
                      {{ c.totalDesignacionesFinalizadas }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-6 text-zinc-600 text-xs font-medium">
            No hay registros de canchas en el rango de fechas seleccionado.
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

