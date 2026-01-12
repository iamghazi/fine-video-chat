<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VideoMetadata } from '@/types/video'
import { formatDuration, getVideoStatus } from '@/types/video'
import { useVideoPlayerStore } from '@/stores/videoPlayer'

interface Props {
  video: VideoMetadata
}

const props = defineProps<Props>()

const emit = defineEmits<{
  delete: [videoId: string]
}>()

const playerStore = useVideoPlayerStore()
const showDeleteConfirm = ref(false)

// Computed
const thumbnailUrl = computed(() => {
  // Use first frame from first chunk as thumbnail or placeholder
  return '' 
})

const statusInfo = computed(() => {
  const status = getVideoStatus(props.video)
  // Design has specific logic: Green dot + "Indexed" text, or Red + "Failed"
  switch (status) {
    case 'indexed':
      return { label: 'Indexed', color: 'bg-green-500', text: 'text-slate-600' }
    case 'processing':
      return { label: 'Processing', color: 'bg-yellow-500', text: 'text-slate-600' }
    case 'failed':
      return { label: 'Failed', color: 'bg-red-500', text: 'text-slate-600' }
    default:
      return { label: 'Unknown', color: 'bg-slate-500', text: 'text-slate-600' }
  }
})

const formattedDuration = computed(() => {
  return formatDuration(props.video.duration_seconds)
})

const uploadDate = computed(() => {
  const date = new Date(props.video.uploaded_at)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

// Actions
const playVideo = () => {
  playerStore.openVideo(props.video.video_id)
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteVideo = () => {
  emit('delete', props.video.video_id)
  showDeleteConfirm.value = false
}
</script>

<template>
  <div class="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden flex flex-col relative">

    <!-- Thumbnail Section -->
    <div class="relative aspect-video bg-slate-100 overflow-hidden" @click="playVideo">
      <img
        v-if="thumbnailUrl"
        :src="thumbnailUrl"
        :alt="video.title"
        class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <!-- Gradient Placeholder -->
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90 group-hover:scale-105 transition-transform duration-500"
      ></div>

      <!-- Duration Badge -->
      <div class="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-1.5 py-0.5 rounded">
        {{ formattedDuration }}
      </div>

      <!-- Hover Overlay (Play Button) -->
      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
        <button class="w-10 h-10 rounded-full bg-white/20 hover:bg-white backdrop-blur-sm flex items-center justify-center text-white hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[24px] ml-0.5">play_arrow</span>
        </button>
      </div>
    </div>

    <!-- Content Section -->
    <div class="p-4 flex flex-col flex-1">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors" :title="video.title">
            {{ video.title }}
        </h3>
        <button @click.stop="confirmDelete" class="text-slate-400 hover:text-red-600 transition-colors" title="Delete Video">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      <div class="mt-auto space-y-2">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="material-symbols-outlined text-[14px]">calendar_today</span>
          <span>{{ uploadDate }}</span>
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1.5">
            <div :class="['w-2 h-2 rounded-full', statusInfo.color]"></div>
            <span :class="['text-xs font-medium', statusInfo.text]">{{ statusInfo.label }}</span>
          </div>
          <!-- Chunk count placeholder since backend might not send it yet, or use generic logic -->
           <span class="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
             {{ Math.ceil(video.duration_seconds / 300) }} Chunks
           </span>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div
        v-if="showDeleteConfirm"
        class="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        @click.stop
      >
        <div class="w-full max-w-[90%] rounded-lg bg-white p-4 shadow-xl text-center">
          <h4 class="mb-2 text-sm font-bold text-slate-900">Delete?</h4>
          <div class="flex gap-2 justify-center">
            <button
              class="rounded bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              class="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
              @click="deleteVideo"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
