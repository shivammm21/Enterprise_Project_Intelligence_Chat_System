import React, { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { githubService } from '../services/github'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export default function GitHubCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authInProgress = useRef(false)

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (authInProgress.current) return

    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      toast.error('GitHub authentication failed')
      navigate('/dashboard')
      return
    }

    if (code) {
      authInProgress.current = true
      handleAuth(code)
    } else {
      navigate('/dashboard')
    }
  }, [])

  const handleAuth = async (code) => {
    try {
      await githubService.authenticate(code)
      toast.success('GitHub connected successfully')
      // Redirect back to the project page they came from, or dashboard
      const returnTo = sessionStorage.getItem('github_return_to') || '/dashboard'
      sessionStorage.removeItem('github_return_to')
      navigate(returnTo)
    } catch (error) {
      // Only show error if it's not a "code already used" error
      const errorMessage = error.response?.data?.detail || 'Failed to connect GitHub'
      if (!errorMessage.includes('already')) {
        toast.error(errorMessage)
      }
      navigate('/dashboard')
    }
  }

  return <LoadingSpinner fullScreen />
}
