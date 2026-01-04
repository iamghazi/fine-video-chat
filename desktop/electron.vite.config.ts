import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/electron',
      rollupOptions: {
        input: {
          main: './electron/main.ts'
        }
      }
    }
  },
  preload: {
    build: {
      outDir: 'dist/electron',
      rollupOptions: {
        input: {
          preload: './electron/preload.ts'
        }
      }
    }
  },
  renderer: {
    build: {
      outDir: 'dist/renderer'
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    }
  }
})
