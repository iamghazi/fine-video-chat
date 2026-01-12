import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SearchResult, SearchResponse, SearchOptions } from '@/types/video'
import { useToastStore } from './toast'

export const useSearchStore = defineStore('search', () => {
  // State
  const query = ref('')
  const results = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastSearchQuery = ref<string | null>(null)

  // Search options with defaults
  const searchOptions = ref<SearchOptions>({
    topK: 10,
    useCascadedReranking: true,
    confidenceThreshold: 0.0,
    videoIdFilter: undefined,
    scoreThreshold: undefined,
    tier1Candidates: undefined
  })

  // Computed
  const hasResults = computed(() => results.value.length > 0)
  const hasSearched = computed(() => lastSearchQuery.value !== null)
  const resultsCount = computed(() => results.value.length)

  // Actions
  async function search(searchQuery?: string, options?: Partial<SearchOptions>) {
    const toastStore = useToastStore()

    // Use provided query or current query state
    const queryToSearch = searchQuery !== undefined ? searchQuery : query.value

    if (!queryToSearch.trim()) {
      results.value = []
      lastSearchQuery.value = null
      return
    }

    try {
      loading.value = true
      error.value = null

      // Merge options with defaults
      const mergedOptions = {
        ...searchOptions.value,
        ...options
      }

      const response: SearchResponse = await window.electron.backend.search(
        queryToSearch,
        mergedOptions
      )

      results.value = response.results || []
      lastSearchQuery.value = queryToSearch

      if (results.value.length === 0) {
        toastStore.info('No results found')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      console.error('Search failed:', err)

      toastStore.error('Search failed. Please try again.')

      results.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  function updateOptions(options: Partial<SearchOptions>) {
    searchOptions.value = {
      ...searchOptions.value,
      ...options
    }
  }

  function clearResults() {
    results.value = []
    query.value = ''
    lastSearchQuery.value = null
    error.value = null
  }

  function reset() {
    query.value = ''
    results.value = []
    loading.value = false
    error.value = null
    lastSearchQuery.value = null
    searchOptions.value = {
      topK: 10,
      useCascadedReranking: true,
      confidenceThreshold: 0.0,
      videoIdFilter: undefined,
      scoreThreshold: undefined,
      tier1Candidates: undefined
    }
  }

  return {
    // State
    query,
    results,
    loading,
    error,
    lastSearchQuery,
    searchOptions,

    // Computed
    hasResults,
    hasSearched,
    resultsCount,

    // Actions
    search,
    updateOptions,
    clearResults,
    reset
  }
})
