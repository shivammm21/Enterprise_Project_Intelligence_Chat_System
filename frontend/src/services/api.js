import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally (except for GitHub endpoints which use 401 for "not connected")
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't logout for GitHub "not connected" errors
      const isGitHubEndpoint = error.config?.url?.includes('/github/')
      const isGitHubNotConnected = error.response?.data?.detail === 'GitHub account not connected'
      
      if (!isGitHubEndpoint || !isGitHubNotConnected) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
