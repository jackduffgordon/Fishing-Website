import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    root: './',
    build: {
          outDir: 'dist',
          sourcemap: false,
          chunkSizeWarningLimit: 600,
          rollupOptions: {
              output: {
                  manualChunks: {
                      icons: ['lucide-react'],
                      maps: ['leaflet', 'react-leaflet']
                  }
              }
          }
    },
    server: {
          port: 5173,
          open: true,
          proxy: {
                  '/api': {
                            target: 'http://localhost:3001',
                            changeOrigin: true
                  }
          }
    }
})
