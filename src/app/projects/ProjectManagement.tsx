'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useProject } from '../lib/project-context'
import InviteMemberModal from './InviteMemberModal'
import ProjectSettingsModal from './ProjectSettingsModal'

export default function ProjectManagement() {
  const { data: session } = useSession()
  const { currentProject, projectMembers, currentUserRole, refreshProjectMembers, forceRefresh } = useProject()
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null)
  const router = useRouter()

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (!currentProject) return
    
    const confirmed = window.confirm(
      `Are you sure you want to remove ${memberName} from this project? This action cannot be undone.`
    )
    
    if (!confirmed) return

    setDeletingMemberId(memberId)
    
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memberId }),
      })

      if (response.ok) {
        const data = await response.json()
        await refreshProjectMembers()
        // Show success message (you could add a toast notification here)
        console.log(data.message)
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Error removing member:', error)
      alert('An error occurred while removing the member')
    } finally {
      setDeletingMemberId(null)
    }
  }

  const canRemoveMember = (member: any) => {
    // Only OWNER and ADMIN can remove members
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'ADMIN') return false
    
    // Cannot remove the project owner
    if (member.role === 'OWNER') return false
    
    // Only owners can remove admins
    if (member.role === 'ADMIN' && currentUserRole !== 'OWNER') return false
    
    // Cannot remove yourself
    if (member.userId === session?.user?.id) return false
    
    return true
  }

  if (!currentProject) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">🏗️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Project Selected</h2>
        <p className="text-gray-600 mb-6">Select a project from the navigation bar to manage it.</p>
        <a
          href="/projects/create"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          🚀 Create New Project
        </a>
      </div>
    )
  }

  const canInviteMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN'

  return (
    <div className="space-y-8">
      {/* Project Details */}
      <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentProject.name}</h2>
            {currentProject.description && (
              <p className="text-gray-600">{currentProject.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentProject.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800'
                  : currentProject.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentProject.status}
              </span>
              <span className="text-sm text-gray-500">
                Created {new Date(currentProject.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Your Role</div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentUserRole === 'OWNER'
                  ? 'bg-purple-100 text-purple-800'
                  : currentUserRole === 'ADMIN'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentUserRole}
              </span>
            </div>
            {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-all flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Members */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-100">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              👥 <span className="ml-2">Team Members ({projectMembers.length})</span>
            </h3>
            {canInviteMembers && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                ➕ Invite Member
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {projectMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {member.user.name ? member.user.name.charAt(0).toUpperCase() : member.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.user.name || 'Unknown User'}
                    </div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                    <div className="text-xs text-gray-400">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    member.role === 'OWNER'
                      ? 'bg-purple-100 text-purple-800'
                      : member.role === 'ADMIN'
                      ? 'bg-blue-100 text-blue-800'
                      : member.role === 'MEMBER'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                  {canRemoveMember(member) && (
                    <button
                      onClick={() => handleRemoveMember(member.id, member.user.name || member.user.email)}
                      disabled={deletingMemberId === member.id}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 text-xs font-medium"
                      title={`Remove ${member.user.name || member.user.email} from project`}
                    >
                      {deletingMemberId === member.id ? (
                        <div className="flex items-center space-x-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-red-700"></div>
                          <span>Removing...</span>
                        </div>
                      ) : (
                        <>
                          <span>🗑️</span>
                          <span>Remove</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          projectId={currentProject.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false)
            refreshProjectMembers()
          }}
        />
      )}

      {/* Project Settings Modal */}
      {showSettingsModal && (
        <ProjectSettingsModal
          project={currentProject}
          userRole={currentUserRole}
          onClose={() => setShowSettingsModal(false)}
          onSuccess={() => {
            setShowSettingsModal(false)
            forceRefresh()
          }}
          onDelete={() => {
            setShowSettingsModal(false)
            forceRefresh()
            router.push('/dashboard')
          }}
        />
      )}
    </div>
  )
}