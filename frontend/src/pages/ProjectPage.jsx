import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { projectService } from '../services/projects'
import { documentService } from '../services/documents'
import DocumentUpload from '../components/DocumentUpload'
import DocumentList from '../components/DocumentList'
import AccessManager from '../components/AccessManager'
import GroupManager from '../components/GroupManager'
import GitHubIntegration from '../components/GitHubIntegration'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  ArrowLeft, MessageSquare, FileText, Upload, FolderOpen,
  ChevronRight, Layers, Calendar, ShieldCheck, Users, Github
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [project, setProject] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('documents')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isTabTransitioning, setIsTabTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    loadData()
  }, [id])

  const handleTabChange = (tab) => {
    if (tab === activeTab) return
    setIsTabTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      setTimeout(() => setIsTabTransitioning(false), 50)
    }, 150)
  }

  const loadData = async () => {
    try {
      const [proj, docs] = await Promise.all([
        projectService.get(id),
        documentService.list(id),
      ])
      setProject(proj)
      setDocuments(docs)
      setTimeout(() => setIsTransitioning(false), 100)
    } catch {
      toast.error('Failed to load project')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentUploaded = (doc) => {
    setDocuments([doc, ...documents])
    setProject((p) => ({ ...p, document_count: (p.document_count || 0) + 1 }))
  }

  const handleImportComplete = async () => {
    // Refresh documents list after GitHub import
    try {
      const docs = await documentService.list(id)
      setDocuments(docs)
      // Also refresh project to update document count
      const proj = await projectService.get(id)
      setProject(proj)
    } catch (error) {
      console.error('Error refreshing documents:', error)
    }
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
      <main className="flex-1 flex flex-col min-w-0">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0">
          {/* Top Navigation */}
          <div className="bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/50 px-8 py-5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-500 hover:text-primary-400 transition-all hover:-translate-x-1 group"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 text-sm">
                  <Link to="/dashboard" className="text-gray-500 hover:text-primary-400 transition-colors">
                    Dashboard
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                  <span className="text-white font-semibold">{project?.name}</span>
                </div>
              </div>
              <Link
                to={`/projects/${id}/chat`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                <MessageSquare className="h-4 w-4" />
                Open Chat
              </Link>
            </div>
          </div>

          {/* Project Header */}
          <div className={`bg-gray-900/40 backdrop-blur-sm border-b border-gray-800/50 px-8 py-6 transition-all duration-300 ${
            isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
          }`}>
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-6 relative overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -mr-48 -mt-48" />
              
              <div className="relative flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-500/30 flex-shrink-0">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">{project?.name}</h1>
                  {project?.description && (
                    <p className="text-gray-400 text-base mb-4 max-w-2xl">{project.description}</p>
                  )}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-300 bg-gray-700/30 px-4 py-2 rounded-xl">
                      <FileText className="h-4 w-4 text-primary-400" />
                      <span className="font-medium">{project?.document_count}</span>
                      <span className="text-gray-500">documents</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300 bg-gray-700/30 px-4 py-2 rounded-xl">
                      <MessageSquare className="h-4 w-4 text-primary-400" />
                      <span className="font-medium">{project?.chat_count}</span>
                      <span className="text-gray-500">chats</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Created {project && format(new Date(project.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-900/40 backdrop-blur-sm border-b border-gray-800/50 px-8 py-4">
            <div className="flex gap-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-2 w-fit">
              <TabButton active={activeTab === 'documents'} onClick={() => handleTabChange('documents')}>
                <FileText className="h-4 w-4" />
                Documents ({documents.length})
              </TabButton>
              {isAdmin && (
                <TabButton active={activeTab === 'upload'} onClick={() => handleTabChange('upload')}>
                  <Upload className="h-4 w-4" />
                  Upload
                </TabButton>
              )}
              {isAdmin && (
                <TabButton active={activeTab === 'github'} onClick={() => handleTabChange('github')}>
                  <Github className="h-4 w-4" />
                  GitHub
                </TabButton>
              )}
              {isAdmin && (
                <TabButton active={activeTab === 'access'} onClick={() => handleTabChange('access')}>
                  <ShieldCheck className="h-4 w-4" />
                  Access
                </TabButton>
              )}
              {isAdmin && (
                <TabButton active={activeTab === 'groups'} onClick={() => handleTabChange('groups')}>
                  <Users className="h-4 w-4" />
                  Groups
                </TabButton>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto px-8 py-8 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          {/* Tab content */}
          {activeTab === 'documents' && (
            <div className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <h2 className="text-lg font-semibold text-gray-100 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary-400" />
                </div>
                Indexed Documents
              </h2>
              <DocumentList documents={documents} />
            </div>
          )}

          {activeTab === 'upload' && isAdmin && (
            <div className={`bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 max-w-2xl transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <h2 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Upload className="h-4 w-4 text-primary-400" />
                </div>
                Upload Document
              </h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Documents are indexed exclusively to this project. The AI will only use these documents when answering questions in this project.
              </p>
              <DocumentUpload projectId={id} onUploaded={handleDocumentUploaded} />
            </div>
          )}

          {activeTab === 'github' && isAdmin && (
            <div className={`transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <GitHubIntegration projectId={id} onImportComplete={handleImportComplete} />
            </div>
          )}

          {activeTab === 'access' && isAdmin && (
            <div className={`transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <AccessManager projectId={id} />
            </div>
          )}

          {activeTab === 'groups' && isAdmin && (
            <div className={`max-w-2xl transition-all duration-300 ${
              isTabTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}>
              <GroupManager />
            </div>
          )}
        </div>
      </main>
  )
}

function TabButton({ active, onClick, children }) {
  const buttonStyles = active
    ? 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
    : 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'

  return (
    <button onClick={onClick} className={buttonStyles}>
      {children}
    </button>
  )
}
