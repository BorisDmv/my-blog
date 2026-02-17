<script setup>
import { ref, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { searchPosts } from '../lib/search'
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const searchQuery = ref('')
const results = ref([])
const page = ref(1)
const limit = 10
const hasMore = ref(false)
const loading = ref(false)
const error = ref('')

const fetchResults = async (reset = false) => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const data = await searchPosts(searchQuery.value, page.value, limit)
    if (reset) {
      results.value = data.items || []
    } else {
      results.value = results.value.concat(data.items || [])
    }
    // hasMore: true if there are more items to fetch
    hasMore.value = (page.value * limit) < (data.total ?? 0)
  } catch (e) {
    error.value = 'Failed to load results.'
  } finally {
    loading.value = false
  }
}

const triggerSearch = () => {
  if (searchQuery.value.trim()) {
    page.value = 1
    fetchResults(true)
  } else {
    results.value = []
    hasMore.value = false
  }
}

// Clear results if input is cleared after a search
watch(searchQuery, (val) => {
  if (!val.trim()) {
    results.value = []
    hasMore.value = false
  }
})

const closeSearch = () => {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      searchQuery.value = ''
      results.value = []
      hasMore.value = false
      page.value = 1
      nextTick(() => {
        if (inputRef.value) inputRef.value.focus()
      })
    }
  }
)

const inputRef = ref(null)

const resultsContainer = ref(null)

// Use Vue's nextTick to ensure ref is set after DOM update
watch([results, hasMore], async () => {
  await nextTick()
  const el = resultsContainer.value
  if (el) {
    el.onscroll = onScroll
    // Only auto-load if not already loading and more results exist and not all loaded
    if (
      hasMore.value &&
      el.scrollHeight <= el.clientHeight &&
      results.value.length > 0 &&
      !loading.value &&
      (page.value * limit) < (results.value.length + limit)
    ) {
      page.value += 1
      fetchResults()
    }
  }
})

const onScroll = (e) => {
  const el = e.target
  if (hasMore.value && !loading.value && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    page.value += 1
    fetchResults()
  }
}

const goToBlog = (item) => {
  if (item.slug) {
    closeSearch()
    // Use correct route name (case sensitive)
    router.push({ name: 'Blog', params: { slug: item.slug } })
  }
}
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeSearch"
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
          v-if="modelValue"
          class="w-[min(92vw,720px)] rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10"
        >
          <div class="border-b border-gray-100 px-6 py-5 dark:border-white/10">
            <div class="flex items-center gap-3 text-gray-400 dark:text-slate-400">
              <button @click="triggerSearch" tabindex="-1">
                <Search class="h-5 w-5" />
              </button>
              <input
                v-model="searchQuery"
                ref="inputRef"
                type="text"
                placeholder="Search by title or tag..."
                class="w-full bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white dark:placeholder:text-slate-500"
                autofocus
                @keydown.esc.prevent="closeSearch"
                @keydown.enter.prevent="triggerSearch"
              />
            </div>
          </div>
          <div
            v-if="searchQuery && results.length"
            class="max-h-72 overflow-y-auto px-6 py-5"
            ref="resultsContainer"
          >
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-500">Results</p>
            <ul class="mt-4 space-y-3">
              <li
                v-for="item in results"
                :key="item.id || item._id || item.title || item"
              >
                <button
                  class="w-full rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-gray-200 hover:bg-white hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
                  type="button"
                  @click="goToBlog(item)"
                >
                  {{ item.title || item.name || item }}
                </button>
              </li>
            </ul>
            <div v-if="loading" class="text-center py-2 text-xs text-gray-400">Loading...</div>
            <div v-if="!loading && hasMore" class="text-center py-2 text-xs text-gray-400">Scroll to load more…</div>
          </div>
          <div v-if="error" class="px-6 py-2 text-xs text-red-500">{{ error }}</div>
          <div class="border-t border-gray-100 px-6 py-4 text-xs text-gray-400 dark:border-white/10 dark:text-slate-500">
            Press Esc to close
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>
