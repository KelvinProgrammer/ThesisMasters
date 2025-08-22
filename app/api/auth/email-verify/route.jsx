// app/api/auth/email-verify/route.js (CONSISTENT NAMING)
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb.js'
import User from '../../../../models/User.js'
import Token from '../../../../models/Token.js'

export async function GET(request) {
  try {
    console.log('📧 Email verification attempt started...')
    
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      console.log('❌ No verification token provided')
      return NextResponse.json({ message: 'Verification token is required' }, { status: 400 })
    }

    console.log('🔍 Verifying token:', token.substring(0, 10) + '...')

    await connectToDatabase()
    console.log('✅ Database connected for verification')

    // Find and validate token
    const verificationToken = await Token.findOne({
      token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() }
    })

    if (!verificationToken) {
      console.log('❌ Invalid or expired verification token')
      return NextResponse.json({ 
        message: 'Invalid or expired verification token. Please register again.' 
      }, { status: 400 })
    }

    console.log('✅ Valid token found for user:', verificationToken.userId)

    // Update user as verified
    const user = await User.findByIdAndUpdate(
      verificationToken.userId, 
      { emailVerified: true },
      { new: true }
    )

    if (!user) {
      console.log('❌ User not found')
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    console.log('✅ User email verified:', user.email)

    // Delete the verification token (single use)
    await Token.findByIdAndDelete(verificationToken._id)
    console.log('✅ Verification token deleted')

    return NextResponse.json({ 
      message: 'Email verified successfully',
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('💥 Email verification error:', error)
    return NextResponse.json({ 
      message: 'Internal server error during verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}