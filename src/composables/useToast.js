import { ref } from 'vue'

const toasts = ref([])
let nextId = 1

export function useToast() {
  function addToast({ message, type = 'info', duration = 3500 }) {
    const id = nextId++
    toasts.value.push({ id, message, type })

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    addToast,
    removeToast,
    success: (message, duration) => addToast({ message, type: 'success', duration }),
    error: (message, duration) => addToast({ message, type: 'error', duration }),
    warning: (message, duration) => addToast({ message, type: 'warning', duration }),
    info: (message, duration) => addToast({ message, type: 'info', duration })
  }
}

