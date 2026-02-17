<script setup>
const saveDraft = async () => {
  publishError.value = ''
  publishSuccess.value = ''
  const json = editor.value?.getJSON()
  const finalSlug = slug.value.trim() || slugify(title.value)
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (!author.value.trim()) {
    publishError.value = 'Author is required.'
    return
  }
  if (!title.value.trim()) {
    publishError.value = 'Title is required.'
    return
  }
  if (!finalSlug) {
    publishError.value = 'Slug is required.'
    return
  }
  if (!subtitle.value.trim()) {
    publishError.value = 'Summary is required.'
    return
  }
  if (!json) {
    publishError.value = 'Content is empty.'
    return
  }

  isPublishing.value = true
  try {
    await apiClient.post('/api/posts', {
      author: author.value.trim(),
      title: title.value.trim(),
      slug: finalSlug,
      summary: subtitle.value.trim(),
      tags,
      content: json,
      status: 'draft',
    })
    publishSuccess.value = 'Draft saved successfully.'
    slug.value = finalSlug
  } catch (error) {
    publishError.value = 'Failed to save draft.'
  } finally {
    isPublishing.value = false
  }
}
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import apiClient from '@/lib/axios'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Cloud,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  Undo2,
  Eye,
} from 'lucide-vue-next'

const title = ref('Untitled draft')
const subtitle = ref('Add a short summary to hook readers...')
const author = ref('')
const slug = ref('')
const tagsInput = ref('')
const isPublishing = ref(false)
const publishError = ref('')
const publishSuccess = ref('')

const applyTheme = (value, persist = false) => {
  const root = document.documentElement
  const body = document.body
  root.classList.toggle('dark', value)
  body.classList.toggle('dark', value)
  root.style.colorScheme = value ? 'dark' : 'light'
  if (persist) {
    localStorage.setItem('theme', value ? 'dark' : 'light')
  }
}

onMounted(() => {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark') {
    applyTheme(true)
  } else {
    // Always default to light mode unless explicitly set
    applyTheme(false)
  }
})

const editor = useEditor({
  content: '<p>Start writing your story...</p>',
  extensions: [
    StarterKit,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Image,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-lg max-w-none prose-slate prose-headings:font-bold prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline focus:outline-none font-sans dark:prose-invert',
    },
  },
})


const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run()
const toggleHeading = () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run()
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run()
const undo = () => editor.value?.chain().focus().undo().run()
const redo = () => editor.value?.chain().focus().redo().run()
const alignLeft = () => editor.value?.chain().focus().setTextAlign('left').run()
const alignCenter = () => editor.value?.chain().focus().setTextAlign('center').run()
const alignRight = () => editor.value?.chain().focus().setTextAlign('right').run()
const alignJustify = () => editor.value?.chain().focus().setTextAlign('justify').run()

const insertImage = () => {
  const url = window.prompt('Enter image URL:')
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

const slugify = (value) => value
  .toString()
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '')
  .replace(/\s+/g, '-')
  .replace(/-+/g, '-')


