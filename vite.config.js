// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        lyrics: resolve(__dirname, 'lyrics.html'),

      },
    },
  },
})
