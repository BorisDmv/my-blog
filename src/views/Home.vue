<script setup>
defineOptions({ name: 'Home' })
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/lib/axios'
import SearchOverlay from '@/components/SearchOverlay.vue'
import AppBar from '@/components/AppBar.vue'

const router = useRouter()
const posts = ref([])
const loading = ref(true)
const isLoadingMore = ref(false)
const error = ref('')
const currentPage = ref(1)
const limit = 10
const totalPages = ref(1)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)
let observer = null
const isSearchOpen = ref(false)
const isDark = ref(false)

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const applyTheme = (value, persist = false) => {
  isDark.value = value
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', value)
  body.classList.toggle('dark', value)
  root.style.colorScheme = value ? 'dark' : 'light'
  if (persist) {
    localStorage.setItem('theme', value ? 'dark' : 'light')
  }
}

const toggleTheme = (event) => {
  if (event?.preventDefault) event.preventDefault()
  const root = document.documentElement
  root.classList.add('theme-transition')
  window.setTimeout(() => root.classList.remove('theme-transition'), 320)
  applyTheme(!isDark.value, true)
}

const openSearch = () => {
  isSearchOpen.value = true
}

const fetchPosts = async (page = 1, options = { append: false }) => {
  const isAppend = options.append === true
  if (isAppend) {
    isLoadingMore.value = true
  } else {
    loading.value = true
    error.value = ''
  }
  try {
    const response = await apiClient.get('/api/posts', {
      params: {
        page,
        limit,
      },
    })
    const payload = response.data ?? {}
    const items = payload.posts ?? payload.data ?? []
    const incoming = Array.isArray(items) ? items : []
    posts.value = isAppend ? [...posts.value, ...incoming] : incoming
    const total = payload.total ?? payload.totalCount ?? posts.value.length
    totalPages.value = Math.max(1, Math.ceil(total / limit))
    currentPage.value = page
    hasMore.value = currentPage.value < totalPages.value
  } catch (err) {
    if (!isAppend) {
      error.value = 'Failed to load posts.'
    }
    console.error('Failed to load posts:', err)
  } finally {
    loading.value = false
    isLoadingMore.value = false
  }
}

const goToPost = (slug) => {
  if (!slug) return
  router.push({ name: 'Blog', params: { slug } })
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    fetchPosts(currentPage.value + 1, { append: true })
  }
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    applyTheme(true)
  } else {
    applyTheme(false)
  }
  fetchPosts(1)
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !loading.value && !isLoadingMore.value && hasMore.value) {
        nextPage()
      }
    },
    { rootMargin: '200px' },
  )
  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

watch(loadMoreTrigger, (nextEl, prevEl) => {
  if (!observer) return
  if (prevEl) observer.unobserve(prevEl)
  if (nextEl) observer.observe(nextEl)
})

onBeforeUnmount(() => {
  if (observer) {
    if (loadMoreTrigger.value) {
      observer.unobserve(loadMoreTrigger.value)
    }
    observer.disconnect()
  }
  observer = null
})
</script>

<template>
  <div class="home-wrapper">
    <div
      class="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300"
      :class="{ dark: isDark }"
    >
      <AppBar :is-dark="isDark" @toggle-theme="toggleTheme" @open-search="openSearch" />

      <div class="border-b border-gray-200/70 dark:border-white/10">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div class="flex flex-col gap-5">
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              01 // The Logbook
            </h1>
            <p class="max-w-2xl text-base md:text-lg text-gray-500 dark:text-slate-400">
              Observations on the craft of living and the art of building. No fluff, just the essentials.
            </p>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div v-if="loading && posts.length === 0" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div 
            v-for="i in 6" 
            :key="i"
            class="rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/5 min-h-[260px] flex flex-col justify-between animate-pulse"
          >
            <div class="flex-1">
              <div class="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4 mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
              </div>
            </div>
            <div class="mt-6 flex items-center justify-between">
              <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-24"></div>
              <div class="h-3 bg-gray-200 dark:bg-slate-800 rounded w-12"></div>
            </div>
          </div>
        </div>

        <div v-else-if="error" class="py-16 text-center">
          <p class="text-red-500 font-medium">{{ error }}</p>
          <button @click="fetchPosts(1)" class="mt-4 text-sm underline text-gray-500">Try again</button>
        </div>

        <div v-else>
          <div v-if="posts.length === 0" class="py-16 text-center text-gray-500 dark:text-slate-400">
            No posts yet.
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <article
              v-for="post in posts"
              :key="post.id"
              class="group cursor-pointer rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 flex flex-col justify-between min-h-[260px]"
              @click="goToPost(post.slug)"
            >
              <div class="flex-1 flex flex-col">
                <h2 class="mt-4 text-2xl font-semibold text-gray-900 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {{ post.title }}
                </h2>
                <p v-if="post.summary" class="mt-3 text-base text-gray-500 dark:text-slate-400 line-clamp-3">
                  {{ post.summary }}
                </p>
              </div>
              
              <div class="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
                <time class="font-medium">
                  {{ formatDate(post.created_at) }}
                </time>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Read Post</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </article>

            <template v-if="isLoadingMore">
              <div 
                v-for="i in 2" 
                :key="'more-'+i"
                class="rounded-3xl border border-gray-100 bg-gray-50/50 p-6 dark:border-white/5 dark:bg-white/5 min-h-[260px] flex flex-col justify-between animate-pulse"
              >
                <div class="flex-1">
                  <div class="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-3/4 mb-4"></div>
                  <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full mb-3"></div>
                  <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
                </div>
                <div class="h-4 bg-gray-200 dark:bg-slate-800 rounded w-24"></div>
              </div>
            </template>
          </div>

          <div class="mt-16 flex items-center justify-center">
            <div
              ref="loadMoreTrigger"
              class="flex items-center gap-3 rounded-full border border-gray-200/70 bg-white/80 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
            >
              <div v-if="isLoadingMore" class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
              <span v-else-if="hasMore">Scroll for more</span>
              <span v-else>End of list</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <SearchOverlay v-model="isSearchOpen" />
  </div>
</template>

<style scoped>
.theme-transition * {
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease !important;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>