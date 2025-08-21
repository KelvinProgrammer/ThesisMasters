// app/api/auth/reset-password/route.js
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { hashPassword } from '@/lib/auth'
import { validatePassword } from '@/lib/validation'
import User from '@/models/User'
import Token from '@/models/Token'

export async function POST(request) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    if (!token || !password || !confirmPassword) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: 'Passwords do not match' }, { status: 400 })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ message: passwordValidation.message }, { status: 400 })
    }

    await connectToDatabase()

    // Find and validate token
    const resetToken = await Token.findOne({
      token,
      type: 'password_reset',
      expiresAt: { $gt: new Date() }
    })

    if (!resetToken) {
      return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await User.findByIdAndUpdate(resetToken.userId, {
      password: hashedPassword
    })

    // Delete all password reset tokens for this user
    await Token.deleteMany({ 
      userId: resetToken.userId, 
      type: 'password_reset' 
    })

    return NextResponse.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}