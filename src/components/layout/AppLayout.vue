<script setup>
import { ref, onMounted, provide } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '../../services/authService'
import { arbitroService } from '../../services/arbitroService'
import { useToast } from '../../composables/useToast'
import {
  Home,
  Calendar,
  Clock,
  Wallet,
  BarChart3,
  AlertOctagon,
  User,
  LogOut,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  ShieldCheck
} from "@lucide/vue"

const router = useRouter()
const route = useRoute()
const toast = useToast()

const arbitro = ref(null)
const disponibilidad = ref({
  disponibleSabado: false,
  disponibleDomingo: false,
  estado: true
})
const loadingDisponibilidad = ref(false)
const mobileMenuOpen = ref(false)

provide('arbitro', arbitro)
provide('disponibilidad', disponibilidad)

const navItems = [
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Mis Partidos', path: '/partidos', icon: Calendar },
  { name: 'Disponibilidad', path: '/disponibilidad', icon: Clock },
  { name: 'Finanzas', path: '/finanzas', icon: Wallet },
  { name: 'Estadísticas', path: '/estadisticas', icon: BarChart3 },
  { name: 'Sanciones', path: '/sanciones', icon: AlertOctagon },
  { name: 'Mi Perfil', path: '/perfil', icon: User }
]

const mobileBottomNavItems = [
  { name: 'Inicio', path: '/', icon: Home },
  { name: 'Partidos', path: '/partidos', icon: Calendar },
  { name: 'Guardia', path: '/disponibilidad', icon: Clock },
  { name: 'Finanzas', path: '/finanzas', icon: Wallet },
  { name: 'Perfil', path: '/perfil', icon: User }
]

async function cargarDatosGenerales() {
  try {
    const [perfilData, dispData] = await Promise.allSettled([
      arbitroService.getPerfil(),
      arbitroService.getDisponibilidad()
    ])

    if (perfilData.status === 'fulfilled' && perfilData.value) {
      arbitro.value = perfilData.value
    }
    if (dispData.status === 'fulfilled' && dispData.value) {
      disponibilidad.value = {
        disponibleSabado: !!dispData.value.disponibleSabado,
        disponibleDomingo: !!dispData.value.disponibleDomingo,
        estado: dispData.value.estado !== false
      }
    }
  } catch (err) {
    console.error('Error cargando datos de cabecera:', err)
  }
}

async function toggleDia(dia) {
  loadingDisponibilidad.value = true
  const actualSabado = disponibilidad.value.disponibleSabado
  const actualDomingo = disponibilidad.value.disponibleDomingo

  const nuevoSabado = dia === 'sabado' ? !actualSabado : actualSabado
  const nuevoDomingo = dia === 'domingo' ? !actualDomingo : actualDomingo

  try {
    await arbitroService.guardarDisponibilidad({
      disponibleSabado: nuevoSabado,
      disponibleDomingo: nuevoDomingo,
      estado: disponibilidad.value.estado
    })
    disponibilidad.value.disponibleSabado = nuevoSabado
    disponibilidad.value.disponibleDomingo = nuevoDomingo
    toast.success(`Disponibilidad ${dia === 'sabado' ? 'Sábado' : 'Domingo'} actualizada`)
  } catch (err) {
    toast.error(err.message || 'No se pudo actualizar disponibilidad')
  } finally {
    loadingDisponibilidad.value = false
  }
}

async function handleLogout() {
  await authService.logout()
  toast.info('Sesión cerrada')
  router.push('/login')
}

onMounted(() => {
  cargarDatosGenerales()
})
</script>

