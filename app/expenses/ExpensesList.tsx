'use client'

import { useState } from 'react'
import { formatINR, formatDate } from '../lib/utils'
import DeleteExpenseButton from '../components/DeleteExpenseButton'

interface Expense {
  id: number
  amount: number
  description: string
  date: Date | string
  category: { name: string }
  user: { id: number; name: string | null; role: string | null }
}

interface ExpensesListProps {
  initialExpenses: Expense[]
  currentUserId: number
}

export default function ExpensesList({ initialExpenses, currentUserId }: ExpensesListProps) {
  const [expenses, setExpenses] = useState(initialExpenses)

  const handleExpenseDeleted = (deletedExpenseId: number) => {
    setExpenses(expenses.filter(expense => expense.id !== deletedExpenseId))
  }

  return (
    <div className="bg-white shadow-xl rounded-xl border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          📊 <span className="ml-2">Recent Expenses</span>
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                📅 Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                📝 Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                🏷️ Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                💰 Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                👤 Added By
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-700 uppercase tracking-wider">
                ⚙️ Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  <div className="max-w-xs truncate">
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">
                  {expense.category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-emerald-700">
                  {formatINR(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                  <div>
                    {expense.user.name || 'Unknown User'}
                    <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-bold">
                      {expense.user.role || 'MEMBER'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <DeleteExpenseButton
                    expenseId={expense.id}
                    expenseDescription={expense.description}
                    canDelete={expense.user.id === currentUserId}
                    onSuccess={() => handleExpenseDeleted(expense.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl font-bold text-slate-600 mb-6">No expenses found.</p>
          <a
            href="/expenses/add"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-black rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
          >
            ➕ Add your first expense
          </a>
        </div>
      )}
    </div>
  )
}