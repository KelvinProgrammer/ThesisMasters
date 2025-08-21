// app/api/user/profile/route.js
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import { validateName } from '@/lib/validation'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: user.toSafeObject() })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { name, university, department, researchField } = body

    // Validate input
    if (name) {
      const nameValidation = validateName(name)
      if (!nameValidation.isValid) {
        return NextResponse.json({ message: nameValidation.message }, { status: 400 })
      }
    }

    await connectToDatabase()
    
    const updateData = {}
    if (name) updateData.name = name.trim()
    if (university) updateData.university = university.trim()
    if (department) updateData.department = department.trim()
    if (researchField) updateData.researchField = researchField.trim()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
