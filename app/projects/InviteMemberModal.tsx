'use client'

import { useState } from 'react'

interface InviteMemberModalProps {
  projectId: number
  onClose: () => void
  onSuccess: () => void
}

export default function InviteMemberModal({ projectId, onClose, onSuccess }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'MEMBER' | 'ADMIN' | 'VIEWER'>('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), role }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setInviteLink(data.invitation.inviteLink)
        // Clear form
        setEmail('')
        setRole('MEMBER')
        // Call onSuccess after a delay to show the success message
        setTimeout(() => {
          onSuccess()
        }, 3000)
      } else {
        setError(data.message || 'Failed to send invitation')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">👥 Invite Team Member</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              📧 Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send them an invitation link. They can create an account if they don't have one.
            </p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-bold text-gray-700 mb-2">
              🎭 Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'MEMBER' | 'ADMIN' | 'VIEWER')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="MEMBER">Member - Can add and manage expenses</option>
              <option value="ADMIN">Admin - Can invite members and manage project</option>
              <option value="VIEWER">Viewer - Can only view expenses</option>
            </select>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3 space-y-3">
              <p className="font-medium">✅ {success}</p>
              {inviteLink && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600">Share this invitation link:</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded bg-gray-50 text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(inviteLink)}
                      className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Inviting...</span>
                </div>
              ) : (
                '📨 Send Invitation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}