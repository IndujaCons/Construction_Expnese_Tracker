import { redirect } from 'next/navigation'
import { getSession } from '../lib/nextauth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const user = await getSession()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-orange-50 to-amber-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-4">
            Construction Tracker
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Sign in to track your construction expenses
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}