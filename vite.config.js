import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    entries: [],
    noDiscovery: true, // отключает автоматический поиск зависимостей
    include: undefined, // не включает никакие зависимости в предсборку
  },
})
