// app/api/chapters/[id]/files/route.js - File Deletion Handler
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import { unlink } from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { fileName } = body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 })
    }

    if (!fileName) {
      return NextResponse.json({ message: 'File name is required' }, { status: 400 })
    }

    await connectToDatabase()

    // Get user ID
    let userId = session.user.id || session.user._id
    if (!userId && session.user.email) {
      const User = require('@/models/User').default
      const user = await User.findOne({ email: session.user.email })
      if (user) userId = user._id
    }

    if (!userId) {
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    // Verify chapter ownership
    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId 
    })

    if (!chapter) {
      return NextResponse.json({ 
        message: 'Chapter not found' 
      }, { status: 404 })
    }

    // Find the file to delete
    const fileIndex = chapter.files.findIndex(file => file.fileName === fileName)
    
    if (fileIndex === -1) {
      return NextResponse.json({ 
        message: 'File not found' 
      }, { status: 404 })
    }

    const fileToDelete = chapter.files[fileIndex]

    try {
      // Delete physical file from filesystem
      const filePath = path.join(process.cwd(), 'public', 'uploads', 'chapters', fileName)
      await unlink(filePath)
      console.log('Physical file deleted:', filePath)
    } catch (fsError) {
      console.warn('Could not delete physical file:', fsError.message)
      // Continue with database deletion even if physical file deletion fails
    }

    // Remove file from chapter's files array
    chapter.files.splice(fileIndex, 1)
    await chapter.save()

    console.log('File deleted from chapter:', fileName)

    return NextResponse.json({
      message: 'File deleted successfully',
      fileName
    })

  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json({ 
      message: 'Failed to delete file: ' + error.message 
    }, { status: 500 })
  }
}

// GET endpoint to retrieve files for a chapter
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

    // Get user ID
    let userId = session.user.id || session.user._id
    if (!userId && session.user.email) {
      const User = require('@/models/User').default
      const user = await User.findOne({ email: session.user.email })
      if (user) userId = user._id
    }

    if (!userId) {
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    // Verify chapter ownership and get files
    const chapter = await Chapter.findOne({ 
      _id: id, 
      userId 
    }).select('files title chapterNumber')

    if (!chapter) {
      return NextResponse.json({ 
        message: 'Chapter not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      files: chapter.files || [],
      chapter: {
        id: chapter._id,
        title: chapter.title,
        chapterNumber: chapter.chapterNumber
      }
    })

  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json({ 
      message: 'Failed to get files: ' + error.message 
    }, { status: 500 })
  }
}