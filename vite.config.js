import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imagetools } from 'vite-imagetools'

export default defineConfig({
  // imagetools: reduz e converte pra webp as fotos jogadas em src/assets/jornada
  plugins: [react(), imagetools({ cache: { enabled: false } })],
  server: { port: 5178 },
})
