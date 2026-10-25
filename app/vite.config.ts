import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  ssr: { noExternal: ['framer-motion', 'lenis'] },
  build: { rollupOptions: {} },
})
