import apiClient from './api'

export async function searchPosts(query: string, page = 1, limit = 10) {
  const response = await apiClient.get('/api/posts/search', {
    params: { q: query, page, limit },
  })
  // API returns { data: [...], page, limit, total }
  return {
    items: response.data.data,
    page: response.data.page,
    limit: response.data.limit,
    total: response.data.total,
  }
}
