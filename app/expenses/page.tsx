import { requireAuth } from '../lib/nextauth'
import { prisma } from '../lib/db'
import Navigation from '../components/Navigation'
import ExpensesList from './ExpensesList'

export default async function ExpensesPage() {
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
  
  const expenses = await prisma.expense.findMany({
    take: 50,
    where: { projectId: userProject.id },
    orderBy: { date: 'desc' },
    include: {
      category: { select: { name: true } },
      user: { select: { id: true, name: true, role: true } },
    },
  })


  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              📋 All Expenses
            </h1>
            <p className="text-lg text-slate-600 font-medium mt-2">View and manage construction expenses</p>
          </div>
          <a
            href="/expenses/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-black rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            ➕ Add New Expense
          </a>
        </div>

        <ExpensesList 
          initialExpenses={expenses} 
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}