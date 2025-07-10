'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface Invitation {
  id: number
  email: string
  role: string
  expires: string
  project: {
    id: number
    name: string
    description?: string
  }
  inviter: {
    name: string
    email: string
  }
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepting, setAccepting] = useState(false)

  // Fetch invitation details
  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/${token}`)
        const data = await response.json()

        if (response.ok) {
          setInvitation(data.invitation)
        } else {
          setError(data.message || 'Invalid invitation')
        }
      } catch (error) {
        setError('Failed to load invitation')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token])

  // Accept invitation when user is logged in
  const handleAcceptInvitation = async () => {
    if (!session) {
      // Redirect to sign in with invitation token in state
      signIn('google', { 
        callbackUrl: `/invite/${token}` 
      })
      return
    }

    setAccepting(true)
    setError('')

    try {
      const response = await fetch(`/api/invitations/${token}`, {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Redirect to the project
        router.push(`/dashboard?project=${data.projectId}`)
      } else {
        setError(data.message || 'Failed to accept invitation')
      }
    } catch (error) {
      setError('Failed to accept invitation')
    } finally {
      setAccepting(false)
    }
  }

  // Auto-accept invitation if user is already logged in with correct email
  useEffect(() => {
    if (session && invitation && session.user?.email === invitation.email && !accepting) {
      handleAcceptInvitation()
    }
  }, [session, invitation])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're Invited!</h1>
          <p className="text-gray-600">Join the construction project team</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{invitation.project.name}</h2>
            {invitation.project.description && (
              <p className="text-sm text-gray-600">{invitation.project.description}</p>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            <p><span className="font-medium">Invited by:</span> {invitation.inviter.name}</p>
            <p><span className="font-medium">Role:</span> {invitation.role}</p>
            <p><span className="font-medium">For:</span> {invitation.email}</p>
          </div>
        </div>

        {!session ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Sign in with Google to accept this invitation
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: `/invite/${token}` })}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : session.user?.email !== invitation.email ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                This invitation is for <strong>{invitation.email}</strong>, but you're signed in as <strong>{session.user.email}</strong>.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => signIn('google', { callbackUrl: `/invite/${token}` })}
                className="flex-1 bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign in with correct account
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {accepting ? (
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-blue-800 font-medium">Joining project...</p>
              </div>
            ) : (
              <button
                onClick={handleAcceptInvitation}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Accept Invitation & Join Project
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}