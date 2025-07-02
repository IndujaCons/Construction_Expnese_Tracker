import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '../../../lib/db'
import type { UserRole } from '@prisma/client'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // First time user signs in
        token.role = (user as any).role || 'OWNER'
        token.userId = parseInt(String(user.id))
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as UserRole
        ;(session.user as any).id = token.userId as number
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // For new users, assign roles based on email or default to OWNER
            let role: UserRole = 'OWNER'
            
            // You can customize role assignment logic here
            const email = user.email!.toLowerCase()
            if (email.includes('wife') || email.includes('spouse')) {
              role = 'WIFE'
            } else if (email.includes('architect') || email.includes('arch')) {
              role = 'ARCHITECT'
            }

            // Create the user in our database
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role
              }
            })
            
            ;(user as any).id = newUser.id
            ;(user as any).role = newUser.role
          } else {
            ;(user as any).id = existingUser.id
            ;(user as any).role = existingUser.role
          }
          
          return true
        } catch (error) {
          console.error('Error during sign-in:', error)
          return false
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/login',
  },
})

export { handler as GET, handler as POST }