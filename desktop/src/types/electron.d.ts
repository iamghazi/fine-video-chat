import type { AppSettings } from './settings'
import type { HealthCheckResponse } from './backend'

declare global {
  interface Window {
    electron: {
      settings: {
        get: () => Promise<AppSettings>
        save: (settings: AppSettings) => Promise<void>
        reset: () => Promise<AppSettings>
      }
      backend: {
        health: () => Promise<HealthCheckResponse>
        testConnection: () => Promise<boolean>
        getSettings: () => Promise<AppSettings>
        saveSettings: (settings: AppSettings) => Promise<void>
        getVideos: () => Promise<any>
        getVideo: (videoId: string) => Promise<any>
        getVideoChunks: (videoId: string) => Promise<any>
        deleteVideo: (videoId: string) => Promise<void>
        search: (query: string, options?: any) => Promise<any>
        chatWithClips: (request: { query: string; clip_ids: string[] }) => Promise<any>
      }
      dialog: {
        selectDirectory: () => Promise<string | null>
      }
    }
  }
}

export {}
