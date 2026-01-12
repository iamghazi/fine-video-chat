import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VideoMetadata, VideoChunk } from '@/types/video'

export interface PlayVideoOptions {
  chunkId?: string
  startTime?: number
  endTime?: number
}

export const useVideoPlayerStore = defineStore('videoPlayer', () => {
  // State
  const isModalOpen = ref(false)
  const currentVideoId = ref<string | null>(null)
  const currentChunkId = ref<string | null>(null)
  const startTime = ref(0)
  const endTime = ref<number | null>(null)
  const videoMetadata = ref<VideoMetadata | null>(null)
  const chunks = ref<VideoChunk[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function openVideo(videoId: string, options: PlayVideoOptions = {}) {
    try {
      loading.value = true
      error.value = null

      // Fetch video metadata
      const metadata = await window.electron.backend.getVideo(videoId)
      videoMetadata.value = metadata

      // Fetch chunks
      const chunksResponse = await window.electron.backend.getVideoChunks(videoId)
      chunks.value = chunksResponse.chunks || []

      // Set playback options
      currentVideoId.value = videoId
      currentChunkId.value = options.chunkId || null
      startTime.value = options.startTime || 0
      endTime.value = options.endTime || null

      // Open modal
      isModalOpen.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load video'
      console.error('Failed to open video:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function closeVideo() {
    isModalOpen.value = false
    // Clear state after modal close animation
    setTimeout(() => {
      currentVideoId.value = null
      currentChunkId.value = null
      startTime.value = 0
      endTime.value = null
      videoMetadata.value = null
      chunks.value = []
      error.value = null
    }, 300)
  }

  function setCurrentChunk(chunkId: string, chunk?: VideoChunk) {
    currentChunkId.value = chunkId
    if (chunk) {
      startTime.value = chunk.start_time
      endTime.value = chunk.end_time
    }
  }

  function reset() {
    isModalOpen.value = false
    currentVideoId.value = null
    currentChunkId.value = null
    startTime.value = 0
    endTime.value = null
    videoMetadata.value = null
    chunks.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    isModalOpen,
    currentVideoId,
    currentChunkId,
    startTime,
    endTime,
    videoMetadata,
    chunks,
    loading,
    error,

    // Actions
    openVideo,
    closeVideo,
    setCurrentChunk,
    reset
  }
})
