<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useLibraryStore } from '@/stores/library'
import { useVideoPlayerStore } from '@/stores/videoPlayer'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import VideoCard from '@/components/library/VideoCard.vue'
import VideoModal from '@/components/video/VideoModal.vue'

const libraryStore = useLibraryStore()
const playerStore = useVideoPlayerStore()

const searchQuery = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

// Computed
const filteredVideos = () => {
  let videos = [...libraryStore.videos]

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    videos = videos.filter((v) => v.title.toLowerCase().includes(query))
  }

  // Default Sort by Date (Design implies this)
  videos.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())

  return videos
}

// Actions
const handleDeleteVideo = async (videoId: string) => {
  try {
    await libraryStore.deleteVideo(videoId)
  } catch (error) {
    console.error('Failed to delete video:', error)
  }
}

const handleUploadClick = () => {
    // Placeholder for upload functionality
    console.log('Upload clicked')
    // In a real app, this would trigger a file picker
}

// Lifecycle
onMounted(async () => {
  await libraryStore.fetchVideos()
})
</script>

<template>
  <div class="flex h-screen bg-background_light font-display overflow-hidden selection:bg-primary/30">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Top Header & Controls -->
      <header class="bg-background_light shrink-0 px-8 py-6 z-10">
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <!-- Title Block -->
          <div class="flex flex-col gap-1 min-w-[200px]">
            <h2 class="text-3xl font-bold tracking-tight text-slate-900">My Library</h2>
            <p class="text-sm text-slate-500">Manage and search your local video index</p>
          </div>
          <!-- Controls Block -->
          <div class="flex flex-1 items-center gap-3 justify-end flex-wrap">
            <!-- Search -->
            <div class="relative flex-1 max-w-lg min-w-[280px] group">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              </div>
              <input
                v-model="searchQuery"
                class="block w-full pl-10 pr-12 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900 placeholder-slate-400 shadow-sm transition-all"
                placeholder="Search by keyword or transcript content..."
                type="text"
              />
              <button class="absolute inset-y-0 right-1 px-2 flex items-center text-slate-400 hover:text-primary transition-colors" title="Advanced Filters">
                <span class="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
            <!-- View Toggle -->
            <div class="bg-slate-200 p-1 rounded-lg flex items-center shrink-0">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'p-1.5 rounded-md shadow-sm transition-all',
                  viewMode === 'grid' ? 'bg-white text-primary' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-[20px] block">grid_view</span>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'p-1.5 rounded-md shadow-sm transition-all',
                  viewMode === 'list' ? 'bg-white text-primary' : 'text-slate-500 hover:text-slate-700'
                ]"
              >
                <span class="material-symbols-outlined text-[20px] block">view_list</span>
              </button>
            </div>
            <!-- Upload Button -->
            <button
                @click="handleUploadClick"
                class="bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 shrink-0"
            >
              <span class="material-symbols-outlined text-[20px]">upload_file</span>
              Upload Video
            </button>
          </div>
        </div>
        <!-- Filters Bar -->
        <div class="flex items-center gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar">
          <span class="text-xs font-semibold text-slate-500 mr-2 uppercase tracking-wider">Filters:</span>
          <button class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors">
            <span>Date: Last 30 Days</span>
            <span class="material-symbols-outlined text-[14px]">close</span>
          </button>
          <button class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors">
            <span>Status: Indexed</span>
            <span class="material-symbols-outlined text-[14px]">close</span>
          </button>
          <button class="flex items-center gap-1 text-xs text-primary font-medium px-2 hover:underline">
            Clear all
          </button>
        </div>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto px-8 pb-10">
        <!-- Ongoing Process Section (Mocked for now, or use libraryStore.processingVideos) -->
        <div v-if="libraryStore.processingVideos.length > 0" class="mb-8 bg-white rounded-xl border border-blue-100 p-5 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div class="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-2xl animate-pulse">auto_awesome</span>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">Processing {{ libraryStore.processingVideos.length }} Videos</h3>
                <p class="text-sm text-slate-500">AI analysis in progress. Search will be available shortly.</p>
              </div>
            </div>
            <!-- Progress Bar (Mocked) -->
            <div class="w-full md:w-1/3 flex flex-col gap-2">
                <div class="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span>Analyzing</span>
                    <span>75%</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full relative w-3/4">
                        <div class="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] w-full h-full"></div>
                    </div>
                </div>
            </div>
          </div>
        </div>

        <!-- Video Grid -->
        <div v-if="filteredVideos().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          <VideoCard
            v-for="video in filteredVideos()"
            :key="video.video_id"
            :video="video"
            @delete="handleDeleteVideo"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="flex items-center justify-center py-20">
            <div class="text-center">
              <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">video_library</span>
              <p class="mb-2 text-lg text-slate-500">No videos found</p>
              <p class="text-sm text-slate-400">
                Upload a video or adjust your filters
              </p>
            </div>
        </div>
      </main>
    </div>

    <!-- Video Modal (Hidden by default, triggered by store) -->
    <VideoModal />
  </div>
</template>

<style>
/* No scrollbar utility class */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
