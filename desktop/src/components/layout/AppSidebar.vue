<template>
  <aside class="w-64 bg-sidebar_light border-r border-slate-200 flex flex-col justify-between h-full shrink-0 z-20 transition-colors duration-200">
    <div class="flex flex-col p-6 pb-2">
      <!-- App Header -->
      <div class="flex items-center gap-2 mb-1">
        <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
          <span class="material-symbols-outlined text-[20px]">smart_display</span>
        </div>
        <h1 class="text-lg font-bold tracking-tight text-slate-900">
          LocalVideo AI
        </h1>
      </div>
      <p class="text-xs text-slate-500 font-medium pl-10">
        Local-first Indexer
      </p>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive, navigate }"
        custom
      >
        <a
          :href="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 hover:bg-slate-100'
          ]"
          @click="navigate"
        >
          <span
            class="material-symbols-outlined"
            :class="[
              isActive ? 'filled' : 'text-slate-500 group-hover:text-slate-700'
            ]"
            :style="isActive ? `font-variation-settings: 'FILL' 1;` : ''"
          >
            {{ item.icon }}
          </span>
          <span class="text-sm font-medium">{{ item.label }}</span>
        </a>
      </router-link>
    </nav>

    <!-- Footer / Storage & User -->
    <div class="p-4 border-t border-slate-200">
      <!-- Storage Widget -->
      <div class="bg-slate-50 rounded-lg p-3 border border-slate-100">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-slate-700">Local Storage</span>
          <span class="text-[10px] font-medium text-slate-500">450GB Free</span>
        </div>
        <div class="w-full bg-slate-200 rounded-full h-1.5 mb-1">
          <div class="bg-primary h-1.5 rounded-full" style="width: 65%"></div>
        </div>
        <p class="text-[10px] text-slate-400">{{ libraryStore.videoCount }} Videos Stored</p>
      </div>

      <!-- User Profile -->
      <div class="mt-4 flex items-center gap-3 px-1">
        <div class="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
          JD
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-slate-700">John Doe</span>
          <span class="text-[10px] text-slate-500">Admin Mode</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useLibraryStore } from '@/stores/library'

interface NavItem {
  path: string
  label: string
  icon: string
}

const libraryStore = useLibraryStore()

const navItems: NavItem[] = [
  {
    path: '/library',
    label: 'Library',
    icon: 'video_library'
  },
  {
    path: '/search',
    label: 'Search',
    icon: 'search'
  },
  {
    path: '/chat',
    label: 'Chat',
    icon: 'chat'
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'settings'
  }
]
</script>
