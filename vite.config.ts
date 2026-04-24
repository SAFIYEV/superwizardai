import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './api-plugin'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const pagesBase = process.env.VITE_BASE_PATH || (repoName ? `/${repoName}/` : '/')

export default defineConfig(({ command }) => ({
  /** Явно: каталог с .env — loadEnv в api-plugin видит GEMINI_API_KEY. */
  envDir: projectRoot,
  base: command === 'build' ? pagesBase : '/',
  plugins: [react(), apiPlugin()],
  server: {
    port: 5173,
  },
}))
