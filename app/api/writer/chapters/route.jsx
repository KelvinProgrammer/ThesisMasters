// app/api/writer/chapters/route.js - Writer Chapters Management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import User from '@/models/User'
import mongoose from 'mongoose'

// Helper function to check writer permissions
async function checkWriterPermissions(session) {
  if (!session || !session.user) {
    return { isAuthorized: false, error: 'Not authenticated' }
  }

  if (session.user.role !== 'writer') {
    return { isAuthorized: false, error: 'Writer access required' }
  }

  // Check if writer is verified
  await connectToDatabase()
  let userId = session.user.id || session.user._id
  
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email })
    if (user) userId = user._id
  }

  const user = await User.findById(userId)
  if (!user || !user.writerProfile?.isVerified) {
    return { isAuthorized: false, error: 'Writer verification required' }
  }

  return { isAuthorized: true, userId }
}

// GET - Fetch chapters assigned to writer
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    await connectToDatabase()

    // Build query for chapters assigned to this writer
    let query = { writerId: authCheck.userId }

    // Handle status filtering
    if (status && status !== 'all') {
      if (status === 'current') {
        query.status = { $in: ['in_progress', 'revision'] }
      } else if (status === 'available') {
        // Show chapters that are paid but not yet assigned to any writer
        query = { 
          status: 'draft', 
          isPaid: true, 
          $or: [
            { writerId: { $exists: false } },
            { writerId: null }
          ]
        }
      } else {
        query.status = status
      }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    // Get chapters with user information
    const chapters = await Chapter.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, university: 1, department: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: 'paymentId',
          foreignField: '_id',
          as: 'payment',
          pipeline: [
            { $project: { status: 1, amount: 1, currency: 1 } }
          ]
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
          payment: { $arrayElemAt: ['$payment', 0] },
          earnings: {
            $multiply: ['$estimatedCost', 0.7] // Writer gets 70% of chapter cost
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ])

    // Get total count
    const totalCountPipeline = [
      { $match: query },
      { $count: 'total' }
    ]
    const totalResult = await Chapter.aggregate(totalCountPipeline)
    const total = totalResult[0]?.total || 0

    // Get writer statistics
    const stats = await Chapter.aggregate([
      { $match: { writerId: authCheck.userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          revision: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
          totalEarnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
          paidChapters: { $sum: { $cond: ['$isPaid', 1, 0] } }
        }
      }
    ])

    const statistics = stats[0] || {
      total: 0,
      inProgress: 0,
      completed: 0,
      revision: 0,
      totalEarnings: 0,
      paidChapters: 0
    }

    return NextResponse.json({
      chapters,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics
    })

  } catch (error) {
    console.error('Writer get chapters error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// PUT - Accept chapter or update chapter status
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { chapterId, action, data = {} } = body

    if (!chapterId || !action) {
      return NextResponse.json({ 
        message: 'Chapter ID and action are required' 
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json({ 
        message: 'Invalid chapter ID' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    let updateData = {}
    let message = ''

    switch (action) {
      case 'accept':
        // Writer accepts an available chapter
        if (chapter.writerId) {
          return NextResponse.json({ 
            message: 'Chapter already assigned to another writer' 
          }, { status: 400 })
        }

        if (!chapter.isPaid) {
          return NextResponse.json({ 
            message: 'Chapter must be paid before acceptance' 
          }, { status: 400 })
        }

        updateData.writerId = authCheck.userId
        updateData.status = 'in_progress'
        updateData.assignedAt = new Date()
        message = 'Chapter accepted successfully'
        break

      case 'update_status':
        // Writer updates chapter status
        if (chapter.writerId?.toString() !== authCheck.userId.toString()) {
          return NextResponse.json({ 
            message: 'You can only update your own chapters' 
          }, { status: 403 })
        }

        const allowedStatuses = ['in_progress', 'completed', 'revision']
        if (!data.status || !allowedStatuses.includes(data.status)) {
          return NextResponse.json({ 
            message: 'Valid status is required' 
          }, { status: 400 })
        }

        updateData.status = data.status
        if (data.status === 'completed') {
          updateData.completedAt = new Date()
        }
        message = 'Chapter status updated successfully'
        break

      case 'add_content':
        // Writer adds/updates content
        if (chapter.writerId?.toString() !== authCheck.userId.toString()) {
          return NextResponse.json({ 
            message: 'You can only update your own chapters' 
          }, { status: 403 })
        }

        if (!data.content) {
          return NextResponse.json({ 
            message: 'Content is required' 
          }, { status: 400 })
        }

        // Save current version as revision if content exists
        if (chapter.content && chapter.content !== data.content) {
          chapter.revisions.push({
            version: chapter.revisions.length + 1,
            content: chapter.content,
            changes: data.changes || 'Content updated',
            createdAt: new Date()
          })
        }

        updateData.content = data.content
        updateData.wordCount = data.content.split(/\s+/).filter(word => word.length > 0).length
        updateData.notes = data.notes || chapter.notes
        
        // Auto-update status if draft
        if (chapter.status === 'draft') {
          updateData.status = 'in_progress'
        }

        message = 'Content updated successfully'
        break

      default:
        return NextResponse.json({ 
          message: 'Invalid action' 
        }, { status: 400 })
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'userId',
        select: 'name email university department'
      }
    ])

    // Update writer stats if chapter completed
    if (action === 'update_status' && data.status === 'completed') {
      await User.findByIdAndUpdate(
        authCheck.userId,
        { 
          $inc: { 
            'writerProfile.completedProjects': 1 
          }
        }
      )
    }

    return NextResponse.json({
      message,
      chapter: updatedChapter
    })

  } catch (error) {
    console.error('Writer update chapter error:', error)
    
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