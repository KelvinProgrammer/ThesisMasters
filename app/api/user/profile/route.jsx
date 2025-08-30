// app/api/user/profile/route.js - Fixed session handling
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
import { validateName } from '@/lib/validation'
import User from '@/models/User'

export async function GET(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    console.log('GET Profile - Session:', session ? 'Found' : 'Not found')
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()
    
    // Get user by ID or email
    let user
    if (session.user.id) {
      user = await User.findById(session.user.id).select('-password')
    } else if (session.user.email) {
      user = await User.findOne({ email: session.user.email }).select('-password')
    }
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      user: user.toSafeObject() 
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    console.log('PUT Profile - Session:', session ? 'Found' : 'Not found')
    
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, university, department, researchField, phone, bio } = body

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        message: 'Name is required' 
      }, { status: 400 })
    }

    // Validate name
    const nameValidation = validateName(name)
    if (!nameValidation.isValid) {
      return NextResponse.json({ 
        message: nameValidation.message 
      }, { status: 400 })
    }

    // Basic field length validation
    if (university && university.length > 100) {
      return NextResponse.json({ 
        message: 'University name must be less than 100 characters' 
      }, { status: 400 })
    }

    if (department && department.length > 100) {
      return NextResponse.json({ 
        message: 'Department name must be less than 100 characters' 
      }, { status: 400 })
    }

    if (researchField && researchField.length > 200) {
      return NextResponse.json({ 
        message: 'Research field must be less than 200 characters' 
      }, { status: 400 })
    }

    if (bio && bio.length > 500) {
      return NextResponse.json({ 
        message: 'Bio must be less than 500 characters' 
      }, { status: 400 })
    }

    await connectToDatabase()
    
    // Build update object with only provided fields
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (university !== undefined) updateData.university = university.trim()
    if (department !== undefined) updateData.department = department.trim()
    if (researchField !== undefined) updateData.researchField = researchField.trim()
    if (phone !== undefined) updateData.phone = phone.trim()
    if (bio !== undefined) updateData.bio = bio.trim()

    // Update user by ID or email
    let user
    if (session.user.id) {
      user = await User.findByIdAndUpdate(
        session.user.id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      )
    } else if (session.user.email) {
      user = await User.findOneAndUpdate(
        { email: session.user.email },
        updateData,
        { 
          new: true, 
          runValidators: true,
          select: '-password'
        }
      )
    }

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    })
  } catch (error) {
    console.error('Update profile error:', error)
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0]
      return NextResponse.json({ 
        message: firstError.message 
      }, { status: 400 })
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json({ 
        message: 'Email already exists' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}