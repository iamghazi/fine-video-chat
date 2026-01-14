<script setup lang="ts">
import { useToastStore, type ToastType } from '@/stores/toast'

const toastStore = useToastStore()

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'error':
      return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
    case 'warning':
      return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    case 'info':
    default:
      return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  }
}

const getToastColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white'
    case 'error':
      return 'bg-red-600 text-white'
    case 'warning':
      return 'bg-yellow-600 text-white'
    case 'info':
    default:
      return 'bg-blue-600 text-white'
  }
}
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex min-w-[320px] items-center gap-3 rounded-lg px-4 py-3 shadow-lg"
        :class="getToastColor(toast.type)"
      >
        <!-- Icon -->
        <svg
          class="h-6 w-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="getToastIcon(toast.type)"
          />
        </svg>

        <!-- Message -->
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>

        <!-- Close Button -->
        <button
          class="flex-shrink-0 rounded p-1 transition-colors hover:bg-white/20"
          @click="toastStore.dismiss(toast.id)"
          aria-label="Dismiss"
        >
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
