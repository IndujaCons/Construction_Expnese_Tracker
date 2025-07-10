'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useSession } from 'next-auth/react'

export interface Project {
  id: number
  name: string
  description: string | null
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
  ownerId: number
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  id: number
  userId: number
  projectId: number
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: Date
  user: {
    id: number
    name: string | null
    email: string
    image: string | null
  }
}

interface ProjectContextType {
  currentProject: Project | null
  userProjects: Project[]
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
  projectMembers: ProjectMember[]
  isLoading: boolean
  setCurrentProject: (project: Project) => void
  refreshProjects: () => Promise<void>
  refreshProjectMembers: () => Promise<void>
  forceRefresh: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null)
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null>(null)
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project)
    localStorage.setItem('currentProjectId', project.id.toString())
    // Update current user role when setting project
    const userMember = projectMembers.find(m => m.userId === session?.user?.id)
    if (userMember) {
      setCurrentUserRole(userMember.role)
    }
    refreshProjectMembers()
  }

  const refreshProjects = async () => {
    if (!session?.user) return

    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setUserProjects(data.projects)
        
        // Set current project if not set or if saved project doesn't exist
        const savedProjectId = localStorage.getItem('currentProjectId')
        let projectToSet = null
        
        if (savedProjectId) {
          projectToSet = data.projects.find((p: Project) => p.id === parseInt(savedProjectId))
        }
        
        // If no saved project or saved project doesn't exist, use first available
        if (!projectToSet && data.projects.length > 0) {
          projectToSet = data.projects[0]
        }
        
        // Set the project if we found one and either no current project or different project
        if (projectToSet && (!currentProject || currentProject.id !== projectToSet.id)) {
          setCurrentProjectState(projectToSet)
          localStorage.setItem('currentProjectId', projectToSet.id.toString())
        }

        // Update current user role for current project
        const activeProject = projectToSet || currentProject
        if (activeProject) {
          const response = await fetch(`/api/projects/${activeProject.id}/members`)
          if (response.ok) {
            const memberData = await response.json()
            const userMember = memberData.members.find((m: ProjectMember) => m.userId === session.user.id)
            setCurrentUserRole(userMember?.role || null)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProjectMembers = async () => {
    if (!currentProject) return

    try {
      const response = await fetch(`/api/projects/${currentProject.id}/members`)
      if (response.ok) {
        const data = await response.json()
        setProjectMembers(data.members)
        
        // Update current user role
        const userMember = data.members.find((m: ProjectMember) => m.userId === session?.user.id)
        setCurrentUserRole(userMember?.role || null)
      }
    } catch (error) {
      console.error('Failed to fetch project members:', error)
    }
  }

  useEffect(() => {
    if (session?.user) {
      refreshProjects()
    }
  }, [session])

  useEffect(() => {
    if (currentProject) {
      refreshProjectMembers()
    }
  }, [currentProject])

  // Force refresh function for after project creation
  const forceRefresh = async () => {
    if (!session?.user) return
    
    try {
      // Clear current state
      setUserProjects([])
      setCurrentProjectState(null)
      setCurrentUserRole(null)
      setIsLoading(true)
      
      // Refresh with cache busting
      const response = await fetch('/api/projects?' + new Date().getTime())
      if (response.ok) {
        const data = await response.json()
        console.log('Force refresh - fetched projects:', data.projects.length)
        setUserProjects(data.projects)
        
        // Set the newest project (just created) as current
        if (data.projects.length > 0) {
          const newestProject = data.projects.sort((a: Project, b: Project) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]
          console.log('Force refresh - setting newest project:', newestProject.name)
          setCurrentProjectState(newestProject)
          localStorage.setItem('currentProjectId', newestProject.id.toString())
          
          // Get user role for the new project
          const memberResponse = await fetch(`/api/projects/${newestProject.id}/members`)
          if (memberResponse.ok) {
            const memberData = await memberResponse.json()
            const userMember = memberData.members.find((m: ProjectMember) => m.userId === session.user.id)
            setCurrentUserRole(userMember?.role || null)
            console.log('Force refresh - user role set:', userMember?.role)
          }
        } else {
          console.log('Force refresh - no projects found')
        }
      }
    } catch (error) {
      console.error('Force refresh failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProjectContext.Provider value={{
      currentProject,
      userProjects,
      currentUserRole,
      projectMembers,
      isLoading,
      setCurrentProject,
      refreshProjects,
      refreshProjectMembers,
      forceRefresh
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}