const publishPost = async () => {
  publishError.value = ''
  publishSuccess.value = ''
  const json = editor.value?.getJSON()
  const finalSlug = slug.value.trim() || slugify(title.value)
  const tags = tagsInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  if (!author.value.trim()) {
    publishError.value = 'Author is required.'
    return
  }
  if (!title.value.trim()) {
    publishError.value = 'Title is required.'
    return
  }
  if (!finalSlug) {
    publishError.value = 'Slug is required.'
    return
  }
  if (!subtitle.value.trim()) {
    publishError.value = 'Summary is required.'
    return
  }
  if (!json) {
    publishError.value = 'Content is empty.'
    return
  }

  isPublishing.value = true
  try {
    await apiClient.post('/api/posts', {
      author: author.value.trim(),
      title: title.value.trim(),
      slug: finalSlug,
      summary: subtitle.value.trim(),
      tags,
      content: json,
      status: 'published',
    })
    publishSuccess.value = 'Post published successfully.'
    slug.value = finalSlug
  } catch (error) {
    publishError.value = 'Failed to publish post.'
  } finally {
    isPublishing.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 font-sans dark:bg-slate-950 dark:text-slate-100">
    <header class="border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/90">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
          <RouterLink to="/home" class="flex items-center gap-2 text-gray-500 hover:text-black dark:text-slate-400 dark:hover:text-white">
            <ArrowLeft class="h-4 w-4" />
            Back to blog
          </RouterLink>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-black dark:border-white/10 dark:text-slate-300 dark:hover:border-white/20 dark:hover:text-white"
            @click="saveDraft"
            :disabled="isPublishing"
          >
            <Save class="h-4 w-4" />
            {{ isPublishing ? 'Saving...' : 'Save draft' }}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            @click="publishPost"
            :disabled="isPublishing"
          >
            <Cloud class="h-4 w-4" />
            {{ isPublishing ? 'Publishing...' : 'Publish' }}
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-slate-500 mb-2">
        Editor
      </div>

      <div class="mt-8 space-y-6">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            v-model="author"
            type="text"
            class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-black focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            placeholder="Author"
          />
          <input
            v-model="slug"
            type="text"
            class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-black focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            placeholder="Slug (auto from title)"
          />
          <input
            v-model="tagsInput"
            type="text"
            class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm focus:border-black focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200"
            placeholder="Tags (comma separated)"
          />
        </div>
        <input
          v-model="title"
          type="text"
          class="w-full border-0 bg-transparent text-4xl font-semibold text-gray-900 placeholder:text-gray-300 focus:outline-none dark:text-white dark:placeholder:text-slate-600"
          placeholder="Blog title"
        />
        <textarea
          v-model="subtitle"
          rows="2"
          class="w-full border-0 bg-transparent text-lg text-gray-500 placeholder:text-gray-300 focus:outline-none dark:text-slate-300 dark:placeholder:text-slate-600 resize-none overflow-auto"
          placeholder="Subtitle or short description"
        />
        <div v-if="publishError" class="text-sm text-red-500">{{ publishError }}</div>
        <div v-if="publishSuccess" class="text-sm text-emerald-600 dark:text-emerald-400">{{ publishSuccess }}</div>
      </div>

      <div class="mt-10 rounded-3xl border border-gray-100 bg-gray-50/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4 dark:border-white/10">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="insertImage"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="12.5" r="1.5"/><path d="M21 19l-5.5-7-4.5 6-2.5-3-4 4"/></svg>
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('bold') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleBold"
          >
            <Bold class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('italic') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleItalic"
          >
            <Italic class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('strike') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleStrike"
          >
            <Strikethrough class="h-4 w-4" />
          </button>
          <div class="mx-1 h-6 w-px bg-gray-200 dark:bg-white/10"></div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('heading', { level: 2 }) ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleHeading"
          >
            <Heading2 class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('bulletList') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleBulletList"
          >
            <List class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('orderedList') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleOrderedList"
          >
            <ListOrdered class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('blockquote') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleBlockquote"
          >
            <Quote class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive('codeBlock') ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="toggleCodeBlock"
          >
            <Code class="h-4 w-4" />
          </button>
          <div class="mx-1 h-6 w-px bg-gray-200 dark:bg-white/10"></div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-500 transition hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
            @click="undo"
          >
            <Undo2 class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-500 transition hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-white/30 dark:hover:text-white"
            @click="redo"
          >
            <Redo2 class="h-4 w-4" />
          </button>
          <div class="mx-1 h-6 w-px bg-gray-200 dark:bg-white/10"></div>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive({ textAlign: 'left' }) ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="alignLeft"
          >
            <AlignLeft class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive({ textAlign: 'center' }) ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="alignCenter"
          >
            <AlignCenter class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive({ textAlign: 'right' }) ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="alignRight"
          >
            <AlignRight class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full border text-gray-500 transition dark:text-slate-300"
            :class="editor?.isActive({ textAlign: 'justify' }) ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-gray-200 bg-white/80 hover:border-gray-300 hover:text-black dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:text-white'"
            @click="alignJustify"
          >
            <AlignJustify class="h-4 w-4" />
          </button>
        </div>
        <EditorContent :editor="editor" />
      </div>
    </main>
  </div>
</template>

<style>
.ProseMirror {
  min-height: 360px;
  outline: none;
}
</style>
