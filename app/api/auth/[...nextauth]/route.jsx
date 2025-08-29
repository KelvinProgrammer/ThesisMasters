// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword } from '@/lib/auth'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter your email and password')
        }

        await connectToDatabase()

        const user = await User.findOne({ email: credentials.email }).select('+password')
        
        if (!user) {
          throw new Error('No user found with this email')
        }

        if (!user.emailVerified) {
          throw new Error('Please verify your email before signing in')
        }

        const isValidPassword = await verifyPassword(credentials.password, user.password)
        
        if (!isValidPassword) {
          throw new Error('Invalid password')
        }

        // Return user object that will be stored in JWT and session
        return {
          id: user._id.toString(), // Convert ObjectId to string
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          emailVerified: user.emailVerified
        }
      }
    }),
    
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.emailVerified = user.emailVerified
      }

      // If signing in with Google, find or create user
      if (account?.provider === 'google' && user) {
        await connectToDatabase()
        
        let dbUser = await User.findOne({ email: user.email })
        
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            provider: 'google',
            emailVerified: true
          })
        }
        
        token.id = dbUser._id.toString()
        token.role = dbUser.role
        token.emailVerified = dbUser.emailVerified
      }

      return token
    },

    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.emailVerified = token.emailVerified
      }
      
      return session
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        return true // Allow Google sign in
      }
      
      // For credentials, user must be verified (handled in authorize)
      return true
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }