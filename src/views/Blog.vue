<script setup>
defineOptions({ name: 'Blog' })
import { onBeforeUnmount, onMounted, onActivated, ref, watch } from 'vue'
import { useThemeStore } from '@/stores/themeStore.js'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useBlogCacheStore } from '@/stores/blogCache'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import apiClient from '@/lib/axios'
import { Share2, Copy, X } from 'lucide-vue-next'
import SearchOverlay from '@/components/SearchOverlay.vue'
import AppBar from '@/components/AppBar.vue'

const route = useRoute()
const isSearchOpen = ref(false)
const isShareOpen = ref(false)
const isCopied = ref(false)
const shareUrl = ref('')
const themeStore = useThemeStore()
const post = ref(null)
const blogCache = useBlogCacheStore()
const loading = ref(true)
const error = ref('')

// ...existing code...
const openSearch = () => {
  isSearchOpen.value = true
}

const openShare = () => {
  isShareOpen.value = true
  isCopied.value = false
}

const closeShare = () => {
  isShareOpen.value = false
  isCopied.value = false
}

const copyShareUrl = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    isCopied.value = true
    window.setTimeout(() => {
      isCopied.value = false
    }, 1800)
  } catch (error) {
    isCopied.value = false
  }
}

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


onMounted(() => {
  shareUrl.value = window.location.href
  themeStore.initTheme()
  fetchPost()
  setTimeout(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, 350)
})

onActivated(() => {
  console.debug('[Blog] onActivated triggered')
  fetchPost()
})

const editor = useEditor({
  content: '',
  extensions: [
    Highlight.configure({ multicolor: true }),
    StarterKit,
    Image,
  ],
  editable: false,
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none prose-slate prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline focus:outline-none font-sans dark:prose-invert',
    },
  },
})

