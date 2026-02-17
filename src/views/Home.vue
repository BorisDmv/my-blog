<script setup>
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

const applyTheme = (value) => {
  isDark.value = value
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', value)
  body.classList.toggle('dark', value)
  root.style.colorScheme = value ? 'dark' : 'light'
  localStorage.setItem('theme', value ? 'dark' : 'light')
}

const toggleTheme = (event) => {
  if (event?.preventDefault) event.preventDefault()
  const root = document.documentElement
  root.classList.add('theme-transition')
  window.setTimeout(() => root.classList.remove('theme-transition'), 320)
  applyTheme(!isDark.value)
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

const prevPage = () => {
  if (currentPage.value > 1) {
    fetchPosts(currentPage.value - 1)
  }
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    applyTheme(true)
  } else if (stored === 'light') {
    applyTheme(false)
  } else {
    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches)
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
  <div
    class="min-h-screen bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100"
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
      <div v-if="loading" class="py-16 text-center text-gray-500 dark:text-slate-400">
        Loading posts...
      </div>

      <div v-else-if="error" class="py-16 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else>
        <div v-if="posts.length === 0" class="py-16 text-center text-gray-500 dark:text-slate-400">
          No posts yet.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <article
            v-for="post in posts"
            :key="post.id"
            class="group cursor-pointer rounded-3xl border border-gray-200/70 bg-white/90 p-6 shadow-sm transition hover:border-gray-300 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 flex flex-col justify-between min-h-[260px]"
            @click="goToPost(post.slug)"
          >
            <div class="flex-1 flex flex-col justify-between">
              <div>
                <!-- Removed 'Post' label for cleaner card header -->
                  <h2 class="mt-4 text-2xl font-semibold text-gray-900 transition group-hover:text-gray-700 dark:text-white dark:group-hover:text-slate-100">
                    {{ post.title }}
                  </h2>
                  <p v-if="post.summary" class="mt-2 text-base text-gray-500 dark:text-slate-400">
                    {{ post.summary }}
                  </p>
              </div>
                <!-- Month circle removed -->
            </div>
            <div class="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
              <time>
                {{ formatDate(post.created_at) }}
              </time>
              <span class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Read</span>
            </div>
          </article>
        </div>

        <div class="mt-12 flex items-center justify-center">
          <div
            ref="loadMoreTrigger"
            class="flex items-center gap-3 rounded-full border border-gray-200/70 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-500"
          >
            <span v-if="isLoadingMore">Loading more...</span>
            <span v-else-if="hasMore">Scroll for more</span>
            <span v-else>End of list</span>
          </div>
        </div>

        <!-- Removed page indicator and navigation buttons -->
      </div>
    </div>
  </div>
  <SearchOverlay v-model="isSearchOpen" />
</template>
