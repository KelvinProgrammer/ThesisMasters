// app/api/user/change-password/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function PUT(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        message: 'Current password and new password are required' 
      }, { status: 400 })
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        message: 'New password must be at least 6 characters long' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Get user with password
    const user = await User.findById(session.user.id).select('+password')
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Check if user has a password (might be OAuth user)
    if (!user.password) {
      return NextResponse.json({ 
        message: 'Cannot change password for social login accounts' 
      }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
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

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await User.findByIdAndUpdate(
      session.user.id,
      { password: hashedNewPassword },
      { runValidators: true }
    )

    return NextResponse.json({ 
      message: 'Password changed successfully' 
    })

  } catch (error) {
    console.error('Change password error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}