const fetchPost = async () => {
  const slug = route.params.slug
  // Debug: log slug and route
  console.debug('[Blog] fetchPost called. route.params:', route.params)
  // Clear previous post and error before loading new one
  post.value = null
  error.value = ''
  if (!slug) {
    error.value = 'Missing post slug.'
    loading.value = false
    console.debug('[Blog] No slug found in route.params')
    return
  }

  const cached = blogCache.getPost(slug)
  console.debug('[Blog] Checking cache for slug:', slug, 'Found:', !!cached)
  if (cached) {
    post.value = cached
    if (editor.value) {
      editor.value.commands.setContent(post.value?.content ?? '')
    }
    loading.value = false
    console.debug('[Blog] Loaded post from cache:', post.value)
    return
  }

  loading.value = true
  try {
    console.debug('[Blog] Fetching post from API for slug:', slug)
    const response = await apiClient.get(`/api/post/${slug}`)
    post.value = response.data ?? null
    blogCache.setPost(slug, post.value)
    if (editor.value) {
      editor.value.commands.setContent(post.value?.content ?? '')
    }
    console.debug('[Blog] Loaded post from API:', post.value)
  } catch (err) {
    console.error('[Blog] Error loading post:', err)
    if (err?.response?.status === 404) {
      window.location.replace('/404')
      return
    }
    if (typeof window !== 'undefined' && window.location) {
      window.location.replace('/blog-error')
    }
    return
  } finally {
    loading.value = false
    console.debug('[Blog] fetchPost finished. loading:', loading.value, 'post:', post.value)
  }
}

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    console.debug('[Blog] Slug watcher triggered. newSlug:', newSlug, 'oldSlug:', oldSlug)
    if (newSlug && newSlug !== oldSlug) {
      fetchPost()
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }, 350)
    }
  },
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="page-wrapper">
    <div
      class="min-h-screen bg-white text-gray-900 font-sans dark:bg-slate-950 dark:text-slate-100"
      :class="{ dark: themeStore.isDark }"
    >
      <AppBar :is-dark="themeStore.isDark" @toggle-theme="themeStore.toggleTheme" @open-search="openSearch" />

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="lg:grid lg:grid-cols-12 lg:gap-8">
          
          <div class="hidden lg:block lg:col-span-2">
            <div class="sticky top-24 flex flex-col gap-6 items-end pr-4">
              <span class="text-xs font-bold text-gray-300 uppercase tracking-widest writing-vertical dark:text-slate-500">Share</span>
              <button
                type="button"
                class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:text-black hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                @click="openShare"
              >
                <Share2 class="h-5 w-5" />
              </button>
            </div>
          </div>

          <article class="col-span-12 lg:col-span-8 w-full max-w-6xl mx-auto min-h-[60vh]">
            
            <div v-if="loading" class="animate-pulse">
              <header class="mb-10 text-center lg:text-left">
                <div class="h-4 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-4 mx-auto lg:mx-0"></div>
                <div class="h-10 w-full bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
                <div class="h-10 w-2/3 bg-gray-200 dark:bg-slate-800 rounded mb-6 mx-auto lg:mx-0"></div>
                <div class="space-y-2 mb-6">
                  <div class="h-5 w-full bg-gray-100 dark:bg-slate-900 rounded"></div>
                  <div class="h-5 w-5/6 bg-gray-100 dark:bg-slate-900 rounded mx-auto lg:mx-0"></div>
                </div>
                <div class="flex gap-2 justify-center lg:justify-start">
                  <div class="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                  <div class="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded-full"></div>
                </div>
              </header>

              <div class="flex items-center gap-4 mb-12 border-t border-b border-gray-100 py-6 dark:border-white/10">
                <div class="w-15 h-15 rounded-full bg-gray-200 dark:bg-slate-800"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded"></div>
                  <div class="h-3 w-16 bg-gray-100 dark:bg-slate-900 rounded"></div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="h-4 w-full bg-gray-100 dark:bg-slate-900 rounded"></div>
                <div class="h-4 w-full bg-gray-100 dark:bg-slate-900 rounded"></div>
                <div class="h-4 w-3/4 bg-gray-100 dark:bg-slate-900 rounded"></div>
                <div class="h-32 w-full bg-gray-200 dark:bg-slate-800 rounded-xl my-8"></div>
                <div class="h-4 w-full bg-gray-100 dark:bg-slate-900 rounded"></div>
                <div class="h-4 w-5/6 bg-gray-100 dark:bg-slate-900 rounded"></div>
              </div>
            </div>

            <div v-else-if="error" class="py-16 text-center text-sm text-red-500">
              {{ error }}
            </div>

            <div v-else>
              <header class="mb-10 text-center lg:text-left">
                <time
                  v-if="post?.created_at"
                  class="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4 block dark:text-slate-400"
                >
                  {{ formatDate(post.created_at) }}
                </time>
                <h1 class="text-3xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight dark:text-slate-100">
                  {{ post?.title ?? 'Untitled post' }}
                </h1>
                <p v-if="post?.summary" class="text-xl text-gray-600 leading-relaxed dark:text-slate-300">
                  {{ post.summary }}
                </p>
                <div v-if="post?.tags?.length" class="mt-5 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                  <span
                    v-for="tag in post.tags"
                    :key="tag"
                    class="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-white/10 dark:text-slate-400"
                  >
                    {{ tag }}
                  </span>
                </div>
              </header>

              <div class="flex items-center gap-4 mb-12 border-t border-b border-gray-100 py-6 dark:border-white/10">
                <span class="w-15 h-15 flex items-center justify-center overflow-hidden">
                  <img
                    src="@/assets/authorimage.png"
                    :alt="post?.author ?? 'Author'"
                    class="w-15 h-15 rounded-full object-cover border-2 border-transparent"
                    style="background: none;"
                  />
                </span>
                <div>
                  <div class="font-bold text-gray-900 dark:text-white">{{ post?.author ?? 'Author' }}</div>
                  <div class="text-sm text-gray-500 dark:text-slate-400">Author</div>
                </div>
                <div class="ml-auto sm:mt-0 flex-shrink-0 lg:hidden">
                  <button
                    type="button"
                    class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:text-black hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
                    @click="openShare"
                  >
                    <Share2 class="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div class="blog-content">
                <editor-content :editor="editor" />
              </div>
            </div>
          </article>

          <div class="hidden lg:block lg:col-span-2"></div>
        </div>
      </main>

      <SearchOverlay v-model="isSearchOpen" />
      <transition name="fade">
        <div v-if="isShareOpen" class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="closeShare">
           <div class="w-[min(92vw,560px)] rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-slate-500">Share this story</p>
                  <h2 class="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">Go send it to your friends</h2>
                </div>
                <button @click="closeShare" class="h-9 w-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10"><X class="h-4 w-4" /></button>
              </div>
              <div class="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div class="mt-3 flex flex-col sm:flex-row items-stretch gap-3">
                  <input type="text" readonly :value="shareUrl" class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm dark:bg-slate-950 dark:border-white/10" />
                  <button @click="copyShareUrl" class="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
                    <Copy class="h-4 w-4" /> {{ isCopied ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
           </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style>

.ProseMirror { outline: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>