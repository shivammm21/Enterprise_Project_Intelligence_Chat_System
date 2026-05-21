import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { projectService } from '../services/projects'
import Sidebar from '../components/Sidebar'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, FolderOpen, Search, Brain } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await projectService.list()
      setProjects(data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (name, description) => {
    const project = await projectService.create(name, description)
    setProjects([project, ...projects])
    toast.success('Project created!')
  }

  const handleDelete = async (id) => {
    await projectService.delete(id)
    setProjects(projects.filter((p) => p.id !== id))
    toast.success('Project deleted')
  }

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <Sidebar projects={projects} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/50 px-8 py-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-sm text-gray-400">Welcome back, <span className="text-primary-400 font-medium">{user?.name}</span></p>
            </div>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowModal(true)} 
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            )}
          </div>
        </div>

        {/* Stats - Fixed */}
        <div className="flex-shrink-0 px-8 py-6 bg-gray-900/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              icon={<FolderOpen className="h-6 w-6 text-primary-400" />}
              label="Total Projects"
              value={projects.length}
              gradient="from-primary-500/20 to-primary-600/10"
              iconBg="bg-primary-500/10"
            />
            <StatCard
              icon={<Brain className="h-6 w-6 text-purple-400" />}
              label="Total Documents"
              value={projects.reduce((s, p) => s + (p.document_count || 0), 0)}
              gradient="from-purple-500/20 to-purple-600/10"
              iconBg="bg-purple-500/10"
            />
            <StatCard
              icon={<Brain className="h-6 w-6 text-green-400" />}
              label="Total Chats"
              value={projects.reduce((s, p) => s + (p.chat_count || 0), 0)}
              gradient="from-green-500/20 to-green-600/10"
              iconBg="bg-green-500/10"
            />
          </div>
        </div>

        {/* Search - Fixed */}
        {projects.length > 0 && (
          <div className="flex-shrink-0 px-8 pb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full max-w-md bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 text-gray-100 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 placeholder-gray-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Projects grid - Scrollable only */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-2xl" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center border border-gray-700/50">
                  <FolderOpen className="h-10 w-10 text-gray-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                {search ? 'No projects match your search' : 'No projects yet'}
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                {search
                  ? 'Try a different search term'
                  : user?.role === 'admin'
                    ? 'Create your first project to start building a knowledge base'
                    : 'No projects are available yet. Ask your admin to create one.'}
              </p>
              {!search && user?.role === 'admin' && (
                <button 
                  onClick={() => setShowModal(true)} 
                  className="px-6 py-3 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
                >
                  Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && user?.role === 'admin' && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreate={handleCreate} />
      )}
    </div>
  )
}

function StatCard({ icon, label, value, gradient, iconBg }) {
  return (
    <div className={`relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 overflow-hidden group hover:border-gray-600/50 transition-all`}>
      {/* Decorative gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-110 transition-transform`} />
      
      <div className="relative flex items-center gap-4">
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-gray-400 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  )
}
