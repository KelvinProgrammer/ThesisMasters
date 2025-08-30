// app/api/user/change-password/route.js - Fixed session handling
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
// Try to import authOptions, fallback if not available
let authOptions
try {
  const authModule = await import('@/app/api/auth/[...nextauth]/route')
  authOptions = authModule.authOptions
} catch (error) {
  console.log('AuthOptions not found, using getServerSession without options')
  authOptions = undefined
}
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

// Password validation function
function validatePassword(password) {
  if (!password || password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Password must be less than 128 characters long' }
  }

  return { isValid: true }
}

export async function PUT(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    console.log('Session:', session ? 'Found' : 'Not found')
    
    if (!session || !session.user) {
      console.log('Authentication failed - no session or user')
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    // Check if user has ID in session
    if (!session.user.id && !session.user.email) {
      console.log('No user ID or email in session')
      return NextResponse.json({ message: 'Invalid session data' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    console.log('Request body received:', { 
      hasCurrentPassword: !!currentPassword, 
      hasNewPassword: !!newPassword 
    })

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        message: 'Current password and new password are required' 
      }, { status: 400 })
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        message: passwordValidation.message 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Get user with password - try both ID and email
    let user
    if (session.user.id) {
      user = await User.findById(session.user.id).select('+password')
    } else if (session.user.email) {
      user = await User.findOne({ email: session.user.email }).select('+password')
    }
    
    console.log('User found:', user ? 'Yes' : 'No')
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return NextResponse.json({ 
        message: 'Cannot change password for social login accounts. Please use your social provider to manage your password.' 
      }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    console.log('Current password valid:', isCurrentPasswordValid)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        message: 'Current password is incorrect' 
      }, { status: 400 })
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    
    if (isSamePassword) {
      return NextResponse.json({ 
        message: 'New password must be different from current password' 
      }, { status: 400 })
    }

    // Hash new password with higher salt rounds for better security
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await User.findByIdAndUpdate(
      user._id,
      { 
        password: hashedNewPassword,
        // Update lastLogin to track password change
        lastLogin: new Date()
      },
      { runValidators: true }
    )

    console.log('Password updated successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Optional: Add rate limiting for password changes
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}