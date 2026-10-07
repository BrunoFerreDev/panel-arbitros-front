<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import {
  Calendar,
  Clock,
  MapPin,
  Car,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  AlertOctagon,
  ShieldAlert,
  Loader2,
  CalendarCheck
} from "@lucide/vue"

const arbitro = inject('arbitro', ref(null))
const loading = ref(true)
const error = ref(null)

const designaciones = ref([])
const estadoCuenta = ref(null)
const estadisticas = ref(null)
const suspenciones = ref([])

async function cargarDatosDashboard() {
  loading.value = true
  error.value = null
  try {
    const [desigRes, ctaRes, statsRes, suspRes] = await Promise.allSettled([
      arbitroService.getDesignaciones(0, 5),
      arbitroService.getEstadoCuenta(),
      arbitroService.getEstadisticas(),
      arbitroService.getSuspenciones(0, 5)
    ])

    if (desigRes.status === 'fulfilled' && desigRes.value) {
      designaciones.value = desigRes.value.content || desigRes.value || []
    }
    if (ctaRes.status === 'fulfilled') {
      estadoCuenta.value = ctaRes.value
    }
    if (statsRes.status === 'fulfilled') {
      estadisticas.value = statsRes.value
    }
    if (suspRes.status === 'fulfilled' && suspRes.value) {
      suspenciones.value = suspRes.value.content || suspRes.value || []
    }
  } catch (err) {
    error.value = err.message || 'Error cargando datos del dashboard'
  } finally {
    loading.value = false
  }
}

// Próximo partido asignado (el primero con fecha futura o en estado pendiente/aceptada)
const proximoPartido = computed(() => {
  if (!designaciones.value.length) return null
  const now = new Date()
  // Buscar primero futuras no finalizadas
  const futuras = designaciones.value.filter(d => {
    const fecha = new Date(d.fecha)
    return fecha >= now || d.estadoDesignacion === 0 || d.estadoDesignacion === 1
  })
  if (futuras.length) return futuras[0]
  return designaciones.value[0]
})

// Formateadores
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

function formatMoneda(val) {
  if (val === undefined || val === null) return '$0'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)
}

