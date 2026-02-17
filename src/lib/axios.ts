import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    Accept: 'application/json',
  },
})

const getToken = () => {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/)
  const tokenValue = match?.[1]
  return tokenValue ? decodeURIComponent(tokenValue) : null
}

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default apiClient