<template>
  <div class="min-h-screen bg-zinc-100 flex flex-col text-zinc-900">
    <!-- Topbar Header -->
    <header class="sticky top-0 z-30 bg-white border-b border-zinc-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo y Título -->
        <div class="flex items-center gap-3">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="lg:hidden p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>

          <router-link to="/" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <ShieldCheck class="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span class="font-extrabold tracking-tight text-base sm:text-lg block leading-none">PANEL ÁRBITRO</span>
              <span class="text-[11px] text-zinc-700 tracking-wide">COLEGIO ARBITRAL</span>
            </div>
          </router-link>
        </div>

        <!-- Widget Rápido Disponibilidad Finde (Visible en tablet y desktop) -->
        <div class="hidden sm:flex items-center gap-2 bg-zinc-100/90 border border-zinc-200 rounded-lg p-1 text-xs">
          <span class="font-semibold text-zinc-700 px-2">Fin de Semana:</span>
          <button
            @click="toggleDia('sabado')"
            :disabled="loadingDisponibilidad"
            class="px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5"
            :class="disponibilidad.disponibleSabado ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'"
          >
            <CheckCircle2 v-if="disponibilidad.disponibleSabado" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5 text-zinc-600" />
            SÁB
          </button>
          <button
            @click="toggleDia('domingo')"
            :disabled="loadingDisponibilidad"
            class="px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1.5"
            :class="disponibilidad.disponibleDomingo ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-zinc-700 hover:bg-zinc-50 border border-zinc-200'"
          >
            <CheckCircle2 v-if="disponibilidad.disponibleDomingo" class="w-3.5 h-3.5" />
            <XCircle v-else class="w-3.5 h-3.5 text-zinc-600" />
            DOM
          </button>
        </div>

        <!-- Usuario y Salir -->
        <div class="flex items-center gap-3">
          <router-link
            to="/perfil"
            class="flex items-center gap-2.5 hover:bg-zinc-50 p-1.5 rounded-lg transition text-left"
          >
            <div class="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              {{ (arbitro?.nombre?.[0] || 'A') + (arbitro?.apellido?.[0] || '') }}
            </div>
            <div class="hidden md:block">
              <div class="text-xs font-bold leading-tight truncate max-w-32.5">
                {{ arbitro ? `${arbitro.apellido || ''} ${arbitro.nombre || ''}`.trim() : 'Árbitro' }}
              </div>
              <div class="text-[10px] text-zinc-700 font-semibold flex items-center gap-1">
                <span>{{ arbitro?.categoria || 'ARBITRO' }}</span>
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
            </div>
          </router-link>

          <button
            @click="handleLogout"
            title="Cerrar sesión"
            class="p-2 text-zinc-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            aria-label="Cerrar sesión"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Barra de disponibilidad rápida en móvil -->
      <div class="sm:hidden px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs">
        <span class="font-bold text-zinc-700">Disponibilidad fin de semana:</span>
        <div class="flex gap-2">
          <button
            @click="toggleDia('sabado')"
            :disabled="loadingDisponibilidad"
            class="px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border"
            :class="disponibilidad.disponibleSabado ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-700 border-zinc-300'"
          >
            SÁB {{ disponibilidad.disponibleSabado ? '✓' : '✗' }}
          </button>
          <button
            @click="toggleDia('domingo')"
            :disabled="loadingDisponibilidad"
            class="px-2.5 py-1 rounded text-xs font-bold transition flex items-center gap-1 border"
            :class="disponibilidad.disponibleDomingo ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-700 border-zinc-300'"
          >
            DOM {{ disponibilidad.disponibleDomingo ? '✓' : '✗' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Menú Desplegable Móvil -->
    <div
      v-if="mobileMenuOpen"
      class="lg:hidden fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-xs flex"
      @click.self="mobileMenuOpen = false"
    >
      <div class="w-72 bg-white h-full shadow-2xl flex flex-col p-5">
        <div class="flex items-center justify-between pb-4 border-b border-zinc-200">
          <span class="font-bold text-zinc-900 text-base">Navegación</span>
          <button @click="mobileMenuOpen = false" class="p-1 rounded text-zinc-600 hover:text-zinc-900">
            <X class="w-5 h-5" />
          </button>
        </div>

        <nav class="mt-4 flex flex-col gap-1 flex-1">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition"
            :class="route.path === item.path ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:bg-zinc-100'"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span>{{ item.name }}</span>
          </router-link>
        </nav>

        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 transition border border-rose-200 mt-auto"
        >
          <LogOut class="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>

    <!-- Cuerpo Principal con Sidebar Desktop -->
    <div class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-8">
      <!-- Sidebar Desktop -->
      <aside class="hidden lg:block w-60 shrink-0">
        <div class="sticky top-24 bg-white border border-zinc-200 rounded-xl p-3 shadow-xs">
          <nav class="flex flex-col gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition"
              :class="route.path === item.path ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-700 hover:bg-zinc-100'"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span>{{ item.name }}</span>
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- Contenido Principal -->
      <main class="flex-1 min-w-0 pb-20 lg:pb-6">
        <slot />
      </main>
    </div>

    <!-- Barra de Navegación Inferior Móvil -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-zinc-200 shadow-lg">
      <div class="grid grid-cols-5 h-16">
        <router-link
          v-for="item in mobileBottomNavItems"
          :key="item.path"
          :to="item.path"
          class="flex flex-col items-center justify-center gap-1 transition"
          :class="route.path === item.path ? 'text-zinc-900 font-bold' : 'text-zinc-600 font-medium hover:text-zinc-900'"
        >
          <component :is="item.icon" class="w-5 h-5" :class="route.path === item.path ? 'stroke-[2.5]' : 'stroke-2'" />
          <span class="text-[11px] leading-none">{{ item.name }}</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

