import api from './api'

export const githubService = {
  async checkStatus() {
    const response = await api.get('/github/status')
    return response.data
  },

  async authenticate(code) {
    const response = await api.post('/github/auth', { code })
    return response.data
  },

  async listRepos() {
    const response = await api.get('/github/repos')
    return response.data
  },

  async importRepo(projectId, repoFullName, branch = 'main') {
    const response = await api.post('/github/import', {
      project_id: projectId,
      repo_full_name: repoFullName,
      branch
    })
    return response.data
  },

  async disconnect() {
    const response = await api.delete('/github/disconnect')
    return response.data
  },

  getAuthUrl() {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
    const redirectUri = `${window.location.origin}/github/callback`
    // Save current location to return after auth
    sessionStorage.setItem('github_return_to', window.location.pathname)
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`
  }
}
