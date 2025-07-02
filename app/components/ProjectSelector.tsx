'use client'

import { useState } from 'react'
import { useProject } from '../lib/project-context'

export default function ProjectSelector() {
  const { currentProject, userProjects, setCurrentProject, isLoading, refreshProjects, forceRefresh } = useProject()
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = async () => {
    if (!isOpen) {
      // Force refresh projects when opening dropdown to ensure latest data
      await forceRefresh()
    }
    setIsOpen(!isOpen)
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        <span className="text-white text-sm">Loading projects...</span>
      </div>
    )
  }

  if (!currentProject && !isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleToggle}
          className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg"
        >
          <span className="text-lg">🏗️</span>
          <span className="font-medium">No projects available</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
              <div className="p-4 text-center">
                <div className="text-6xl mb-4">🏗️</div>
                <p className="text-gray-600 mb-4">No projects found</p>
                <a
                  href="/projects/create"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                >
                  ➕ Create Your First Project
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="text-white text-sm">
        Loading projects...
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 text-white hover:text-orange-200 transition-colors bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg"
      >
        <span className="text-lg">🏗️</span>
        <span className="font-medium max-w-40 truncate">{currentProject.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
            <div className="p-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wide px-3 py-2">
                Your Projects
              </div>
              <div className="space-y-1">
                {userProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      project.id === currentProject.id
                        ? 'bg-orange-100 text-orange-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${
                      project.status === 'ARCHIVED' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">
                        {project.status === 'COMPLETED' ? '✅' : 
                         project.status === 'ARCHIVED' ? '📦' : '🏗️'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate flex items-center space-x-2">
                          <span>{project.name}</span>
                          {project.status !== 'ACTIVE' && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              project.status === 'COMPLETED' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {project.status}
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {project.description}
                          </div>
                        )}
                      </div>
                      {project.id === currentProject.id && (
                        <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <a
                  href="/projects/create"
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Create New Project</span>
                </a>
                <a
                  href="/projects"
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <span>⚙️</span>
                  <span>Manage Projects</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}