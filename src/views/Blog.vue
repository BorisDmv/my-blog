<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import apiClient from '@/lib/axios'
import { Share2, Copy, X } from 'lucide-vue-next'
import SearchOverlay from '@/components/SearchOverlay.vue'
import AppBar from '@/components/AppBar.vue'

const route = useRoute()
const isSearchOpen = ref(false)
const isShareOpen = ref(false)
const isCopied = ref(false)
const shareUrl = ref('')
const isDark = ref(false)
const post = ref(null)
const loading = ref(true)
const error = ref('')

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
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    applyTheme(true)
  } else {
    // Always default to light mode unless explicitly set
    applyTheme(false)
  }
  fetchPost()
})
const editor = useEditor({
  content: '',
  extensions: [
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
  if (!slug) {
    error.value = 'Missing post slug.'
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    const response = await apiClient.get(`/api/post/${slug}`)
    post.value = response.data ?? null
    if (editor.value) {
      editor.value.commands.setContent(post.value?.content ?? '')
    }
  } catch (err) {
    error.value = 'Failed to load post.'
    console.error('Failed to load post:', err)
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.slug,
  (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      fetchPost()
    }
  },
)

// Cleanup editor instance
onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div
    class="min-h-screen bg-white text-gray-900 font-sans dark:bg-slate-950 dark:text-slate-100"
    :class="{ dark: isDark }"
  >
    
    <AppBar :is-dark="isDark" @toggle-theme="toggleTheme" @open-search="openSearch" />

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

        <article class="col-span-12 lg:col-span-8 w-full max-w-6xl mx-auto min-h-[60vh] flex flex-col justify-between">
          <div v-if="loading" class="py-16 text-center text-sm text-gray-500 dark:text-slate-400">
            Loading post...
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
              <span class="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden">
                <img
                  src="@/assets/authorimg.png"
                  :alt="post?.author ?? 'Author'"
                  class="w-16 h-16 object-cover"
                />
              </span>
              <div>
                <div class="font-bold text-gray-900 dark:text-white">{{ post?.author ?? 'Author' }}</div>
                <div class="text-sm text-gray-500 dark:text-slate-400">Author</div>
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

  </div>
  <SearchOverlay v-model="isSearchOpen" />
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isShareOpen"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeShare"
    >
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="isShareOpen"
          class="w-[min(92vw,560px)] rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-slate-500">Share this story</p>
              <h2 class="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">Go send it to your friends</h2>
              <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">Copy the link below and share it anywhere.</p>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-black dark:border-white/10 dark:text-slate-400 dark:hover:border-white/20 dark:hover:text-white"
              @click="closeShare"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div class="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 dark:text-slate-500">Share link</p>
            <div class="mt-3 flex items-center gap-3">
              <input
                type="text"
                readonly
                :value="shareUrl"
                class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
              />
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                @click="copyShareUrl"
              >
                <Copy class="h-4 w-4" />
                {{ isCopied ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style>
/* Custom CSS for the "Drop Cap" effect on the first letter of the content */
.blog-content .ProseMirror > p:first-of-type::first-letter {
  float: left;
  font-size: 5rem;
  line-height: 0.8;
  font-weight: bold;
  margin-right: 0.75rem;
  margin-top: -0.25rem; /* Optical adjustment */
  color: #111827; /* gray-900 */
}

.dark .blog-content .ProseMirror > p:first-of-type::first-letter {
  color: #f8fafc; /* slate-50 */
}

/* Ensure the editor takes full width and has no border focus */
.ProseMirror {
  outline: none;
}
</style>