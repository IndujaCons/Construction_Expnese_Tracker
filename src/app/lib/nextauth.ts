import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { prisma } from './db'
import type { UserRole } from '@prisma/client'

export interface User {
  id: number
  name: string | null
  email: string
  role: UserRole
  image?: string | null
}

export async function getSession(): Promise<User | null> {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return null
    }
    
    // Get full user data from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
    })
    
    return user as User | null
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }
  return user
}