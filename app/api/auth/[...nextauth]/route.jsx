// app/api/auth/[...nextauth]/route.js (FIXED - Enable Email Verification Check)
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from '../../../../lib/mongodb.js'
import { verifyPassword } from '../../../../lib/auth.js'
import User from '../../../../models/User.js'

const authOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Login attempt for:', credentials.email)
        
        try {
          await connectToDatabase()
          console.log('✅ Database connected for login')

          const user = await User.findOne({ email: credentials.email }).select('+password')
          console.log('👤 User found:', !!user)
          
          if (!user) {
            console.log('❌ No user found with email:', credentials.email)
            throw new Error('No user found with this email')
          }

          // CHECK EMAIL VERIFICATION - ENABLED
          if (!user.emailVerified) {
            console.log('❌ Email not verified for:', credentials.email)
            throw new Error('Please verify your email before logging in. Check your inbox for verification link.')
          }

          console.log('🔍 Verifying password...')
          const isValid = await verifyPassword(credentials.password, user.password)
          console.log('🔑 Password valid:', isValid)
          
          if (!isValid) {
            console.log('❌ Invalid password')
            throw new Error('Invalid password')
          }

          console.log('✅ Login successful for:', user.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role || 'student'
          }
        } catch (error) {
          console.error('💥 Login error:', error.message)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('📝 SignIn callback triggered')
      if (account.provider === 'google') {
        console.log('🔍 Google OAuth login')
        await connectToDatabase()
        
        const existingUser = await User.findOne({ email: user.email })
        
        if (!existingUser) {
          console.log('👤 Creating new Google user')
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            emailVerified: true, // Google accounts are automatically verified
            provider: 'google'
          })
        } else {
          // Update existing user to mark as verified if using Google
          await User.findByIdAndUpdate(existingUser._id, {
            emailVerified: true,
            provider: 'google'
          })
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role || 'student'
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    // Add custom error page for better UX
    error: '/auth/error'
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }