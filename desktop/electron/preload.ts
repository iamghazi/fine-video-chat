import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings } from '../src/types/settings'
import type { HealthCheckResponse } from '../src/types/backend'

console.log('🔧 Preload script starting...')

contextBridge.exposeInMainWorld('electron', {
  settings: {
    get: () => ipcRenderer.invoke('settings:get') as Promise<AppSettings>,
    save: (settings: AppSettings) => ipcRenderer.invoke('settings:save', settings) as Promise<void>,
    reset: () => ipcRenderer.invoke('settings:reset') as Promise<AppSettings>
  },
  backend: {
    health: () => ipcRenderer.invoke('backend:health') as Promise<HealthCheckResponse>,
    testConnection: () => ipcRenderer.invoke('backend:test-connection') as Promise<boolean>,
    getSettings: () => ipcRenderer.invoke('backend:get-settings') as Promise<AppSettings>,
    saveSettings: (settings: AppSettings) => ipcRenderer.invoke('backend:save-settings', settings) as Promise<void>,
    getVideos: () => ipcRenderer.invoke('backend:get-videos') as Promise<any>,
    getVideo: (videoId: string) => ipcRenderer.invoke('backend:get-video', videoId) as Promise<any>,
    getVideoChunks: (videoId: string) => ipcRenderer.invoke('backend:get-video-chunks', videoId) as Promise<any>,
    deleteVideo: (videoId: string) => ipcRenderer.invoke('backend:delete-video', videoId) as Promise<void>,
    search: (query: string, options?: any) => ipcRenderer.invoke('backend:search', query, options) as Promise<any>,
    chatWithClips: (request: { query: string; clip_ids: string[] }) => ipcRenderer.invoke('backend:chat-with-clips', request) as Promise<any>
  },
  dialog: {
    selectDirectory: () => ipcRenderer.invoke('dialog:select-directory') as Promise<string | null>
  }
})

console.log('✅ Preload script completed - window.electron exposed')
