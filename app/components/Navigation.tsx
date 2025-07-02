'use client'

import { User } from '../lib/nextauth'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import ProjectSelector from './ProjectSelector'

interface NavigationProps {
  user: User
}

export default function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Expenses', href: '/expenses' },
    { name: 'Add Expense', href: '/expenses/add' },
  ]

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-black bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent hover:from-orange-300 hover:to-amber-300 transition-all">
              🏗️ Construction Tracker
            </Link>
            <ProjectSelector />
            <div className="hidden md:flex space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-bold px-3 py-2 rounded-md transition-all ${
                    pathname === item.href
                      ? 'text-white bg-orange-600 shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="font-bold text-white">{user.name || 'User'}</span>
              <span className="ml-2 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1 rounded-full font-bold">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-300 hover:text-white text-sm font-bold px-3 py-2 rounded-md hover:bg-red-600 transition-all"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}