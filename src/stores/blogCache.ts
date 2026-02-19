import { defineStore } from 'pinia'

export const useBlogCacheStore = defineStore('blogCache', {
  state: () => ({
    posts: {} as Record<string, any>,
  }),
  actions: {
    setPost(slug: string, post: any) {
      this.posts[slug] = post
    },
    getPost(slug: string) {
      return this.posts[slug] || null
    },
    clear() {
      this.posts = {}
    },
  },
})
