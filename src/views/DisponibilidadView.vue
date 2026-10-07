<script setup>
import { ref, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import { useToast } from '../composables/useToast'
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Loader2,
  CalendarCheck,
  ShieldCheck
} from "@lucide/vue"

const toast = useToast()
const loading = ref(true)
const saving = ref(false)

const disponibleSabado = ref(false)
const disponibleDomingo = ref(false)
const estadoSistema = ref(true)

async function cargarDisponibilidad() {
  loading.value = true
  try {
    const data = await arbitroService.getDisponibilidad()
    if (data) {
      disponibleSabado.value = !!data.disponibleSabado
      disponibleDomingo.value = !!data.disponibleDomingo
      estadoSistema.value = data.estado !== false
    }
  } catch (err) {
    toast.error(err.message || 'Error al consultar disponibilidad')
  } finally {
    loading.value = false
  }
}

async function guardarCambios() {
  saving.value = true
  try {
    await arbitroService.guardarDisponibilidad({
      disponibleSabado: disponibleSabado.value,
      disponibleDomingo: disponibleDomingo.value,
      estado: estadoSistema.value
    })
    toast.success('Disponibilidad de fin de semana guardada con éxito')
  } catch (err) {
    toast.error(err.message || 'No se pudo guardar la disponibilidad')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  cargarDisponibilidad()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-4xl">
      <!-- Encabezado -->
      <div class="pb-2 border-b border-zinc-200">
        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Disponibilidad de Fin de Semana</h1>
        <p class="text-xs sm:text-sm text-zinc-600 font-medium">
          Declaración oficial para la designación de árbitros del próximo fin de semana.
        </p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Cargando disponibilidad...</span>
      </div>

      <template v-else>
        <!-- Tarjetas Interactivas de Días -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- SÁBADO -->
          <div
            class="bg-white border-2 rounded-2xl p-6 shadow-xs transition flex flex-col justify-between"
            :class="disponibleSabado ? 'border-emerald-600 bg-emerald-50/20' : 'border-zinc-300'"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-black uppercase tracking-wider text-zinc-600">Jornada Sábado</span>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-extrabold"
                  :class="disponibleSabado ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100 text-zinc-700'"
                >
                  {{ disponibleSabado ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
                </span>
              </div>

              <h2 class="text-2xl font-black text-zinc-900 mb-2">Sábado</h2>
              <p class="text-xs text-zinc-600 font-medium">
                Partidos de divisiones inferiores, reservas y torneos vespertinos/matutinos.
              </p>
            </div>

            <div class="pt-6">
              <button
                type="button"
                @click="disponibleSabado = !disponibleSabado"
                class="w-full py-3 px-4 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 border"
                :class="disponibleSabado ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200'"
              >
                <CheckCircle2 v-if="disponibleSabado" class="w-4 h-4" />
                <XCircle v-else class="w-4 h-4 text-zinc-600" />
                <span>{{ disponibleSabado ? 'Establecido como Disponible' : 'Marcar Disponible' }}</span>
              </button>
            </div>
          </div>

          <!-- DOMINGO -->
          <div
            class="bg-white border-2 rounded-2xl p-6 shadow-xs transition flex flex-col justify-between"
            :class="disponibleDomingo ? 'border-emerald-600 bg-emerald-50/20' : 'border-zinc-300'"
          >
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-black uppercase tracking-wider text-zinc-600">Jornada Domingo</span>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-extrabold"
                  :class="disponibleDomingo ? 'bg-emerald-100 text-emerald-900' : 'bg-zinc-100 text-zinc-700'"
                >
                  {{ disponibleDomingo ? 'DISPONIBLE' : 'NO DISPONIBLE' }}
                </span>
              </div>

              <h2 class="text-2xl font-black text-zinc-900 mb-2">Domingo</h2>
              <p class="text-xs text-zinc-600 font-medium">
                Partidos de primera división, copas oficiales y cruces interregionales.
              </p>
            </div>

            <div class="pt-6">
              <button
                type="button"
                @click="disponibleDomingo = !disponibleDomingo"
                class="w-full py-3 px-4 rounded-xl font-extrabold text-sm transition flex items-center justify-center gap-2 border"
                :class="disponibleDomingo ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-zinc-100 text-zinc-800 border-zinc-300 hover:bg-zinc-200'"
              >
                <CheckCircle2 v-if="disponibleDomingo" class="w-4 h-4" />
                <XCircle v-else class="w-4 h-4 text-zinc-600" />
                <span>{{ disponibleDomingo ? 'Establecido como Disponible' : 'Marcar Disponible' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón Guardar -->
        <div class="flex justify-end pt-2">
          <button
            @click="guardarCambios"
            :disabled="saving"
            class="py-3 px-6 bg-zinc-900 hover:bg-black text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50 text-sm"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            <span>{{ saving ? 'GUARDANDO...' : 'GUARDAR DISPONIBILIDAD' }}</span>
          </button>
        </div>

        <!-- Información Operativa -->
        <div class="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700">
            <AlertTriangle class="w-4 h-4 text-amber-600" />
            <span>Información Importante para el Árbitro</span>
          </div>
          <ul class="text-xs text-zinc-700 space-y-1.5 list-disc pl-4 font-medium">
            <li>Las designaciones se procesan los días jueves mediante el algoritmo de asignación oficial.</li>
            <li>Si marcás disponibilidad y posteriormente no podés asistir, debés justificarlo formalmente con Secretaría.</li>
            <li>Si no contás con movilidad propia, el designador priorizará asignarte en predios con traslados coordinados.</li>
          </ul>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

