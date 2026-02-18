import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/editor',
      name: 'Editor',
      component: () => import('@/views/Editor.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/blog/:slug',
      name: 'Blog',
      component: () => import('@/views/Blog.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

// Helper to get JWT token from cookies
function getToken(): string | null {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
  const tokenValue = match?.[1]
  return tokenValue ? decodeURIComponent(tokenValue) : null
}

// Helper to check if JWT is expired (assumes JWT format)
function isTokenExpired(token: string | null): boolean {
  if (!token) return true
  try {
    const parts = token.split('.')
    const payloadPart = parts.length > 1 ? parts[1] : null
    if (!payloadPart) return true
    const payload = JSON.parse(atob(payloadPart))
    if (!payload.exp) return false
    return Date.now() / 1000 > payload.exp
  } catch {
    return true
  }
}

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = getToken()
    if (!token || isTokenExpired(token)) {
      return next({ name: 'Login' })
    }
  }
  next()
})

export default router
