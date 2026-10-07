<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/layout/AppLayout.vue'
import { arbitroService } from '../services/arbitroService'
import { authService } from '../services/authService'
import { useToast } from '../composables/useToast'
import {
  User,
  Phone,
  Shield,
  Shirt,
  Car,
  Lock,
  LogOut,
  Save,
  CheckCircle2,
  Loader2,
  AlertCircle
} from "@lucide/vue"

const router = useRouter()
const toast = useToast()

const loading = ref(true)
const perfil = ref(null)

// Contraseña
const contraseniaActual = ref('')
const nuevaContrasenia = ref('')
const confirmarContrasenia = ref('')
const cambiandoPass = ref(false)
const passError = ref('')

async function cargarPerfil() {
  loading.value = true
  try {
    const data = await arbitroService.getPerfil()
    perfil.value = data
  } catch (err) {
    toast.error(err.message || 'Error al cargar perfil')
  } finally {
    loading.value = false
  }
}

async function handleCambiarContrasenia() {
  passError.value = ''

  if (!contraseniaActual.value) {
    passError.value = 'Ingresá tu contraseña actual'
    return
  }
  if (!nuevaContrasenia.value || nuevaContrasenia.value.length < 6) {
    passError.value = 'La nueva contraseña debe tener al menos 6 caracteres'
    return
  }
  if (nuevaContrasenia.value !== confirmarContrasenia.value) {
    passError.value = 'Las nuevas contraseñas no coinciden'
    return
  }

  cambiandoPass.value = true
  try {
    await arbitroService.cambiarContrasenia(contraseniaActual.value, nuevaContrasenia.value)
    toast.success('Contraseña actualizada correctamente')
    contraseniaActual.value = ''
    nuevaContrasenia.value = ''
    confirmarContrasenia.value = ''
  } catch (err) {
    passError.value = err.message || 'No se pudo cambiar la contraseña. Verificá la clave actual.'
    toast.error(passError.value)
  } finally {
    cambiandoPass.value = false
  }
}

async function handleLogout() {
  await authService.logout()
  toast.info('Sesión finalizada')
  router.push('/login')
}

onMounted(() => {
  cargarPerfil()
})
</script>

<template>
  <AppLayout>
    <div class="space-y-6 max-w-4xl">
      <!-- Encabezado -->
      <div class="pb-2 border-b border-zinc-200">
        <h1 class="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">Mi Perfil Arbitral</h1>
        <p class="text-xs sm:text-sm text-zinc-600 font-medium">
          Ficha del padrón, credenciales de acceso y equipamiento oficial.
        </p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="py-16 text-center text-zinc-600 flex flex-col items-center justify-center">
        <Loader2 class="w-8 h-8 animate-spin text-zinc-900 mb-2" />
        <span class="text-xs font-bold uppercase tracking-wider">Cargando datos del árbitro...</span>
      </div>

      <template v-else>
        <!-- Ficha de Datos Personales -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-xl shadow-sm">
                {{ (perfil?.nombre?.[0] || 'A') + (perfil?.apellido?.[0] || '') }}
              </div>
              <div>
                <h2 class="text-xl font-black text-zinc-900">
                  {{ perfil?.apellido }}, {{ perfil?.nombre }}
                </h2>
                <div class="flex items-center gap-2 text-xs font-semibold text-zinc-600 mt-0.5">
                  <Phone class="w-3.5 h-3.5 text-zinc-500" />
                  <span>{{ perfil?.whatsapp || 'Sin WhatsApp registrado' }}</span>
                </div>
              </div>
            </div>

            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 w-fit">
              <CheckCircle2 class="w-3.5 h-3.5" />
              ÁRBITRO HABILITADO
            </span>
          </div>

          <!-- Grilla de Atributos -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Categoría -->
            <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">Categoría Arbitral</span>
              <span class="text-base font-black text-zinc-900">{{ perfil?.categoria || 'No asignada' }}</span>
            </div>

            <!-- Talles Indumentaria -->
            <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">Talle Oficial</span>
              <span class="text-base font-black text-zinc-900">
                Camiseta: {{ perfil?.talleCamiseta || 'N/A' }} &bull; Short: {{ perfil?.talleShort || 'N/A' }}
              </span>
            </div>

            <!-- Movilidad / Auto -->
            <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">Movilidad Propia</span>
              <span class="text-base font-black" :class="perfil?.tieneAuto ? 'text-emerald-700' : 'text-zinc-700'">
                {{ perfil?.tieneAuto ? 'Cuenta con Vehículo' : 'Sin Vehículo Propio' }}
              </span>
            </div>

            <!-- Roles del Sistema -->
            <div class="p-4 bg-zinc-50 border border-zinc-200 rounded-xl sm:col-span-2 lg:col-span-3">
              <span class="text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-2">Roles Asignados</span>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="rol in (perfil?.roles || ['ARBITRO'])"
                  :key="rol"
                  class="px-2.5 py-1 bg-zinc-900 text-white rounded-md text-xs font-black tracking-wider uppercase"
                >
                  {{ rol }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulario: Cambiar Contraseña -->
        <div class="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div class="border-b border-zinc-200 pb-3">
            <h2 class="text-lg font-black text-zinc-900">Seguridad de la Cuenta</h2>
            <p class="text-xs text-zinc-600 font-medium">Modificá tu clave de acceso personal para ingresar al panel.</p>
          </div>

          <div
            v-if="passError"
            class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 font-medium"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{{ passError }}</span>
          </div>

          <form @submit.prevent="handleCambiarContrasenia" class="space-y-4 max-w-md">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="passActual">
                Contraseña Actual
              </label>
              <input
                id="passActual"
                v-model="contraseniaActual"
                type="password"
                autocomplete="current-password"
                required
                class="w-full py-2.5 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="passNueva">
                Nueva Contraseña
              </label>
              <input
                id="passNueva"
                v-model="nuevaContrasenia"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                placeholder="Mínimo 6 caracteres"
                class="w-full py-2.5 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1" for="passConfirm">
                Confirmar Nueva Contraseña
              </label>
              <input
                id="passConfirm"
                v-model="confirmarContrasenia"
                type="password"
                autocomplete="new-password"
                required
                minlength="6"
                placeholder="Repetí la contraseña"
                class="w-full py-2.5 px-3 bg-zinc-50 border border-zinc-300 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>

            <button
              type="submit"
              :disabled="cambiandoPass"
              class="py-2.5 px-5 bg-zinc-900 hover:bg-black text-white font-extrabold rounded-xl text-xs tracking-wider uppercase transition flex items-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Loader2 v-if="cambiandoPass" class="w-4 h-4 animate-spin" />
              <Save v-else class="w-4 h-4" />
              <span>{{ cambiandoPass ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA' }}</span>
            </button>
          </form>
        </div>

        <!-- Cerrar Sesión -->
        <div class="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-black text-rose-950 uppercase tracking-wide">Cierre de Sesión</h3>
            <p class="text-xs text-zinc-600 font-medium">Invalida el token JWT en el dispositivo.</p>
          </div>

          <button
            @click="handleLogout"
            class="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-xs"
          >
            <LogOut class="w-4 h-4" />
            <span>CERRAR SESIÓN</span>
          </button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

