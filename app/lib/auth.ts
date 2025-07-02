import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

export interface User {
  id: number
  name: string
  email: string
  role: 'OWNER' | 'WIFE' | 'ARCHITECT'
}

export async function createSession(userId: number) {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  
  const cookieStore = await cookies()
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
  
  // Store session in a simple way - in production you'd want a proper session store
  cookieStore.set('userId', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')
    const userIdCookie = cookieStore.get('userId')
    
    if (!sessionCookie || !userIdCookie) {
      return null
    }
    
    const userId = parseInt(userIdCookie.value)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })
    
    return user as User | null
  } catch (error) {
    return null
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
  cookieStore.delete('userId')
  redirect('/login')
}

export async function requireAuth(): Promise<User> {
  const user = await getSession()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function verifyPassword(plainTextPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}