import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectPage from './pages/ProjectPage'
import ChatPage from './pages/ChatPage'
import GitHubCallback from './pages/GitHubCallback'
import GroupsPage from './pages/GroupsPage'
import LoadingSpinner from './components/LoadingSpinner'
import AppLayout from './components/AppLayout'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  return user ? <Navigate to="/dashboard" replace /> : children
}

/** Blocks non-admin users from accessing a route. */
function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

/** Redirects regular users from project detail to chat directly. */
function ProjectRoute() {
  const { user, loading } = useAuth()
  const { id } = useParams()
  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to={`/projects/${id}/chat`} replace />
  return <ProjectPage />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/github/callback" element={<PrivateRoute><GitHubCallback /></PrivateRoute>} />

      {/* Private routes with AppLayout */}
      <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="groups" element={<AdminRoute><GroupsPage /></AdminRoute>} />
        <Route path="projects/:id" element={<ProjectRoute />} />
      </Route>

      {/* Legacy routes for backward compatibility */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="/groups" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<AdminRoute><GroupsPage /></AdminRoute>} />
      </Route>
      <Route path="/projects/:id" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<ProjectRoute />} />
      </Route>

      {/* Chat route (no AppLayout) */}
      <Route path="/projects/:id/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
