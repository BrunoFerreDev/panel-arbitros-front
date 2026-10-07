<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'
import { useToast } from '../composables/useToast'
import { ShieldCheck, Phone, Lock, ArrowRight, AlertCircle } from "@lucide/vue"

const router = useRouter()
const toast = useToast()

const whatsapp = ref('')
const contrasenia = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  if (!whatsapp.value.trim() || !contrasenia.value.trim()) {
    error.value = 'Ingresá tu WhatsApp y contraseña'
    return
  }

  loading.value = true
  try {
    await authService.login(whatsapp.value.trim(), contrasenia.value.trim())
    toast.success('Bienvenido al Panel Arbitral')
    router.push('/')
  } catch (err) {
    error.value = err.message || 'Credenciales incorrectas o servidor no disponible'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-xl p-8">
      <!-- Encabezado con Escudo / Silbato -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-900 text-white mb-3 shadow-md">
          <ShieldCheck class="w-8 h-8 text-emerald-400" />
        </div>
        <h1 class="text-2xl font-black tracking-tight text-zinc-900">PANEL DE ÁRBITRO</h1>
        <p class="text-xs font-semibold text-zinc-700 tracking-wider mt-1 uppercase">Colegio de Árbitros &bull; Autogestión</p>
      </div>

      <!-- Banner de Error -->
      <div
        v-if="error"
        class="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 font-medium"
      >
        <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <span>{{ error }}</span>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5" for="whatsapp">
            Número de WhatsApp
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
              <Phone class="w-4 h-4" />
            </div>
            <input
              id="whatsapp"
              v-model="whatsapp"
              type="text"
              inputmode="numeric"
              autocomplete="tel"
              required
              placeholder="Ej: 3815123456"
              class="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
            />
          </div>
          <span class="text-[11px] text-zinc-600 mt-1 block">Número registrado en el padrón oficial</span>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5" for="contrasenia">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-600">
              <Lock class="w-4 h-4" />
            </div>
            <input
              id="contrasenia"
              v-model="contrasenia"
              type="password"
              autocomplete="current-password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 placeholder-zinc-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 px-4 bg-zinc-900 hover:bg-black text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 text-sm tracking-wide"
        >
          <span v-if="!loading">INGRESAR AL PANEL</span>
          <span v-else>VERIFICANDO...</span>
          <ArrowRight v-if="!loading" class="w-4 h-4" />
        </button>
      </form>

      <!-- Pie informativo -->
      <div class="mt-8 pt-6 border-t border-zinc-200 text-center">
        <p class="text-xs text-zinc-600 font-medium">
          ¿Problemas para acceder? Contactá a Secretaría del Colegio.
        </p>
      </div>
    </div>
  </div>
</template>

