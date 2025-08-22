// app/api/auth/register/route.js (FIXED - Enable Email Verification)
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb.js'
import { hashPassword } from '../../../../lib/auth.js'
import { validateRegistration } from '../../../../lib/validation.js'
import { sendVerificationEmail } from '../../../../lib/email.js'
import User from '../../../../models/User.js'
import Token from '../../../../models/Token.js'
import crypto from 'crypto'

export async function POST(request) {
  try {
    console.log('📝 Registration attempt started...')
    
    const body = await request.json()
    console.log('📦 Request body received:', { 
      name: body.name, 
      email: body.email, 
      hasPassword: !!body.password,
      hasConfirmPassword: !!body.confirmPassword 
    })

    const { name, email, password, confirmPassword } = body

    // Validate input
    console.log('🔍 Validating input...')
    const validation = validateRegistration({ name, email, password, confirmPassword })
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors)
      return NextResponse.json({ message: validation.errors[0] }, { status: 400 })
    }
    console.log('✅ Validation passed')

    console.log('🔌 Connecting to database...')
    await connectToDatabase()
    console.log('✅ Database connected')

    // Check if user already exists
    console.log('👤 Checking if user exists...')
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('❌ User already exists')
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 })
    }
    console.log('✅ User does not exist, proceeding...')

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await hashPassword(password)
    console.log('✅ Password hashed')

    // Create user (emailVerified: false)
    console.log('👤 Creating user...')
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerified: false // IMPORTANT: User must verify email
    })
    console.log('✅ User created:', { id: user._id, email: user.email })

    // Generate verification token
    console.log('🎫 Generating verification token...')
    const verificationToken = crypto.randomBytes(32).toString('hex')
    console.log('✅ Token generated')
    
    console.log('💾 Saving token to database...')
    await Token.create({
      userId: user._id,
      token: verificationToken,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    })
    console.log('✅ Token saved')

    // Send verification email
    console.log('📧 Sending verification email...')
    try {
      await sendVerificationEmail(email, verificationToken, name)
      console.log('✅ Verification email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Delete the user if email fails to send
      await User.findByIdAndDelete(user._id)
      await Token.deleteMany({ userId: user._id })
      return NextResponse.json({ 
        message: 'Failed to send verification email. Please try again.' 
      }, { status: 500 })
    }

    console.log('🎉 Registration completed successfully')
    return NextResponse.json({
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }, { status: 201 })

  } catch (error) {
    console.error('💥 Registration error:', error)
    console.error('📍 Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    
    if (error.name === 'ValidationError') {
      console.log('❌ MongoDB validation error')
      return NextResponse.json({ 
        message: 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ')
      }, { status: 400 })
    }
    
    if (error.code === 11000) {
      console.log('❌ Duplicate key error')
      return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}