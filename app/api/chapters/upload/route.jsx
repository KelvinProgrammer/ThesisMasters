// app/api/chapters/upload/route.js - File Upload Handler
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const chapterId = formData.get('chapterId')

    if (!file || !chapterId) {
      return NextResponse.json({ 
        message: 'File and chapter ID are required' 
      }, { status: 400 })
    }

    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Only PDF, DOC, DOCX, and TXT files are allowed' 
      }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return NextResponse.json({ 
        message: 'File size must be less than 10MB' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Verify chapter ownership
    const chapter = await Chapter.findOne({ 
      _id: chapterId, 
      userId: session.user.id 
    })

    if (!chapter) {
      return NextResponse.json({ 
        message: 'Chapter not found' 
      }, { status: 404 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'chapters')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${chapterId}_${timestamp}_${cleanFileName}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Update chapter with file information
    const fileInfo = {
      originalName: file.name,
      fileName: fileName,
      filePath: `/uploads/chapters/${fileName}`,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date()
    }

    // Add to chapter's files array (or create if doesn't exist)
    if (!chapter.files) {
      chapter.files = []
    }
    chapter.files.push(fileInfo)
    
    // Update status to in_progress if it was draft
    if (chapter.status === 'draft') {
      chapter.status = 'in_progress'
    }

    await chapter.save()

    console.log('File uploaded successfully:', fileName)

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: fileInfo
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json({ 
      message: 'Failed to upload file: ' + error.message 
    }, { status: 500 })
  }
}