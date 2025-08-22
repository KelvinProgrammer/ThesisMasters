// app/api/chapters/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    await connectToDatabase()

    let query = { userId: session.user.id }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit
    const chapters = await Chapter.find(query)
      .sort({ chapterNumber: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('paymentId', 'status amount')

    const total = await Chapter.countDocuments(query)

    return NextResponse.json({
      chapters,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    })
  } catch (error) {
    console.error('Get chapters error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { title, summary, chapterNumber, targetWordCount, deadline, tags } = body

    // Validate required fields
    if (!title || !chapterNumber) {
      return NextResponse.json({ 
        message: 'Title and chapter number are required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Check if chapter number already exists for this user
    const existingChapter = await Chapter.findOne({ 
      userId: session.user.id, 
      chapterNumber 
    })

    if (existingChapter) {
      return NextResponse.json({ 
        message: 'Chapter number already exists' 
      }, { status: 400 })
    }

    const chapter = new Chapter({
      title: title.trim(),
      summary: summary?.trim() || '',
      chapterNumber,
      targetWordCount: targetWordCount || 2000,
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tags || [],
      userId: session.user.id
    })

    await chapter.save()

    return NextResponse.json({ 
      message: 'Chapter created successfully',
      chapter 
    }, { status: 201 })
  } catch (error) {
    console.error('Create chapter error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}