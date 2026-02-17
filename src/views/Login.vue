<template>
  <div class="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
    <div class="w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-200 bg-white dark:bg-slate-900 dark:border-white/10">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Sign in to boris.blog</h1>
        <p class="mt-2 text-gray-500 dark:text-slate-400">Welcome back! Please enter your credentials.</p>
      </div>
      <form @submit.prevent="onLogin">
        <div v-if="error" class="mb-6 text-center text-sm text-red-500">{{ error }}</div>
        <div class="mb-6">
          <label for="username" class="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Username</label>
          <input
            v-model="username"
            id="username"
            type="text"
            required
            autocomplete="username"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-black focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div class="mb-8">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Password</label>
          <input
            v-model="password"
            id="password"
            type="password"
            required
            autocomplete="current-password"
            class="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-black focus:outline-none dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <button
          type="submit"
          class="w-full rounded-xl bg-black px-4 py-3 text-base font-semibold text-white shadow-md transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Sign in
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/lib/axios'

const username = ref('')
const password = ref('')
const router = useRouter()
const error = ref('')

const onLogin = async () => {
  error.value = ''
  try {
    const response = await apiClient.post('/api/login', {
      username: username.value,
      password: password.value,
    })
    const token = response.data?.token
    if (token) {
      document.cookie = `token=${token}; path=/; secure; samesite=strict`
      router.push('/editor')
    } else {
      error.value = 'Invalid response from server.'
    }
  } catch (err) {
    error.value = 'Invalid credentials or server error.'
  }
}
</script>
