import { requireAuth } from '../lib/nextauth'
import { prisma } from '../lib/db'
import { formatINR, formatDate } from '../lib/utils'
import Navigation from '../components/Navigation'
import DeleteExpenseButton from '../components/DeleteExpenseButton'

export default async function DashboardPage() {
  const user = await requireAuth()
  
  // Get user's projects to find the default project
  const userProjects = await prisma.project.findMany({
    where: {
      members: {
        some: {
          userId: user.id
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Use the first project as default for now
  const defaultProject = userProjects[0]
  
  if (!defaultProject) {
    // If user has no projects, redirect to create one
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <div className="text-6xl mb-8">🏗️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Construction Tracker!</h1>
          <p className="text-lg text-gray-600 mb-8">Create your first project to start tracking construction expenses.</p>
          <a
            href="/projects/create"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            🚀 Create Your First Project
          </a>
        </div>
      </div>
    )
  }
  
  // Get dashboard statistics for the default project
  const [totalExpenses, monthlyExpenses, recentExpenses] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { projectId: defaultProject.id }
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        projectId: defaultProject.id,
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.expense.findMany({
      take: 10,
      where: { projectId: defaultProject.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        user: { select: { id: true, name: true } },
      },
    }),
  ])

  const categoryData = await prisma.category.findMany({
    include: {
      expenses: {
        where: { projectId: defaultProject.id },
        select: { amount: true },
      },
    },
  })

  const categoryStats = categoryData.map(category => ({
    name: category.name,
    total: category.expenses.reduce((sum, expense) => sum + expense.amount, 0),
    count: category.expenses.length,
  })).filter(cat => cat.total > 0).sort((a, b) => b.total - a.total)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            🏗️ Construction Dashboard
          </h1>
          <p className="text-lg text-slate-600 font-medium">Track your building expenses with ease</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wide">💰 Total Expenses</h3>
            <p className="text-3xl font-black text-blue-900 mt-2">
              {formatINR(totalExpenses._sum.amount || 0)}
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1">
              {totalExpenses._count} transactions
            </p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl shadow-lg border border-emerald-100 hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">📅 This Month</h3>
            <p className="text-3xl font-black text-emerald-900 mt-2">
              {formatINR(monthlyExpenses._sum.amount || 0)}
            </p>
            <p className="text-sm text-emerald-600 font-medium mt-1">
              Current month spending
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl shadow-lg border border-orange-100 hover:shadow-xl transition-shadow">
            <h3 className="text-sm font-bold text-orange-700 uppercase tracking-wide">🏷️ Categories</h3>
            <p className="text-3xl font-black text-orange-900 mt-2">
              {categoryStats.length}
            </p>
            <p className="text-sm text-orange-600 font-medium mt-1">
              Active categories
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                📊 <span className="ml-2">Category Breakdown</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {categoryStats.slice(0, 8).map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{category.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{category.count} transactions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-blue-700">
                        {formatINR(category.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                ⏰ <span className="ml-2">Recent Expenses</span>
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{expense.description}</p>
                      <p className="text-sm text-slate-600 font-medium">
                        {expense.category.name} • Added by {expense.user.name}
                      </p>
                      <p className="text-xs text-slate-500 font-medium">{formatDate(expense.date)}</p>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <p className="text-sm font-black text-emerald-700">
                        {formatINR(expense.amount)}
                      </p>
                      <DeleteExpenseButton
                        expenseId={expense.id}
                        expenseDescription={expense.description}
                        canDelete={expense.user.id === user.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <a
            href="/expenses/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-black rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            ➕ Add New Expense
          </a>
        </div>
      </div>
    </div>
  )
}