function estadoTexto(estadoCode) {
  switch (estadoCode) {
    case 0: return { label: 'Pendiente', color: 'bg-amber-100 text-amber-900 border-amber-300' }
    case 1: return { label: 'Aceptada', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
    case 2: return { label: 'Finalizada', color: 'bg-zinc-100 text-zinc-900 border-zinc-300' }
    case 3: return { label: 'Cancelada', color: 'bg-rose-100 text-rose-900 border-rose-300' }
    default: return { label: 'Programado', color: 'bg-zinc-100 text-zinc-900 border-zinc-300' }
  }
}

onMounted(() => {
  cargarDatosDashboard()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Banner de alerta de suspensión si existe alguna -->
      <div
        v-if="suspenciones.length > 0 && suspenciones[0].cantidadDias > 0"
        class="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3.5 shadow-xs"
      >
        <ShieldAlert class="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div class="flex-1">
          <div class="text-sm font-black text-rose-950 uppercase tracking-wide">
            Aviso de Sanción / Suspensión Vigente
          </div>
          <p class="text-xs text-rose-800 font-medium mt-0.5">
            Tenés registrado: "{{ suspenciones[0].motivo }}". Vigencia: {{ suspenciones[0].cantidadDias }} días.
          </p>
          <router-link to="/sanciones" class="inline-flex items-center gap-1 text-xs font-bold text-rose-900 underline mt-1.5">
            Ver detalles de sanciones <ArrowRight class="w-3.5 h-3.5" />
          </router-link>
        </div>
      </div>

      <!-- Saludo / Cabecera de Página -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200">
        <div>
          <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Hola, {{ arbitro?.nombre || 'Árbitro' }}
          </h1>
          <p class="text-xs sm:text-sm text-zinc-600 font-medium">
            Categoría: <span class="font-bold text-zinc-900">{{ arbitro?.categoria || 'No asignada' }}</span> &bull;
            Estado: <span class="font-bold text-emerald-700">Habilitado para designaciones</span>
          </p>
        </div>
        <div>
          <router-link
            to="/partidos"
            class="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-900 shadow-xs transition"
          >
            <CalendarCheck class="w-4 h-4 text-zinc-700" />
            <span>Ver agenda completa</span>
          </router-link>
        </div>
      </div>

      <!-- Spinner de Carga General -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Cargando información del árbitro...</span>
      </div>

      <template v-else>
        <!-- HERO OPERATIVO: Próximo Partido Asignado -->
        <section class="bg-white border-2 border-zinc-900 rounded-2xl p-5 sm:p-7 shadow-md relative overflow-hidden">
          <div class="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-zinc-100 rounded-full z-0 opacity-40"></div>

          <div class="relative z-10">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-zinc-900 text-white tracking-wider uppercase">
                <Clock class="w-3.5 h-3.5 text-emerald-400" />
                PRÓXIMO PARTIDO ASIGNADO
              </span>

              <span
                v-if="proximoPartido"
                :class="estadoTexto(proximoPartido.estadoDesignacion).color"
                class="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider border"
              >
                {{ estadoTexto(proximoPartido.estadoDesignacion).label }}
              </span>
            </div>

            <!-- Caso con Partido -->
            <div v-if="proximoPartido" class="space-y-4">
              <div>
                <h2 class="text-xl sm:text-2xl font-black text-zinc-950 capitalize">
                  {{ formatFecha(proximoPartido.fecha) }}
                </h2>
                <div class="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-zinc-700 mt-2">
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-4 h-4 text-zinc-900" />
                    <span class="text-zinc-900 font-bold text-sm">
                      {{ proximoPartido.cancha?.nombreCancha || proximoPartido.nombreCancha || 'Cancha asignada' }}
                    </span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-bold text-zinc-800">
                      {{ proximoPartido.cantidadPartidos || 1 }} {{ (proximoPartido.cantidadPartidos || 1) === 1 ? 'partido' : 'partidos' }}
                    </span>
                  </div>

                  <div v-if="proximoPartido.etapaCampeonato" class="flex items-center gap-1.5">
                    <span class="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-bold text-zinc-800">
                      Etapa: {{ proximoPartido.etapaCampeonato }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Indicadores tácticos (Viaje, Detalles) -->
              <div class="pt-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span
                    v-if="proximoPartido.cancha?.necesitaViaje || proximoPartido.necesitaViaje"
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-md text-xs font-bold"
                  >
                    <Car class="w-3.5 h-3.5 text-amber-700" />
                    Requiere viaje / traslado
                  </span>
                  <span
                    v-else
                    class="text-xs text-zinc-600 font-medium"
                  >
                    Zona local urbana
                  </span>

                  <span v-if="proximoPartido.detalle" class="text-xs text-zinc-700 font-medium italic">
                    "{{ proximoPartido.detalle }}"
                  </span>
                </div>

                <router-link
                  to="/partidos"
                  class="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-black underline"
                >
                  Detalles de la designación <ArrowRight class="w-3.5 h-3.5" />
                </router-link>
              </div>
            </div>

            <!-- Caso sin partido próximo -->
            <div v-else class="text-center py-6">
              <p class="text-base font-bold text-zinc-800">No tenés partidos designados actualmente.</p>
              <p class="text-xs text-zinc-600 mt-1 font-medium">
                Recordá confirmar tu disponibilidad para sábado y domingo en la parte superior.
              </p>
            </div>
          </div>
        </section>

        <!-- KPI GRID: Métricas y Balances Clave -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- KPI 1: Partidos dirigidos en el período -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Partidos Dirigidos</span>
              <TrendingUp class="w-4 h-4 text-emerald-600" />
            </div>
            <div class="text-2xl font-black text-zinc-900">
              {{ estadisticas?.totalPartidosDirigidos ?? 0 }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              En {{ estadisticas?.totalDesignaciones ?? 0 }} jornadas asignadas
            </div>
          </div>

          <!-- KPI 2: Monto Percibido -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Monto Percibido</span>
              <DollarSign class="w-4 h-4 text-zinc-900" />
            </div>
            <div class="text-2xl font-black text-zinc-900">
              {{ formatMoneda(estadisticas?.totalMontoPercibido) }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              Acumulado del período
            </div>
          </div>

          <!-- KPI 3: Deuda Préstamos Pendiente -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Deuda Préstamos</span>
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <div class="text-2xl font-black" :class="(estadoCuenta?.totalDeudaPrestamos || 0) > 0 ? 'text-rose-600' : 'text-zinc-900'">
              {{ formatMoneda(estadoCuenta?.totalDeudaPrestamos) }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              {{ estadoCuenta?.cantidadPrestamosActivos ?? 0 }} préstamo(s) activo(s)
            </div>
          </div>

          <!-- KPI 4: Gastos por Recupero -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Gastos Recupero</span>
              <AlertTriangle class="w-4 h-4 text-amber-600" />
            </div>
            <div class="text-2xl font-black" :class="(estadoCuenta?.totalGastosRecupero || 0) > 0 ? 'text-amber-600' : 'text-zinc-900'">
              {{ formatMoneda(estadoCuenta?.totalGastosRecupero) }}
            </div>
            <div class="text-xs text-zinc-600 font-semibold mt-1">
              Indumentaria / viáticos pendientes
            </div>
          </div>
        </div>

        <!-- Accesos Rápidos Tácticos -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <router-link
            to="/disponibilidad"
            class="p-5 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl shadow-xs transition group"
          >
            <div class="flex items-center justify-between mb-2">
              <Clock class="w-5 h-5 text-emerald-600" />
              <ArrowRight class="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition" />
            </div>
            <h3 class="text-base font-bold text-zinc-900">Gestionar Disponibilidad</h3>
            <p class="text-xs text-zinc-600 font-medium mt-1">
              Actualizá tus días disponibles para sábado y domingo antes del cierre de designaciones.
            </p>
          </router-link>

          <router-link
            to="/finanzas"
            class="p-5 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl shadow-xs transition group"
          >
            <div class="flex items-center justify-between mb-2">
              <DollarSign class="w-5 h-5 text-zinc-900" />
              <ArrowRight class="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition" />
            </div>
            <h3 class="text-base font-bold text-zinc-900">Estado de Cuenta</h3>
            <p class="text-xs text-zinc-600 font-medium mt-1">
              Revisá cuotas de préstamos, deducciones y conceptos de recupero asignados.
            </p>
          </router-link>

          <router-link
            to="/estadisticas"
            class="p-5 bg-white border border-zinc-200 hover:border-zinc-900 rounded-2xl shadow-xs transition group"
          >
            <div class="flex items-center justify-between mb-2">
              <TrendingUp class="w-5 h-5 text-emerald-600" />
              <ArrowRight class="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition" />
            </div>
            <h3 class="text-base font-bold text-zinc-900">Rendimiento y Canchas</h3>
            <p class="text-xs text-zinc-600 font-medium mt-1">
              Consultá tus números por cancha, categorías y porcentajes de partidos completados.
            </p>
          </router-link>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

