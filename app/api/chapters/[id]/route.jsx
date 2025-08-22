// app/api/chapters/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import mongoose from 'mongoose'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId: session.user.id 
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
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId: session.user.id 
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
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    await connectToDatabase()

    const chapter = await Chapter.findOneAndDelete({ 
      _id: id, 
      userId: session.user.id 
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