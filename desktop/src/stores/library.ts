import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VideoMetadata, VideoListResponse } from '@/types/video'
import { useToastStore } from './toast'

export const useLibraryStore = defineStore('library', () => {
  // State
  const videos = ref<VideoMetadata[]>([])
  const loading = ref(false)
  const selectedVideoId = ref<string | null>(null)
  const error = ref<string | null>(null)

  // Computed
  const selectedVideo = computed(() => {
    if (!selectedVideoId.value) return null
    return videos.value.find((v) => v.video_id === selectedVideoId.value) || null
  })

  const videoCount = computed(() => videos.value.length)

  const indexedVideos = computed(() => {
    return videos.value.filter((v) => v.indexed_at !== null)
  })

  const processingVideos = computed(() => {
    return videos.value.filter((v) => v.indexed_at === null && v.duration_seconds > 0)
  })

  // Actions
  async function fetchVideos() {
    try {
      loading.value = true
      error.value = null

      const response: VideoListResponse = await window.electron.backend.getVideos()
      videos.value = response.videos || []
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch videos'
      console.error('Failed to fetch videos:', err)

      const toastStore = useToastStore()
      toastStore.error('Failed to load video library')

      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteVideo(videoId: string) {
    const toastStore = useToastStore()

    try {
      loading.value = true
      error.value = null

      await window.electron.backend.deleteVideo(videoId)

      // Remove from local state
      const index = videos.value.findIndex((v) => v.video_id === videoId)
      if (index !== -1) {
        const deletedVideo = videos.value[index]
        videos.value.splice(index, 1)
        toastStore.success(`Deleted "${deletedVideo.title}"`)
      }

      // Clear selection if deleted video was selected
      if (selectedVideoId.value === videoId) {
        selectedVideoId.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete video'
      console.error('Failed to delete video:', err)

      toastStore.error('Failed to delete video')

      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshVideo(videoId: string) {
    try {
      const metadata: VideoMetadata = await window.electron.backend.getVideo(videoId)

      const index = videos.value.findIndex((v) => v.video_id === videoId)
      if (index !== -1) {
        videos.value[index] = metadata
      } else {
        videos.value.unshift(metadata)
      }
    } catch (err) {
      console.error('Failed to refresh video:', err)
      throw err
    }
  }

  function selectVideo(videoId: string | null) {
    selectedVideoId.value = videoId
  }

  function reset() {
    videos.value = []
    loading.value = false
    selectedVideoId.value = null
    error.value = null
  }

  return {
    // State
    videos,
    loading,
    selectedVideoId,
    error,

    // Computed
    selectedVideo,
    videoCount,
    indexedVideos,
    processingVideos,

    // Actions
    fetchVideos,
    deleteVideo,
    refreshVideo,
    selectVideo,
    reset
  }
})
