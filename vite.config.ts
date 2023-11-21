import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import DTS from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    DTS({
      exclude: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('/lib/lib.ts', import.meta.url)),
      fileName: 'index',
      name: 'GamepadPointer',
    },
  },
})
