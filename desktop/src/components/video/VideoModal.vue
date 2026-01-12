<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useVideoPlayerStore } from '@/stores/videoPlayer'
import { getVideoUrl } from '@/types/video'
import VideoPlayer from './VideoPlayer.vue'
import ChunkMetadataPanel from './ChunkMetadataPanel.vue'

const playerStore = useVideoPlayerStore()

const playerRef = ref<InstanceType<typeof VideoPlayer> | null>(null)

// Computed
const videoSrc = computed(() => {
  if (!playerStore.videoMetadata?.file_path) return ''
  return getVideoUrl(playerStore.videoMetadata.file_path)
})

const currentChunk = computed(() => {
  if (!playerStore.currentChunkId) return null
  return playerStore.chunks.find((c) => c.chunk_id === playerStore.currentChunkId) || null
})

// Handle ESC key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && playerStore.isModalOpen) {
    closeModal()
  }
}

// Handle click outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('modal-overlay')) {
    closeModal()
  }
}

const closeModal = () => {
  playerStore.closeVideo()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})

// Watch for modal open/close to handle body scroll
watch(
  () => playerStore.isModalOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="playerStore.isModalOpen"
      class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click="handleClickOutside"
    >
      <div
        class="modal-content relative flex h-full max-h-[90vh] w-full max-w-7xl flex-col gap-6 rounded-xl bg-white p-6 shadow-2xl lg:flex-row"
        @click.stop
      >
        <!-- Close button -->
        <button
          class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900"
          @click="closeModal"
          aria-label="Close"
        >
          <span class="material-symbols-outlined text-[24px]">close</span>
        </button>

        <!-- Video Player Section -->
        <div class="flex flex-1 flex-col">
          <div v-if="playerStore.loading" class="flex h-full items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <div class="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary"></div>
              <p class="text-sm text-slate-500">Loading video...</p>
            </div>
          </div>

          <div v-else-if="playerStore.error" class="flex h-full items-center justify-center">
            <div class="text-red-600">{{ playerStore.error }}</div>
          </div>

          <div v-else-if="videoSrc" class="h-full rounded-lg overflow-hidden bg-black">
            <VideoPlayer
              ref="playerRef"
              :src="videoSrc"
              :start-time="playerStore.startTime"
              :autoplay="true"
            />
          </div>

          <div v-else class="flex h-full items-center justify-center">
            <div class="text-slate-500">No video loaded</div>
          </div>
        </div>

        <!-- Metadata Panel Section -->
        <div class="w-full overflow-y-auto lg:w-96">
          <ChunkMetadataPanel
            v-if="currentChunk"
            :chunk="currentChunk"
            :video-title="playerStore.videoMetadata?.title || 'Unknown'"
          />

          <div v-else-if="playerStore.videoMetadata" class="space-y-4">
            <h3 class="text-xl font-bold text-slate-900">
              {{ playerStore.videoMetadata.title }}
            </h3>
            <div class="space-y-2 text-sm text-slate-600">
              <p>
                <span class="font-medium text-slate-700">Duration:</span>
                {{ Math.floor(playerStore.videoMetadata.duration_seconds / 60) }}m
                {{ Math.floor(playerStore.videoMetadata.duration_seconds % 60) }}s
              </p>
              <p>
                <span class="font-medium text-slate-700">Resolution:</span>
                {{ playerStore.videoMetadata.resolution[0] }}x{{
                  playerStore.videoMetadata.resolution[1]
                }}
              </p>
              <p>
                <span class="font-medium text-slate-700">FPS:</span>
                {{ playerStore.videoMetadata.fps }}
              </p>
              <p>
                <span class="font-medium text-slate-700">Size:</span>
                {{ playerStore.videoMetadata.file_size_mb.toFixed(2) }} MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-content {
  animation: modal-slide-up 0.3s ease;
}

@keyframes modal-slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Custom scrollbar for metadata panel */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgb(241 245 249); /* slate-100 */
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgb(203 213 225); /* slate-300 */
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgb(148 163 184); /* slate-400 */
}
</style>
