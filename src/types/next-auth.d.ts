import NextAuth from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    id: number
    email: string
    name?: string | null
    image?: string | null
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    userId: number
  }
}