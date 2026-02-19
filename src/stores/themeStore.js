import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),
  actions: {
    setTheme(value, persist = false) {
      this.isDark = value
      const root = document.documentElement
      const body = document.body
      root.classList.toggle('dark', value)
      body.classList.toggle('dark', value)
      root.style.colorScheme = value ? 'dark' : 'light'
      if (persist) {
        localStorage.setItem('theme', value ? 'dark' : 'light')
      }
    },
    toggleTheme(event) {
      if (event?.preventDefault) event.preventDefault()
      const root = document.documentElement
      root.classList.add('theme-transition')
      window.setTimeout(() => root.classList.remove('theme-transition'), 320)
      this.setTheme(!this.isDark, true)
    },
    initTheme() {
      const stored = localStorage.getItem('theme')
      this.setTheme(stored === 'dark', false)
    }
  }
})
