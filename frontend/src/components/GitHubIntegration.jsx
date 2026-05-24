import { useState, useEffect } from 'react'
import { Github as GithubIcon, GitBranch, Lock, Unlock, ExternalLink, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { githubService } from '../services/github'
import toast from 'react-hot-toast'

export default function GitHubIntegration({ projectId, onImportComplete }) {
  const [isConnected, setIsConnected] = useState(false)
  const [repos, setRepos] = useState([])
  const [importing, setImporting] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setLoading(true)
    try {
      const status = await githubService.checkStatus()
      if (status.connected) {
        // If connected, fetch repos
        const repos = await githubService.listRepos()
        setRepos(repos)
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = () => {
    const authUrl = githubService.getAuthUrl()
    window.location.href = authUrl
  }

  const handleDisconnect = async () => {
    try {
      await githubService.disconnect()
      setIsConnected(false)
      setRepos([])
      toast.success('GitHub disconnected')
    } catch (error) {
      toast.error('Failed to disconnect GitHub')
    }
  }

  const handleImport = async (repo) => {
    setImporting(repo.full_name)
    try {
      const result = await githubService.importRepo(projectId, repo.full_name, repo.default_branch)
      toast.success(`Imported ${result.documents_created} files from ${repo.name}`)
      
      // Notify parent component to refresh documents list
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to import repository')
    } finally {
      setImporting(null)
    }
  }

  // Show loading only when checking connection and fetching repos
  if (loading) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative">
            <GithubIcon className="h-10 w-10 text-gray-300" />
            <div className="absolute inset-0 rounded-3xl bg-primary-500/20 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Checking GitHub Connection</h3>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <GithubIcon className="h-10 w-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Connect GitHub</h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Connect your GitHub account to import repositories and chat with your code using AI
          </p>
          <button
            onClick={handleConnect}
            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 mx-auto"
          >
            <GithubIcon className="h-5 w-5" />
            Connect GitHub Account
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">GitHub Connected</h3>
              <p className="text-sm text-gray-400">Select a repository to import</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-gray-700/50 hover:border-red-500/50"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Repository List */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6">
        <h4 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary-400" />
          Your Repositories ({repos.length})
        </h4>
        
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {repos.map((repo) => (
            <div
              key={repo.id}
              className="bg-gray-700/30 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-4 hover:border-primary-500/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h5 className="text-white font-medium truncate">{repo.name}</h5>
                    {repo.private ? (
                      <Lock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {repo.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {repo.default_branch}
                    </span>
                    <span>•</span>
                    <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleImport(repo)}
                  disabled={importing === repo.full_name}
                  className="px-4 py-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm rounded-xl font-medium transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                >
                  {importing === repo.full_name ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <GithubIcon className="h-4 w-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-medium mb-1">How it works</p>
            <p className="text-blue-300/80">
              Importing a repository will clone it, extract code files, create chunks, and index them for AI chat. 
              Supported files: .py, .js, .jsx, .ts, .tsx, .java, .cpp, .md, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
