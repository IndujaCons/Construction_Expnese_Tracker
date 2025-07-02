import { requireAuth } from '../../lib/nextauth'
import Navigation from '../../components/Navigation'
import CreateProjectForm from './CreateProjectForm'

export default async function CreateProjectPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      <Navigation user={user} />
      
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🚀 Create New Project
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Start a new construction project and invite collaborators
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  )
}