import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SearchResult } from '@/types/video'
import { useToastStore } from './toast'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  sources?: string[]
  cacheUsed?: boolean
}

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const attachedClips = ref<SearchResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let nextMessageId = 0

  // Computed
  const hasAttachedClips = computed(() => attachedClips.value.length > 0)
  const clipCount = computed(() => attachedClips.value.length)
  const hasMessages = computed(() => messages.value.length > 0)

  // Actions
  function addClip(clip: SearchResult) {
    // Check if already attached
    const exists = attachedClips.value.some((c) => c.chunk_id === clip.chunk_id)
    if (exists) {
      const toastStore = useToastStore()
      toastStore.info('Clip already added to chat')
      return
    }

    attachedClips.value.push(clip)

    const toastStore = useToastStore()
    toastStore.success('Clip added to chat')
  }

  function removeClip(chunkId: string) {
    const index = attachedClips.value.findIndex((c) => c.chunk_id === chunkId)
    if (index !== -1) {
      attachedClips.value.splice(index, 1)
    }
  }

  function clearClips() {
    attachedClips.value = []
  }

  async function sendMessage(message: string) {
    const toastStore = useToastStore()

    if (!message.trim()) {
      return
    }

    if (attachedClips.value.length === 0) {
      toastStore.warning('Please add at least one video clip to chat')
      return
    }

    try {
      loading.value = true
      error.value = null

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-${nextMessageId++}-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: Date.now()
      }
      messages.value.push(userMessage)

      // Get clip IDs
      const clipIds = attachedClips.value.map((c) => c.chunk_id)

      // Call chat API (assuming it exists in the backend)
      // Note: This needs to be added to the IPC handlers
      const response = await window.electron.backend.chatWithClips({
        query: message,
        clip_ids: clipIds
      })

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `msg-${nextMessageId++}-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
        sources: response.sources || [],
        cacheUsed: response.cache_used
      }
      messages.value.push(assistantMessage)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      console.error('Failed to send chat message:', err)

      toastStore.error('Failed to send message. Please try again.')

      // Remove the user message since it failed
      if (messages.value.length > 0) {
        messages.value.pop()
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function reset() {
    messages.value = []
    attachedClips.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    messages,
    attachedClips,
    loading,
    error,

    // Computed
    hasAttachedClips,
    clipCount,
    hasMessages,

    // Actions
    addClip,
    removeClip,
    clearClips,
    sendMessage,
    clearMessages,
    reset
  }
})
