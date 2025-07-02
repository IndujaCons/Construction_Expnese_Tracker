import { requireAuth } from '../../lib/nextauth'
import { prisma } from '../../lib/db'
import Navigation from '../../components/Navigation'
import AddExpenseForm from './AddExpenseForm'

export default async function AddExpensePage() {
  const user = await requireAuth()
  
  // Get user's default project
  const userProject = await prisma.project.findFirst({
    where: {
      members: {
        some: {
          userId: user.id
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (!userProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Project Found</h1>
          <p className="text-lg text-gray-600 mb-8">Please create or join a project first.</p>
          <a href="/projects/create" className="text-blue-600 hover:text-blue-800">Create Project</a>
        </div>
      </div>
    )
  }
  
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            ➕ Add New Expense
          </h1>
          <p className="text-lg text-slate-600 font-medium">Record a new construction expense</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <AddExpenseForm categories={categories} user={user} project={userProject} />
        </div>
      </div>
    </div>
  )
}