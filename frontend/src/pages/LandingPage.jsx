import { Link } from 'react-router-dom'
import { 
  Bot, Sparkles, Shield, Zap, FileText, Users, 
  Github as GithubIcon, Lock, ArrowRight, CheckCircle2 
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="VedaSphere" 
                className="h-10 w-10 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl font-bold text-white">VedaSphere</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105 text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-300 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              Enterprise-Grade AI Knowledge Management
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Chat with Your
              <span className="block bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                Documents & Code
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Transform your documents and GitHub repositories into an intelligent knowledge base. 
              Get instant answers powered by AI with source citations.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-8 py-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 hover:border-primary-500/50 text-white rounded-2xl font-semibold transition-all hover:bg-gray-800"
              >
                <Bot className="h-5 w-5" />
                View Demo
              </Link>
            </div>

            {/* Hero Image/Illustration */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                  <Bot className="h-24 w-24 text-primary-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Features for Modern Teams
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Everything you need to build an intelligent knowledge base for your organization
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Document Intelligence</h3>
              <p className="text-gray-400 leading-relaxed">
                Upload PDFs, Word docs, and text files. Our AI extracts and indexes content for instant retrieval.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <GithubIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">GitHub Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your repositories and chat with your codebase. Perfect for onboarding and code reviews.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Context Isolation</h3>
              <p className="text-gray-400 leading-relaxed">
                Each project is completely isolated. AI only accesses documents within the specific project.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Team Collaboration</h3>
              <p className="text-gray-400 leading-relaxed">
                Manage access with groups and roles. Share knowledge across your organization securely.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">
                Vector-based search with ChromaDB ensures instant results, even with thousands of documents.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 hover:border-primary-500/50 transition-all group">
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
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
      <section className="py-20 px-6">
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
      <section className="py-20 px-6">
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
    </div>
  )
}
