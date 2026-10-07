<script setup>
import { useToast } from "../../composables/useToast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "@lucide/vue";

const { toasts, removeToast } = useToast();
</script>

<template>
  <div
    class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
  >
    <transition-group
      enter-active-class="transform ease-out duration-200 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg text-sm bg-white"
        :class="{
          'border-emerald-300 text-emerald-950 bg-emerald-50/90':
            toast.type === 'success',
          'border-rose-300 text-rose-950 bg-rose-50/90': toast.type === 'error',
          'border-amber-300 text-amber-950 bg-amber-50/90':
            toast.type === 'warning',
          'border-zinc-300 text-zinc-900 bg-zinc-50/90': toast.type === 'info',
        }"
      >
        <CheckCircle2
          v-if="toast.type === 'success'"
          class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
        />
        <AlertCircle
          v-else-if="toast.type === 'error'"
          class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
        />
        <AlertTriangle
          v-else-if="toast.type === 'warning'"
          class="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
        />
        <Info v-else class="w-5 h-5 text-zinc-600 shrink-0 mt-0.5" />

        <div class="flex-1 font-medium leading-snug">
          {{ toast.message }}
        </div>

        <button
          @click="removeToast(toast.id)"
          class="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition"
          aria-label="Cerrar notificación"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>
