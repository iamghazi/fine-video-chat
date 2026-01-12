<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useDebounceFn } from '@vueuse/core'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import SearchResultCard from '@/components/search/SearchResultCard.vue'
import VideoModal from '@/components/video/VideoModal.vue'

const searchStore = useSearchStore()

// Debounced search function
const debouncedSearch = useDebounceFn(async () => {
  if (searchStore.query.trim()) {
    await searchStore.search()
  }
}, 500) // Increased debounce slightly

// Watch query changes for auto-search
watch(
  () => searchStore.query,
  () => {
    debouncedSearch()
  }
)

// Actions
const handleSearch = async () => {
  await searchStore.search()
}

const clearSearch = () => {
  searchStore.clearResults()
}
</script>

<template>
  <div class="flex h-screen bg-background_light font-display text-slate-900 overflow-hidden selection:bg-primary/30">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Header & Search Area (Sticky) -->
      <div class="bg-background_light pt-8 pb-4 px-8 z-10 shrink-0 shadow-sm border-b border-slate-200">
        <div class="max-w-5xl mx-auto flex flex-col gap-6">
          <!-- Title -->
          <h1 class="text-3xl font-bold tracking-tight text-slate-900">Semantic Search</h1>
          
          <!-- Search Input -->
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="material-symbols-outlined text-slate-400 text-2xl group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input
              v-model="searchStore.query"
              @keydown.enter="handleSearch"
              class="block w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl text-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
              placeholder="Describe the moment you are looking for (e.g., 'Two people discussing a network diagram')..."
              type="text"
            />
            <div class="absolute inset-y-0 right-2 flex items-center">
              <button 
                @click="handleSearch"
                class="bg-primary hover:bg-blue-600 text-white p-2 rounded-lg transition-colors shadow-md"
              >
                <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Advanced Options Panel -->
          <details class="group bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <summary class="flex cursor-pointer items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors select-none">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-slate-500">tune</span>
                <p class="text-slate-700 text-sm font-medium">Advanced Search Options</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 transition-transform group-open:rotate-180">expand_more</span>
            </summary>
            <div class="px-5 py-4 border-t border-slate-100 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <!-- Controls Container -->
              <div class="flex flex-wrap gap-8 w-full items-center">
                <!-- Result Limit -->
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Results</label>
                  <div class="flex items-center">
                    <input 
                      v-model.number="searchStore.searchOptions.topK"
                      class="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-center font-medium focus:ring-1 focus:ring-primary focus:border-primary" 
                      type="number" min="1" max="50"
                    />
                  </div>
                </div>
                <!-- Cascaded Reranking Toggle -->
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cascaded Reranking</label>
                    <span class="material-symbols-outlined text-slate-400 text-[16px] cursor-help" title="Enables multi-stage filtering for higher accuracy">info</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input v-model="searchStore.searchOptions.useCascadedReranking" type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span class="ml-3 text-sm font-medium text-slate-700">Enabled</span>
                  </label>
                </div>
                <!-- Confidence Threshold Slider -->
                <div class="flex flex-col gap-2 flex-1 min-w-[250px]">
                  <div class="flex justify-between items-center">
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence Threshold</label>
                    <span class="text-xs font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{{ (searchStore.searchOptions.confidenceThreshold || 0).toFixed(2) }}</span>
                  </div>
                  <input 
                    v-model.number="searchStore.searchOptions.confidenceThreshold"
                    type="range" min="0" max="1" step="0.05"
                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0.0</span>
                    <span>Strict (1.0)</span>
                  </div>
                </div>
              </div>
            </div>
          </details>

          <!-- Processing Status (Visible when loading) -->
          <div v-if="searchStore.loading" class="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-4 animate-pulse">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-primary">
              <span class="material-symbols-outlined text-lg animate-spin">sync</span>
            </div>
            <div class="flex flex-col flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-semibold text-slate-800">Processing Search Query...</span>
              </div>
              <div class="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div class="h-full bg-primary w-2/3 rounded-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="max-w-5xl mx-auto flex flex-col gap-6 pb-20">
          
          <!-- Results Header -->
          <div v-if="searchStore.hasSearched && !searchStore.loading" class="flex justify-between items-end border-b border-slate-200 pb-2">
            <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wider">Top Matches</h2>
            <span class="text-xs text-slate-400">Found {{ searchStore.resultsCount }} results</span>
          </div>

          <!-- Error State -->
          <div v-if="searchStore.error" class="flex items-center justify-center py-10 text-red-500">
             {{ searchStore.error }}
          </div>

          <!-- Empty/Initial State -->
          <div v-if="!searchStore.hasSearched && !searchStore.loading" class="flex flex-col items-center justify-center py-20 opacity-50">
             <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">search</span>
             <p class="text-lg text-slate-500">Start typing to search...</p>
          </div>

          <!-- Results Grid -->
          <div v-if="searchStore.results.length > 0" class="flex flex-col gap-6">
            <SearchResultCard
              v-for="result in searchStore.results"
              :key="result.chunk_id"
              :result="result"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Video Modal -->
    <VideoModal />
  </div>
</template>
