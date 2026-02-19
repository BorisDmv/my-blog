<template>
  <div class="flex flex-col items-center justify-center py-24">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-red-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
    </svg>
    <h2 class="text-2xl font-bold mb-2 text-red-600">Something went wrong</h2>
    <p class="text-gray-600 dark:text-slate-300 mb-6">We couldn't load this post. Please try again later or contact support if the problem persists.</p>
    <router-link to="/" class="inline-block px-6 py-3 bg-black text-white rounded-lg font-semibold shadow hover:bg-gray-900 transition">Go back home</router-link>
  </div>
</template>

<script setup>
defineOptions({ name: 'BlogError' })
</script>
