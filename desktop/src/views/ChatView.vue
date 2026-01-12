<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ChatClipList from '@/components/chat/ChatClipList.vue'
import VideoModal from '@/components/video/VideoModal.vue'

const chatStore = useChatStore()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

// Actions
const sendMessage = async () => {
  if (!messageInput.value.trim() || !chatStore.hasAttachedClips) {
    return
  }

  const message = messageInput.value.trim()
  messageInput.value = ''

  try {
    await chatStore.sendMessage(message)
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const clearChat = () => {
  chatStore.clearMessages()
  // chatStore.clearClips() // Design keeps clips, just clears chat? Or maybe separate actions. Design has 'Clear chat' button in input area.
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
    }
}

// Watch for new messages and scroll
watch(
  () => chatStore.messages.length,
  () => {
    scrollToBottom()
  }
)
</script>

<template>
  <div class="bg-background_light font-display text-slate-900 h-screen overflow-hidden flex">
    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Header -->
      <div class="shrink-0 bg-white border-b border-slate-200 flex flex-col z-10 shadow-sm">
        <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <h1 class="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">forum</span>
            Clip Conversation
          </h1>
          <div class="flex items-center gap-3">
             <button class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/10">
                <span class="material-symbols-outlined text-[18px]">add_circle</span>
                Add Context
            </button>
          </div>
        </div>
        
        <!-- Active Context Bar -->
        <div class="bg-slate-50/50 px-6 py-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Context ({{ chatStore.clipCount }} Clips Selected)</span>
            </div>
            <!-- Horizontal Clip List -->
            <ChatClipList />
        </div>
      </div>

      <!-- Messages Area -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto px-6 py-6 bg-slate-50/30">
        <div class="max-w-4xl mx-auto flex flex-col gap-6 pb-4">
            <!-- Timestamp Separator (Mock) -->
            <div class="flex items-center justify-center">
                <span class="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
            </div>

            <!-- Messages Loop -->
            <template v-if="chatStore.hasMessages">
                <div 
                    v-for="message in chatStore.messages" 
                    :key="message.id" 
                    :class="[
                        'flex gap-3 group',
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    ]"
                >
                    <!-- Avatar -->
                    <div 
                        :class="[
                            'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm',
                            message.role === 'user' ? 'bg-primary' : 'bg-indigo-600'
                        ]"
                    >
                        <span v-if="message.role === 'user'" class="text-white text-xs font-bold">YO</span>
                        <span v-else class="material-symbols-outlined text-white text-sm">smart_toy</span>
                    </div>

                    <!-- Message Bubble -->
                    <div :class="[
                        'flex flex-col gap-1 max-w-[80%]',
                        message.role === 'user' ? 'items-end' : 'items-start'
                    ]">
                        <div :class="[
                            'px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed',
                            message.role === 'user' 
                                ? 'bg-primary text-white rounded-tr-none' 
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        ]">
                            <p class="whitespace-pre-wrap">{{ message.content }}</p>
                        </div>
                        
                        <!-- Metadata/Timestamp -->
                        <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-[10px] text-slate-400">{{ new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
                            <button v-if="message.role === 'assistant'" class="text-slate-400 hover:text-slate-600" title="Copy"><span class="material-symbols-outlined text-[14px]">content_copy</span></button>
                            <button v-if="message.role === 'assistant'" class="text-slate-400 hover:text-slate-600" title="Regenerate"><span class="material-symbols-outlined text-[14px]">refresh</span></button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Loading State -->
            <div v-if="chatStore.loading" class="flex flex-row gap-3 animate-pulse">
                <div class="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                </div>
                <div class="flex flex-col items-start gap-1">
                    <div class="bg-slate-100 text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm border border-transparent">
                        <span class="text-xs font-medium">Thinking</span>
                        <div class="flex gap-1">
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>
            </div>

             <!-- Empty State Hint -->
            <div v-if="!chatStore.hasMessages && !chatStore.loading" class="flex items-center justify-center py-10 opacity-50">
                <p class="text-sm text-slate-500">Ask a question about the selected clips</p>
            </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="shrink-0 bg-white border-t border-slate-200 p-6 z-20">
        <div class="max-w-4xl mx-auto flex flex-col gap-3">
            <div class="relative shadow-sm rounded-xl">
                <textarea 
                    v-model="messageInput"
                    @keydown="handleKeydown"
                    class="block w-full rounded-xl border-slate-200 bg-white pl-4 pr-12 py-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none shadow-sm" 
                    placeholder="Ask a question about the selected clips..." 
                    rows="2"
                    :disabled="chatStore.loading"
                ></textarea>
                <div class="absolute right-2 bottom-2.5 flex items-center gap-1">
                    <button class="bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors" title="Attach">
                        <span class="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    <button 
                        @click="sendMessage"
                        :disabled="!messageInput.trim() || chatStore.loading"
                        class="bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-1.5 rounded-lg transition-colors shadow-sm"
                    >
                        <span class="material-symbols-outlined text-[20px]">arrow_upward</span>
                    </button>
                </div>
            </div>
            <div class="flex justify-between items-center px-1">
                <p class="text-xs text-slate-400">
                    <span class="font-semibold">Shift + Enter</span> for new line
                </p>
                <button @click="clearChat" class="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                    Clear chat
                </button>
            </div>
        </div>
      </div>
    </main>

    <!-- Video Modal -->
    <VideoModal />
  </div>
</template>

<style>
.hide-scroll::-webkit-scrollbar {
    display: none;
}
.hide-scroll {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>