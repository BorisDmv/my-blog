<script setup>
import { onMounted, ref } from 'vue'
import { Search, Sun, Moon, Menu } from 'lucide-vue-next'

const props = defineProps({
  isDark: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle-theme', 'open-search'])

const isAuthenticated = ref(false)

const handleToggleTheme = (event) => {
  emit('toggle-theme', event)
}

const handleOpenSearch = () => {
  emit('open-search')
}


const getToken = () => {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
  const tokenValue = match?.[1]
  return tokenValue ? decodeURIComponent(tokenValue) : null
}

const isTokenExpired = (token) => {
  if (!token) return true
  try {
    // JWT format: header.payload.signature
    const payload = JSON.parse(atob(token.split('.')[1]))
    // exp is in seconds
    return Date.now() / 1000 > payload.exp
  } catch (e) {
    return true
  }
}

const removeToken = () => {
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

onMounted(() => {
  const token = getToken()
  if (isTokenExpired(token)) {
    removeToken()
    isAuthenticated.value = false
  } else {
    isAuthenticated.value = true
  }
})
</script>

<template>
  <header class="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50 dark:border-white/10 dark:bg-slate-950/90">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center">
        <RouterLink to="/" class="text-2xl font-bold tracking-tight text-black dark:text-slate-100">writtenbyhuman.</RouterLink>
      </div>

      <div class="flex items-center gap-6">
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-slate-400">
          <RouterLink
            v-if="isAuthenticated"
            to="/editor"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-black text-white hover:bg-gray-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 shadow transition"
            title="Add your story"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </RouterLink>
        </nav>

        <div class="flex items-center gap-4 text-gray-400 dark:text-slate-400">
          <button class="hover:text-black dark:hover:text-white" type="button" @click="handleOpenSearch">
            <Search class="w-5 h-5" />
          </button>
          <button
            class="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-black dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
            @click.prevent="handleToggleTheme"
            aria-label="Toggle theme"
            type="button"
          >
            <Sun
              class="h-5 w-5 transition-all duration-300"
              :class="props.isDark ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'"
            />
            <Moon
              class="absolute h-5 w-5 transition-all duration-300"
              :class="props.isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75'"
            />
          </button>
          <!-- Hamburger menu removed -->
        </div>
      </div>
    </div>
  </header>
</template>
