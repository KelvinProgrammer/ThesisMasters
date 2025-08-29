// app/api/chapters/[id]/route.js - FIXED VERSION
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Import your authOptions
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import User from '@/models/User'
import mongoose from 'mongoose'

// Helper function to get userId from session
async function getUserIdFromSession(session) {
  let userId = session.user.id || session.user._id
  
  // If still no userId, try to find user by email
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email })
    if (user) {
      userId = user._id
    }
  }
  
  return userId
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const userId = await getUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId 
    }).populate('paymentId', 'status amount currency')

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({ chapter })
  } catch (error) {
    console.error('Get chapter error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const userId = await getUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId 
    })

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'content', 'summary', 'status', 'targetWordCount', 
      'deadline', 'tags', 'notes'
    ]

    const updates = {}
    allowedUpdates.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    })

    // If content is being updated, recalculate word count
    if (updates.content !== undefined) {
      updates.wordCount = updates.content.split(/\s+/).filter(word => word.length > 0).length
    }

    // If creating a revision, save the current version
    if (updates.content && updates.content !== chapter.content) {
      chapter.revisions.push({
        version: chapter.revisions.length + 1,
        content: chapter.content,
        changes: body.changes || 'Content updated',
        createdAt: new Date()
      })
    }

    Object.assign(chapter, updates)
    await chapter.save()

    return NextResponse.json({ 
      message: 'Chapter updated successfully',
      chapter 
    })
  } catch (error) {
    console.error('Update chapter error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const userId = await getUserIdFromSession(session)
    if (!userId) {
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    const chapter = await Chapter.findOneAndDelete({ 
      _id: id, 
      userId 
    })

    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Chapter deleted successfully' 
    })
  } catch (error) {
    console.error('Delete chapter error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}