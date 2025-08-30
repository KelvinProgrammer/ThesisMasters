// app/api/auth/admin/register/route.js
import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../../lib/mongodb.js'
import { hashPassword } from '../../../../../lib/auth.js'
import { validateRegistration } from '../../../../../lib/validation.js'
import { sendVerificationEmail } from '../../../../../lib/email.js'
import User from '../../../../../models/User.js'
import Token from '../../../../../models/Token.js'
import crypto from 'crypto'

export async function POST(request) {
  try {
    console.log('📝 Admin registration attempt started...')
    
    const body = await request.json()
    console.log('📦 Request body received:', { 
      name: body.name, 
      email: body.email, 
      hasPassword: !!body.password,
      hasConfirmPassword: !!body.confirmPassword,
      department: body.department,
      permissions: body.permissions
    })

    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      department,
      permissions = [],
      accessLevel = 'junior',
      adminKey // Special key required for admin registration
    } = body

    // Check admin registration key (security measure)
    if (!adminKey || adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return NextResponse.json({ message: 'Invalid admin registration key' }, { status: 403 })
    }

    // Validate input
    console.log('🔍 Validating input...')
    const validation = validateRegistration({ name, email, password, confirmPassword })
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.errors)
      return NextResponse.json({ message: validation.errors[0] }, { status: 400 })
    }

    // Validate admin-specific fields
    if (!department) {
      return NextResponse.json({ message: 'Please select a department' }, { status: 400 })
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ message: 'Please select at least one permission' }, { status: 400 })
    }

    const validDepartments = ['operations', 'quality_assurance', 'customer_support', 'finance', 'technical']
    const validPermissions = ['user_management', 'writer_management', 'content_management', 'payment_management', 'system_settings']
    const validAccessLevels = ['junior', 'senior', 'super_admin']

    if (!validDepartments.includes(department)) {
      return NextResponse.json({ message: 'Invalid department selected' }, { status: 400 })
    }

    if (!validAccessLevels.includes(accessLevel)) {
      return NextResponse.json({ message: 'Invalid access level' }, { status: 400 })
    }

    for (const permission of permissions) {
      if (!validPermissions.includes(permission)) {
        return NextResponse.json({ message: `Invalid permission: ${permission}` }, { status: 400 })
      }
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

    // Create admin user
    console.log('👤 Creating admin...')
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      emailVerified: false,
      adminProfile: {
        permissions,
        department,
        accessLevel
      }
    })
    console.log('✅ Admin created:', { id: user._id, email: user.email, role: user.role })

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

    console.log('🎉 Admin registration completed successfully')
    return NextResponse.json({
      message: 'Admin registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.adminProfile.department,
        accessLevel: user.adminProfile.accessLevel
      }
    }, { status: 201 })

  } catch (error) {
    console.error('💥 Admin registration error:', error)
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
      return NextResponse.json({ message: 'Admin already exists with this email' }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}