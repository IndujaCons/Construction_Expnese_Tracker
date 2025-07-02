import { requireAuth } from '../lib/nextauth'
import Navigation from '../components/Navigation'
import ProjectManagement from './ProjectManagement'

export default async function ProjectsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <Navigation user={user} />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2">
            🏗️ Project Management
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Manage your construction projects and team members
          </p>
        </div>

        <ProjectManagement />
      </div>
    </div>
  )
}