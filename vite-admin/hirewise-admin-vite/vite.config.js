import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // '/api': 'http://localhost:5000'
    }
  },
  build: {
    // ⚡ Code splitting & optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js', '@supabase/ssr'],
          'vendor-icons': ['lucide-react', 'react-icons'],
        },
      },
    },
    // ⚡ Chunk size warning limit
    chunkSizeWarningLimit: 600,
    // ⚡ Minification
    minify: 'esbuild',
    // ⚡ Source maps for production debugging (disable in production for smaller bundle)
    sourcemap: false,
  },
  // ⚡ Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
});
