// app/api/auth/verify-email/route.js
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Token from '@/models/Token'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Find and validate token
    const verificationToken = await Token.findOne({
      token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() }
    })

    if (!verificationToken) {
      return NextResponse.json({ message: 'Invalid or expired verification token' }, { status: 400 })
    }

    // Update user as verified
    await User.findByIdAndUpdate(verificationToken.userId, {
      emailVerified: true
    })

    // Delete the token
    await Token.findByIdAndDelete(verificationToken._id)

    return NextResponse.json({ message: 'Email verified successfully' })
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
