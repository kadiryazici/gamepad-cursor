import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('/lib/lib.ts', import.meta.url)),
      fileName: 'gamepad',
      name: 'gamepad',
    },
  },
})
