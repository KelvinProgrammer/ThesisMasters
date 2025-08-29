// app/api/chapters/route.js - FIXED GET method with proper status filtering
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Import your authOptions
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import User from '@/models/User'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10

    console.log('GET chapters - Status param:', statusParam)

    await connectToDatabase()

    // Get user ID - handle different possible formats
    let userId = session.user.id || session.user._id
    
    // If still no userId, try to find user by email
    if (!userId && session.user.email) {
      const user = await User.findOne({ email: session.user.email })
      if (user) {
        userId = user._id
        console.log('Found userId from database:', userId)
      }
    }

    if (!userId) {
      console.error('No userId found in session:', session)
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    console.log('Using userId for GET:', userId)

    // Build query
    let query = { userId }

    // Handle status filtering - support comma-separated values
    if (statusParam) {
      const statusArray = statusParam.split(',').map(s => s.trim())
      console.log('Status array:', statusArray)
      
      if (statusArray.length === 1) {
        query.status = statusArray[0]
      } else if (statusArray.length > 1) {
        query.status = { $in: statusArray }
      }
    }

    console.log('Final query:', JSON.stringify(query, null, 2))

    const skip = (page - 1) * limit
    const chapters = await Chapter.find(query)
      .sort({ chapterNumber: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('paymentId', 'status amount')

    console.log('Found chapters:', chapters.length)
    console.log('Chapter details:', chapters.map(c => ({ 
      id: c._id, 
      title: c.title, 
      status: c.status,
      chapterNumber: c.chapterNumber 
    })))

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    console.log('POST chapters - Session object:', JSON.stringify(session, null, 2))

    const body = await request.json()
    const { title, summary, chapterNumber, targetWordCount, deadline, tags, level, workType, urgency, estimatedPages, pricing, estimatedCost } = body

    // Validate required fields
    if (!title || !chapterNumber) {
      return NextResponse.json({ 
        message: 'Title and chapter number are required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Get user ID - try different possible formats
    let userId = session.user.id || session.user._id
    
    // If still no userId, try to find user by email
    if (!userId && session.user.email) {
      const user = await User.findOne({ email: session.user.email })
      if (user) {
        userId = user._id
        console.log('Found userId from database:', userId)
      }
    }

    // Final check
    if (!userId) {
      console.error('No userId found in session:', session)
      return NextResponse.json({ 
        message: 'User identification failed' 
      }, { status: 400 })
    }

    console.log('Using userId:', userId)

    // Check if chapter number already exists for this user
    const existingChapter = await Chapter.findOne({ 
      userId, 
      chapterNumber 
    })

    if (existingChapter) {
      return NextResponse.json({ 
        message: 'Chapter number already exists' 
      }, { status: 400 })
    }

    // Create chapter with all fields
    const chapterData = {
      title: title.trim(),
      summary: summary?.trim() || '',
      chapterNumber,
      targetWordCount: targetWordCount || 2000,
      deadline: deadline ? new Date(deadline) : undefined,
      tags: tags || [],
      userId,
      // New pricing fields
      level: level || 'masters',
      workType: workType || 'coursework',
      urgency: urgency || 'normal',
      estimatedPages: estimatedPages || Math.ceil((targetWordCount || 2000) / 250),
      estimatedCost: estimatedCost || 0,
      pricing: pricing || {}
    }

    console.log('Creating chapter with data:', JSON.stringify(chapterData, null, 2))

    const chapter = new Chapter(chapterData)
    await chapter.save()

    console.log('Chapter created successfully:', chapter._id)

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