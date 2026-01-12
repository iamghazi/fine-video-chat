<script setup lang="ts">
import { ref, computed } from 'vue'
import type { SearchResult } from '@/types/video'
import { formatTimeRange, getVideoUrl } from '@/types/video'
import { useVideoPlayerStore } from '@/stores/videoPlayer'
import { useChatStore } from '@/stores/chat'

interface Props {
  result: SearchResult
}

const props = defineProps<Props>()

const playerStore = useVideoPlayerStore()
const chatStore = useChatStore()

// Computed
const thumbnailUrl = computed(() => {
  if (!props.result.representative_frame) return ''
  return getVideoUrl(props.result.representative_frame)
})

const timeRange = computed(() => {
  return formatTimeRange(props.result.start_time, props.result.end_time)
})

const confidencePercent = computed(() => {
  return Math.round(props.result.score * 100)
})

const matchBadgeClass = computed(() => {
  const score = props.result.score
  if (score >= 0.8) {
      return 'bg-green-100 text-green-800 border border-green-200'
  }
  if (score >= 0.6) {
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
  }
  return 'bg-orange-100 text-orange-800 border border-orange-200'
})

const isAddedToChat = computed(() => {
  return chatStore.attachedClips.some((c) => c.chunk_id === props.result.chunk_id)
})

// Actions
const playResult = () => {
  playerStore.openVideo(props.result.video_id, {
    chunkId: props.result.chunk_id,
    startTime: props.result.start_time,
    endTime: props.result.end_time
  })
}

const addToChat = () => {
  chatStore.addClip(props.result)
}
</script>

<template>
  <article class="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
    <div class="flex flex-col">
      <!-- Card Header -->
      <div class="p-5 border-b border-slate-100 flex justify-between items-start gap-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer" @click="playResult" :title="result.title">
            {{ result.title }}
          </h3>
          <div class="flex items-center gap-3 text-xs text-slate-500">
            <span class="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded">
              <span class="material-symbols-outlined text-[14px]">schedule</span>
              {{ timeRange }}
            </span>
            <!-- Source (optional/placeholder) -->
            <span>•</span>
            <span>Video ID: {{ result.video_id.substring(0, 8) }}...</span>
          </div>
        </div>
        <!-- Score Badge -->
        <div class="flex flex-col items-end">
          <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold', matchBadgeClass]">
            {{ confidencePercent }}% Match
          </span>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x divide-slate-100">
        <!-- Thumbnails & Visuals -->
        <div class="lg:col-span-7 p-5 flex flex-col gap-3">
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Visual Context</p>
          <div class="grid grid-cols-1 rounded-lg overflow-hidden h-48 w-full cursor-pointer" @click="playResult">
            <img
              v-if="thumbnailUrl"
              :src="thumbnailUrl"
              class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              :alt="result.visual_description"
            />
            <div
              v-else
              class="bg-gradient-to-br from-slate-300 to-slate-400 h-full w-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
            >
                <span class="material-symbols-outlined text-white/50 text-4xl">image_not_supported</span>
            </div>
          </div>
          <div class="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 border border-slate-100">
            <span class="font-medium text-slate-900">Visual Description:</span> 
            {{ result.visual_description }}
          </div>
        </div>

        <!-- Text & Transcript -->
        <div class="lg:col-span-5 p-5 flex flex-col justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Transcript Excerpt</p>
            <div class="relative pl-3 border-l-2 border-primary/30">
              <p v-if="result.audio_transcript" class="text-sm italic text-slate-700 leading-relaxed">
                "...{{ result.audio_transcript }}..."
              </p>
              <p v-else class="text-sm italic text-slate-400 leading-relaxed">
                (No speech detected in this segment)
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
            <button 
              @click="playResult"
              class="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <span class="material-symbols-outlined text-[20px]">play_arrow</span>
              Play Clip
            </button>
            <button 
              @click="addToChat"
              :class="[
                'flex items-center justify-center p-2 rounded-lg transition-colors border',
                isAddedToChat
                    ? 'text-green-600 bg-green-50 border-green-200'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-100 border-transparent hover:border-slate-200'
              ]"
              :title="isAddedToChat ? 'Added to chat' : 'Chat with video'"
            >
              <span class="material-symbols-outlined text-[20px]">{{ isAddedToChat ? 'check_circle' : 'chat_bubble' }}</span>
            </button>
            <button class="flex items-center justify-center p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200" title="Bookmark">
              <span class="material-symbols-outlined text-[20px]">bookmark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
