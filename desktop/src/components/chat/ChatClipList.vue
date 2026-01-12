<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useVideoPlayerStore } from '@/stores/videoPlayer'
import { getVideoUrl, formatTimeRange } from '@/types/video'

const chatStore = useChatStore()
const playerStore = useVideoPlayerStore()

// Actions
const playClip = (clip: any) => {
  playerStore.openVideo(clip.video_id, {
    chunkId: clip.chunk_id,
    startTime: clip.start_time,
    endTime: clip.end_time
  })
}

const removeClip = (chunkId: string) => {
  chatStore.removeClip(chunkId)
}
</script>

<template>
  <div class="flex gap-4 overflow-x-auto pb-2 hide-scroll">
    <!-- Clip Card -->
    <div 
        v-for="clip in chatStore.attachedClips" 
        :key="clip.chunk_id"
        class="relative group flex-shrink-0 w-80 bg-white rounded-lg border border-slate-200 overflow-hidden flex shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        @click="playClip(clip)"
    >
      <!-- Thumbnail -->
      <div class="w-24 bg-slate-200 relative flex-shrink-0">
         <img
            v-if="clip.representative_frame"
            :src="getVideoUrl(clip.representative_frame)"
            class="h-full w-full object-cover"
         />
         <div v-else class="h-full w-full bg-gradient-to-br from-slate-300 to-slate-400"></div>
         
         <div class="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
            <span class="material-symbols-outlined text-white/80 text-2xl">play_circle</span>
         </div>
      </div>

      <!-- Content -->
      <div class="p-3 flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div class="text-sm font-medium text-slate-900 truncate" :title="clip.title">
            {{ clip.title }}
        </div>
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <span class="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
            {{ formatTimeRange(clip.start_time, clip.end_time) }}
          </span>
          <span v-if="clip.score" class="text-green-600 font-medium">
             {{ Math.round(clip.score * 100) }}%
          </span>
        </div>
      </div>

      <!-- Remove Button -->
      <button 
        @click.stop="removeClip(clip.chunk_id)"
        class="absolute top-1 right-1 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>

    <!-- Add Button (Placeholder/Navigation) -->
    <router-link to="/search" class="flex-shrink-0 w-24 border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-primary/5 rounded-lg flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-primary transition-all group">
      <span class="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">add</span>
      <span class="text-[10px] font-medium">Add</span>
    </router-link>
  </div>
</template>

<style scoped>
/* Scoped styles if needed, but 'hide-scroll' is in global or parent */
</style>