<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import {
  Wallet,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Calendar,
  Layers
} from "@lucide/vue"

const loading = ref(true)
const estadoCuenta = ref(null)

async function cargarFinanzas() {
  loading.value = true
  try {
    const data = await arbitroService.getEstadoCuenta()
    estadoCuenta.value = data
  } catch (err) {
    console.error('Error al cargar estado de cuenta:', err)
  } finally {
    loading.value = false
  }
}

function formatMoneda(val) {
  if (val === undefined || val === null) return '$0'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val)
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '-'
  return new Date(fechaStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  cargarFinanzas()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Encabezado -->
      <div class="pb-2 border-b border-zinc-200">
        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Estado de Cuenta y Finanzas</h1>
        <p class="text-xs sm:text-sm text-zinc-600 font-medium">
          Consolidado de préstamos otorgados, cuotas activas y gastos sujetos a recupero.
        </p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Cargando balances financieros...</span>
      </div>

      <template v-else>
        <!-- Resumen de Balances -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <!-- Saldo Total Préstamos -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Total Deuda Préstamos</span>
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div class="text-3xl font-black text-rose-600">
              {{ formatMoneda(estadoCuenta?.totalDeudaPrestamos) }}
            </div>
            <div class="text-xs text-zinc-600 font-medium mt-1">
              {{ estadoCuenta?.cantidadPrestamosActivos ?? 0 }} crédito(s) en curso
            </div>
          </div>

          <!-- Total Gastos Sujetos a Recupero -->
          <div class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600">Gastos por Recupero</span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            </div>
            <div class="text-3xl font-black text-amber-600">
              {{ formatMoneda(estadoCuenta?.totalGastosRecupero) }}
            </div>
            <div class="text-xs text-zinc-600 font-medium mt-1">
              Indumentaria, viáticos y tarjetas
            </div>
          </div>

          <!-- Balance Total Pendiente de Liquidación -->
          <div class="bg-white border-2 border-zinc-900 rounded-2xl p-5 shadow-xs">
            <div class="flex items-center justify-between text-zinc-600 mb-2">
              <span class="text-xs font-black uppercase tracking-wider text-zinc-900">Total a Liquidar</span>
              <Wallet class="w-5 h-5 text-zinc-900" />
            </div>
            <div class="text-3xl font-black text-zinc-950">
              {{ formatMoneda((estadoCuenta?.totalDeudaPrestamos || 0) + (estadoCuenta?.totalGastosRecupero || 0)) }}
            </div>
            <div class="text-xs text-zinc-600 font-medium mt-1">
              Descontable en próximas liquidaciones
            </div>
          </div>
        </div>

        <!-- Detalle de Préstamos y Cuotas -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h2 class="text-lg font-black text-zinc-900">Préstamos Institucionales</h2>
              <p class="text-xs text-zinc-600 font-medium">Líneas de auxilio financiero y equipamiento concedidas.</p>
            </div>
            <span class="text-xs font-bold px-3 py-1 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
              {{ estadoCuenta?.cantidadPrestamosActivos ?? 0 }} Activos
            </span>
          </div>

          <div v-if="estadoCuenta?.prestamos && estadoCuenta.prestamos.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs uppercase bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th class="py-3 px-4">Fecha Solicitud</th>
                  <th class="py-3 px-4">Monto Solicitado</th>
                  <th class="py-3 px-4">Saldo Pendiente</th>
                  <th class="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 font-medium">
                <tr v-for="p in estadoCuenta.prestamos" :key="p.idPrestamo || p.id">
                  <td class="py-3 px-4">{{ formatFecha(p.fechaSolicitud) }}</td>
                  <td class="py-3 px-4 font-bold">{{ formatMoneda(p.montoSolicitado) }}</td>
                  <td class="py-3 px-4 text-rose-600 font-bold">{{ formatMoneda(p.saldoPendiente || p.montoSolicitado) }}</td>
                  <td class="py-3 px-4">
                    <span class="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
                      {{ p.estado || 'Activo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-6 text-zinc-600 text-xs font-medium">
            No registrás préstamos activos con el Colegio Arbitral.
          </div>
        </div>

        <!-- Detalle de Gastos por Recupero -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-200 pb-3">
            <div>
              <h2 class="text-lg font-black text-zinc-900">Detalle de Gastos Sujetos a Recupero</h2>
              <p class="text-xs text-zinc-600 font-medium">Conceptos anticipados por tesorería deducibles de aranceles.</p>
            </div>
            <span class="text-xs font-bold px-3 py-1 bg-zinc-100 rounded-lg text-zinc-800 border border-zinc-200">
              Total: {{ formatMoneda(estadoCuenta?.totalGastosRecupero) }}
            </span>
          </div>

          <div v-if="estadoCuenta?.gastosRecupero && estadoCuenta.gastosRecupero.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="text-xs uppercase bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                <tr>
                  <th class="py-3 px-4">Fecha</th>
                  <th class="py-3 px-4">Concepto / Motivo</th>
                  <th class="py-3 px-4">Monto</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 font-medium">
                <tr v-for="g in estadoCuenta.gastosRecupero" :key="g.idGasto || g.id">
                  <td class="py-3 px-4">{{ formatFecha(g.fecha) }}</td>
                  <td class="py-3 px-4">{{ g.descripcion || 'Gasto operativo' }}</td>
                  <td class="py-3 px-4 font-bold text-amber-700">{{ formatMoneda(g.monto) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-6 text-zinc-600 text-xs font-medium">
            No registrás gastos de recupero pendientes.
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

