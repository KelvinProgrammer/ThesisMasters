// app/api/writer/chapters/route.js - FULLY CORRECTED VERSION
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

  await connectToDatabase()
  let userId = session.user.id || session.user._id
  
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email })
    if (user) userId = user._id
  }

  const user = await User.findById(userId)
  if (!user) {
    return { isAuthorized: false, error: 'User not found' }
  }

  return { isAuthorized: true, userId, isVerified: user.writerProfile?.isVerified || false }
}

// TESTING VERSION - Shows unassigned chapters regardless of payment status
// TODO: For production, uncomment payment checks and require isPaid: true

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

    console.log('Writer API - Status param:', status)
    console.log('Writer API - WriterId:', authCheck.userId)

    await connectToDatabase()

    // DEBUG: First check what chapters exist
    const allChapters = await Chapter.find().select('_id title status writerId userId isPaid').lean()
    console.log('=== ALL CHAPTERS DEBUG ===')
    console.log('Total chapters in database:', allChapters.length)
    allChapters.forEach(ch => {
      console.log(`ID: ${ch._id} | Title: ${ch.title} | Status: ${ch.status} | WriterId: ${ch.writerId || 'null'} | UserId: ${ch.userId} | IsPaid: ${ch.isPaid}`)
    })

    let query = {}

    // Handle different status scenarios with CORRECTED logic
    if (status === 'available') {
      // FOR AVAILABLE CHAPTERS PAGE - Show chapters available for bidding (relaxed for testing)
      query = { 
        $or: [
          { writerId: { $exists: false } },
          { writerId: null }
        ]
      }
      console.log('AVAILABLE query (all unassigned chapters):', JSON.stringify(query, null, 2))
    }
    else if (status === 'current') {
      // FOR CURRENT CHAPTERS PAGE - Show writer's assigned chapters AND unassigned chapters
      query = {
        $or: [
          { writerId: authCheck.userId }, // Writer's assigned chapters
          { 
            // Unassigned chapters that need writers (for testing - remove isPaid requirement)
            $or: [{ writerId: { $exists: false } }, { writerId: null }]
          }
        ]
      }
      console.log('CURRENT query (writer assigned + unassigned):', JSON.stringify(query, null, 2))
    } 
    else if (status && status.includes(',')) {
      // FIXED: Handle comma-separated status values (like 'in_progress,revision')
      const statusArray = status.split(',').map(s => s.trim())
      query = { 
        writerId: authCheck.userId,
        status: { $in: statusArray }
      }
      console.log('COMMA-SEPARATED STATUS query (writer-specific):', JSON.stringify(query, null, 2))
    }
    else if (status === 'accepted' || status === 'my-chapters') {
      // Show all chapters assigned to this writer
      query = { writerId: authCheck.userId }
      console.log('ACCEPTED/MY-CHAPTERS query (writer-specific):', JSON.stringify(query, null, 2))
    }
    else if (status === 'in-progress') {
      // Writer's active chapters
      query = { 
        writerId: authCheck.userId,
        status: { $in: ['in_progress', 'revision'] }
      }
      console.log('IN-PROGRESS query:', JSON.stringify(query, null, 2))
    }
    else if (status === 'completed') {
      // Writer's completed chapters
      query = { 
        writerId: authCheck.userId,
        status: 'completed'
      }
      console.log('COMPLETED query:', JSON.stringify(query, null, 2))
    }
    else if (status && status !== 'all') {
      // Single specific status
      if (['draft', 'pending', 'in_progress', 'revision', 'completed'].includes(status)) {
        // Show unassigned chapters with this status (relaxed for testing)
        query = { 
          status: status,
          $or: [
            { writerId: { $exists: false } },
            { writerId: null }
          ]
        }
        console.log('AVAILABLE SPECIFIC STATUS query:', JSON.stringify(query, null, 2))
      } else {
        // Show writer's chapters with this status
        query = { 
          writerId: authCheck.userId,
          status: status 
        }
        console.log('WRITER SPECIFIC STATUS query:', JSON.stringify(query, null, 2))
      }
    }
    else {
      // DEFAULT: Show unassigned chapters (relaxed for testing)
      query = { 
        $or: [
          { writerId: { $exists: false } },
          { writerId: null }
        ]
      }
      console.log('DEFAULT query (all unassigned chapters):', JSON.stringify(query, null, 2))
    }

    const skip = (page - 1) * limit

    // Get chapters with user and payment information
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
          from: 'users',
          localField: 'writerId',
          foreignField: '_id',
          as: 'writer',
          pipeline: [
            { $project: { name: 1, email: 1 } }
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
          writer: { $arrayElemAt: ['$writer', 0] },
          payment: { $arrayElemAt: ['$payment', 0] },
          estimatedEarnings: {
            $multiply: ['$estimatedCost', 0.7] // Writer gets 70% of chapter cost
          },
          earnings: {
            $multiply: ['$estimatedCost', 0.7] // Alias for compatibility
          },
          isAssignedToMe: {
            $eq: ['$writerId', authCheck.userId]
          },
          isAvailableForBidding: {
            $or: [
              { $not: { $ifNull: ['$writerId', false] } },
              { $eq: ['$writerId', null] }
            ]
          },
          canBid: {
            $or: [
              { $not: { $ifNull: ['$writerId', false] } },
              { $eq: ['$writerId', null] }
            ]
          }
        }
      },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit }
    ])

    console.log('Writer API - Found chapters:', chapters.length)
    if (chapters.length > 0) {
      chapters.forEach(ch => {
        console.log(`Result: ${ch.title} | Status: ${ch.status} | WriterId: ${ch.writerId || 'null'} | IsAssignedToMe: ${ch.isAssignedToMe}`)
      })
    }

    // Get total count for pagination
    const totalCountPipeline = [
      { $match: query },
      { $count: 'total' }
    ]
    const totalResult = await Chapter.aggregate(totalCountPipeline)
    const total = totalResult[0]?.total || 0

    // Get comprehensive statistics
    const stats = await Chapter.aggregate([
      {
        $facet: {
          // Available chapters for bidding (relaxed for testing)
          availableForBidding: [
            {
              $match: { 
                $or: [
                  { writerId: { $exists: false } },
                  { writerId: null }
                ]
              }
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalValue: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
                avgValue: { $avg: { $multiply: ['$estimatedCost', 0.7] } }
              }
            }
          ],
          // Writer's assigned chapters
          myChapters: [
            { $match: { writerId: authCheck.userId } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                revision: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                totalEarnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
                completedEarnings: { 
                  $sum: { 
                    $cond: [
                      { $eq: ['$status', 'completed'] },
                      { $multiply: ['$estimatedCost', 0.7] },
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ])

    const availableStats = stats[0]?.availableForBidding[0] || {
      total: 0,
      totalValue: 0,
      avgValue: 0
    }

    const myStats = stats[0]?.myChapters[0] || {
      total: 0,
      inProgress: 0,
      completed: 0,
      revision: 0,
      draft: 0,
      totalEarnings: 0,
      completedEarnings: 0
    }

    const statistics = {
      // Available chapters statistics
      availableChapters: availableStats.total,
      available: availableStats.total, // Alias
      availableValue: availableStats.totalValue,
      avgChapterValue: availableStats.avgValue || 0,
      
      // Writer's personal statistics  
      total: myStats.total,
      myTotal: myStats.total,
      inProgress: myStats.inProgress,
      myInProgress: myStats.inProgress,
      completed: myStats.completed,
      myCompleted: myStats.completed,
      revision: myStats.revision,
      myRevision: myStats.revision,
      totalEarnings: myStats.totalEarnings,
      myTotalEarnings: myStats.totalEarnings,
      completedEarnings: myStats.completedEarnings,
      myCompletedEarnings: myStats.completedEarnings
    }

    console.log('=== STATISTICS ===')
    console.log('Available chapters:', availableStats.total)
    console.log('My chapters:', myStats.total)
    console.log('Statistics object:', statistics)

    return NextResponse.json({
      chapters,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics,
      writerInfo: {
        writerId: authCheck.userId,
        isVerified: authCheck.isVerified,
        canBid: authCheck.isVerified // Only verified writers can bid
      },
      debug: {
        query,
        totalChaptersInDb: allChapters.length,
        statusParam: status,
        availableCount: availableStats.total,
        myChaptersCount: myStats.total
      }
    })

  } catch (error) {
    console.error('Writer get chapters error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// PUT method remains the same
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
      case 'bid':
      case 'accept':
        // Writer bids on/accepts an available chapter
        if (!authCheck.isVerified) {
          return NextResponse.json({ 
            message: 'Writer verification required to bid on chapters' 
          }, { status: 403 })
        }

        if (chapter.writerId) {
          return NextResponse.json({ 
            message: 'Chapter already assigned to another writer' 
          }, { status: 400 })
        }

        // TESTING: Relaxed payment requirement
        // TODO: For production, uncomment the payment check below
        // if (!chapter.isPaid) {
        //   return NextResponse.json({ 
        //     message: 'Chapter must be paid before acceptance' 
        //   }, { status: 400 })
        // }

        updateData.writerId = authCheck.userId
        updateData.status = 'in_progress'
        updateData.assignedAt = new Date()
        
        // Add bid information if provided
        if (data.bidAmount) {
          updateData.bidAmount = data.bidAmount
        }
        if (data.bidMessage) {
          updateData.bidMessage = data.bidMessage
        }

        message = 'Chapter accepted successfully'
        break

      case 'update_status':
        // Writer updates chapter status (only for assigned chapters)
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
        // Writer adds/updates content (only for assigned chapters)
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