// app/api/auth/forgot-password/route.js
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { sendPasswordResetEmail } from '@/lib/email'
import User from '@/models/User'
import Token from '@/models/Token'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      })
    }

    // Delete any existing password reset tokens for this user
    await Token.deleteMany({ 
      userId: user._id, 
      type: 'password_reset' 
    })

    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    await Token.create({
      userId: user._id,
      token: resetToken,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    })

    // Send password reset email
    await sendPasswordResetEmail(email, resetToken, user.name)

    return NextResponse.json({ 
      message: 'If an account with this email exists, a password reset link has been sent.' 
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}