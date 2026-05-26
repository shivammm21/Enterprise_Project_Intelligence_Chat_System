import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  Bot, Sparkles, Shield, Zap, FileText, Users, 
  Github as GithubIcon, Lock, ArrowRight, CheckCircle2,
  User as UserIcon, LogOut, Settings, ChevronDown
} from 'lucide-react'

export default function LandingPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [visibleSections, setVisibleSections] = useState(new Set())

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    const sections = document.querySelectorAll('[data-animate]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  const handleLogout = () => {
    logout()
    setShowProfileMenu(false)
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-lg' 
          : 'bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
              <img 
                src="/logo.png" 
                alt="VedaSphere" 
                className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-110 transition-transform"
              />
              <span className="text-lg sm:text-xl font-bold text-white">VedaSphere</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user ? (
                // Logged in - Show profile dropdown
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-primary-500/50 text-white rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                      <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">{user.name}</span>
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowProfileMenu(false)}
                      />
                      
                      {/* Menu */}
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl py-2 z-50 animate-fadeIn">
                        <div className="px-4 py-3 border-b border-gray-700/50">
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          {user.role === 'admin' && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        
                        <button
                          onClick={handleDashboard}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors text-sm"
                        >
                          <Settings className="h-4 w-4" />
                          Go to Dashboard
                        </button>
                        
                        <div className="border-t border-gray-700/50 my-1" />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                // Not logged in - Show login/register buttons
                <>
                  <Link
                    to="/login"
                    className="px-3 sm:px-5 py-2 text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 sm:px-5 py-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 text-xs sm:text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              Enterprise-Grade AI Knowledge Management
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Chat with Your
              <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Documents & Code
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-xl text-gray-400 mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto px-4">
              Transform your documents and GitHub repositories into an intelligent knowledge base. 
              Get instant answers powered by AI with source citations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>

            {/* Hero Image/Illustration */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/main-tool.png" 
                    alt="VedaSphere Dashboard" 
                    className="w-full h-full object-contain p-4"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="features" 
        data-animate 
        className={`py-12 sm:py-20 px-4 sm:px-6 ${visibleSections.has('features') ? 'animate-in' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Everything you need to build an intelligent knowledge base for your organization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div data-stagger="1" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Document Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload PDFs, Word docs, and text files. Our AI extracts and indexes content for instant retrieval.
              </p>
            </div>

            {/* Feature 2 */}
            <div data-stagger="2" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <GithubIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">GitHub Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your repositories and chat with your codebase. Perfect for onboarding and code reviews.
              </p>
            </div>

            {/* Feature 3 */}
            <div data-stagger="3" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Context Isolation</h3>
              <p className="text-gray-400 leading-relaxed">
                Each project is completely isolated. AI only accesses documents within the specific project.
              </p>
            </div>

            {/* Feature 4 */}
            <div data-stagger="4" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
              <p className="text-gray-400 leading-relaxed">
                Manage access with groups and roles. Share knowledge across your organization securely.
              </p>
            </div>

            {/* Feature 5 */}
            <div data-stagger="5" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Vector-based search with ChromaDB ensures instant results, even with thousands of documents.
              </p>
            </div>

            {/* Feature 6 */}
            <div data-stagger="6" className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group opacity-0">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Source Citations</h3>
              <p className="text-gray-400 leading-relaxed">
                Every answer includes source references with relevance scores. Verify information instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        id="how-it-works" 
        data-animate 
        className={`py-12 sm:py-20 px-4 sm:px-6 bg-gray-900/50 ${visibleSections.has('how-it-works') ? 'animate-in' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Get started in minutes with our simple three-step process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Create a Project</h3>
                <p className="text-gray-400 leading-relaxed">
                  Set up a new project for your team, department, or specific use case.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Upload Content</h3>
                <p className="text-gray-400 leading-relaxed">
                  Add documents or connect GitHub repositories. AI automatically indexes everything.
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Start Chatting</h3>
              <p className="text-gray-400 leading-relaxed">
                Ask questions in natural language. Get accurate answers with source citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section 
        id="benefits" 
        data-animate 
        className={`py-20 px-6 ${visibleSections.has('benefits') ? 'animate-in' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Teams Choose Us
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Built for modern teams who need fast, accurate access to their knowledge base without the complexity.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">No Training Required</h4>
                    <p className="text-gray-400 text-sm">Just upload and start asking questions. It's that simple.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Enterprise Security</h4>
                    <p className="text-gray-400 text-sm">Role-based access control and complete data isolation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Always Accurate</h4>
                    <p className="text-gray-400 text-sm">Every answer includes source citations for verification.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">Scales with You</h4>
                    <p className="text-gray-400 text-sm">From small teams to enterprise organizations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <Bot className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full w-3/5 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary-400" />
                    </div>
                    <div className="flex-1 h-3 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        id="cta" 
        data-animate 
        className={`py-20 px-6 ${visibleSections.has('cta') ? 'animate-in' : ''}`}
      >
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl blur-3xl" />
            <div className="relative bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-12 text-center shadow-2xl">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Knowledge Base?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Join teams who are already using AI to unlock the power of their documents and code.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 text-gray-300 hover:text-white transition-colors font-semibold"
                >
                  Already have an account? Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="VedaSphere" className="h-8 w-8" />
              <span className="text-gray-400 text-sm">
                © 2026 VedaSphere. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
      </div> {/* End content wrapper */}
    </div>
  )
}
