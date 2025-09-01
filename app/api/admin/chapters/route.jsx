// app/api/admin/chapters/route.js - Enhanced Admin API with bid management
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import User from '@/models/User'
import Payment from '@/models/Payment'
import mongoose from 'mongoose'

// Helper function to check admin permissions
async function checkAdminPermissions(session, requiredPermission = null) {
  if (!session || !session.user) {
    return { isAuthorized: false, error: 'Not authenticated' }
  }

  if (session.user.role !== 'admin') {
    return { isAuthorized: false, error: 'Admin access required' }
  }

  // Check specific permissions if required
  if (requiredPermission && session.user.adminProfile?.permissions) {
    if (!session.user.adminProfile.permissions.includes(requiredPermission)) {
      return { isAuthorized: false, error: `${requiredPermission} permission required` }
    }
  }

  return { isAuthorized: true }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'content_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const isPaid = searchParams.get('isPaid')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    await connectToDatabase()

    // Build query
    let query = {}

    if (status && status !== 'all') {
      if (status === 'overdue') {
        query = {
          deadline: { $lt: new Date() },
          status: { $in: ['draft', 'in_progress', 'revision'] }
        }
      } else if (status === 'pending') {
        // Show chapters with pending bids
        query = {
          bids: {
            $elemMatch: {
              status: 'pending'
            }
          }
        }
      } else {
        query.status = status
      }
    }

    if (isPaid && isPaid !== 'all') {
      query.isPaid = isPaid === 'paid'
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    // Enhanced aggregation with bid information
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
            { 
              $project: { 
                name: 1, 
                email: 1, 
                writerProfile: 1 
              } 
            }
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
            { $project: { status: 1, amount: 1, currency: 1, createdAt: 1 } }
          ]
        }
      },
      // Enhanced lookup for bids with writer information
      {
        $lookup: {
          from: 'users',
          localField: 'bids.writerId',
          foreignField: '_id',
          as: 'bidWriters',
          pipeline: [
            { $project: { name: 1, email: 1, writerProfile: 1 } }
          ]
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
          writer: { $arrayElemAt: ['$writer', 0] },
          payment: { $arrayElemAt: ['$payment', 0] },
          
          // Enhanced bids with writer information
          bids: {
            $map: {
              input: { $ifNull: ['$bids', []] },
              as: 'bid',
              in: {
                $mergeObjects: [
                  '$$bid',
                  {
                    writer: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$bidWriters',
                            cond: { $eq: ['$$this._id', '$$bid.writerId'] }
                          }
                        },
                        0
                      ]
                    }
                  }
                ]
              }
            }
          },
          
          isOverdue: {
            $cond: {
              if: {
                $and: [
                  { $in: ['$status', ['draft', 'in_progress', 'revision']] },
                  { $lt: ['$deadline', new Date()] }
                ]
              },
              then: true,
              else: false
            }
          },
          
          // Count pending bids
          pendingBidsCount: {
            $size: {
              $filter: {
                input: { $ifNull: ['$bids', []] },
                cond: { $eq: ['$$this.status', 'pending'] }
              }
            }
          },
          
          // Count total bids
          totalBidsCount: {
            $size: { $ifNull: ['$bids', []] }
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ])

    // Get total count for pagination
    const totalCountPipeline = [
      { $match: query },
      { $count: 'total' }
    ]
    const totalResult = await Chapter.aggregate(totalCountPipeline)
    const total = totalResult[0]?.total || 0

    // Enhanced statistics with bid information
    const stats = await Chapter.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          revision: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          paid: { $sum: { $cond: ['$isPaid', 1, 0] } },
          unpaid: { $sum: { $cond: ['$isPaid', 0, 1] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $in: ['$status', ['draft', 'in_progress', 'revision']] },
                    { $lt: ['$deadline', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalRevenue: { $sum: '$estimatedCost' },
          averageWordCount: { $avg: '$wordCount' },
          averageEstimatedCost: { $avg: '$estimatedCost' },
          
          // Bid statistics
          chaptersWithBids: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$bids', []] } }, 0] },
                1,
                0
              ]
            }
          },
          totalBids: { $sum: { $size: { $ifNull: ['$bids', []] } } },
          pendingBids: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ['$bids', []] },
                  cond: { $eq: ['$$this.status', 'pending'] }
                }
              }
            }
          },
          acceptedBids: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ['$bids', []] },
                  cond: { $eq: ['$$this.status', 'accepted'] }
                }
              }
            }
          },
          rejectedBids: {
            $sum: {
              $size: {
                $filter: {
                  input: { $ifNull: ['$bids', []] },
                  cond: { $eq: ['$$this.status', 'rejected'] }
                }
              }
            }
          }
        }
      }
    ])

    const statistics = stats[0] || {
      total: 0,
      draft: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      revision: 0,
      approved: 0,
      paid: 0,
      unpaid: 0,
      overdue: 0,
      totalRevenue: 0,
      averageWordCount: 0,
      averageEstimatedCost: 0,
      chaptersWithBids: 0,
      totalBids: 0,
      pendingBids: 0,
      acceptedBids: 0,
      rejectedBids: 0
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
    console.error('Admin get chapters error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// Enhanced UPDATE chapter with bid management
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'content_management')
    
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
      case 'manage_bid':
        // NEW: Admin manages writer bids (accept/reject)
        const { bidId, bidAction } = data
        
        if (!bidId || !bidAction) {
          return NextResponse.json({ 
            message: 'Bid ID and bid action are required' 
          }, { status: 400 })
        }

        if (!['accept', 'reject'].includes(bidAction)) {
          return NextResponse.json({ 
            message: 'Invalid bid action. Must be accept or reject' 
          }, { status: 400 })
        }

        const bidIndex = chapter.bids.findIndex(bid => bid._id.toString() === bidId)
        if (bidIndex === -1) {
          return NextResponse.json({ 
            message: 'Bid not found' 
          }, { status: 404 })
        }

        const bid = chapter.bids[bidIndex]
        if (bid.status !== 'pending') {
          return NextResponse.json({ 
            message: 'Bid is not pending' 
          }, { status: 400 })
        }

        if (bidAction === 'accept') {
          // Accept the bid and assign writer
          updateData = {
            writerId: bid.writerId,
            status: 'in_progress',
            assignedAt: new Date(),
            acceptedBidAmount: bid.bidAmount,
            expectedCompletionDays: bid.estimatedDays
          }

          // Update the accepted bid status
          chapter.bids[bidIndex].status = 'accepted'
          chapter.bids[bidIndex].acceptedAt = new Date()
          chapter.bids[bidIndex].acceptedBy = session.user.id

          // Reject all other pending bids for this chapter
          chapter.bids.forEach((otherBid, index) => {
            if (index !== bidIndex && otherBid.status === 'pending') {
              otherBid.status = 'rejected'
              otherBid.rejectedAt = new Date()
              otherBid.rejectedBy = session.user.id
              otherBid.rejectionReason = 'Another bid was accepted'
            }
          })

          updateData.bids = chapter.bids
          message = 'Bid accepted and writer assigned successfully'

          // Update writer stats
          await User.findByIdAndUpdate(
            bid.writerId,
            { 
              $inc: { 
                'writerProfile.assignedProjects': 1 
              }
            }
          )

        } else if (bidAction === 'reject') {
          // Reject the bid
          chapter.bids[bidIndex].status = 'rejected'
          chapter.bids[bidIndex].rejectedAt = new Date()
          chapter.bids[bidIndex].rejectedBy = session.user.id
          chapter.bids[bidIndex].rejectionReason = data.reason || 'Bid rejected by admin'

          updateData.bids = chapter.bids
          message = 'Bid rejected successfully'
        }
        break

      case 'assign_writer':
        // Direct assignment (existing functionality)
        if (!data.writerId || !mongoose.Types.ObjectId.isValid(data.writerId)) {
          return NextResponse.json({ 
            message: 'Valid writer ID is required' 
          }, { status: 400 })
        }

        const writer = await User.findOne({ 
          _id: data.writerId, 
          role: 'writer',
          'writerProfile.isVerified': true 
        })
        
        if (!writer) {
          return NextResponse.json({ 
            message: 'Writer not found or not verified' 
          }, { status: 400 })
        }

        updateData.writerId = data.writerId
        updateData.assignedAt = new Date()
        if (chapter.status === 'draft') {
          updateData.status = 'in_progress'
        }

        // Reject all pending bids since admin assigned directly
        if (chapter.bids && chapter.bids.length > 0) {
          chapter.bids.forEach(bid => {
            if (bid.status === 'pending') {
              bid.status = 'rejected'
              bid.rejectedAt = new Date()
              bid.rejectedBy = session.user.id
              bid.rejectionReason = 'Admin assigned writer directly'
            }
          })
          updateData.bids = chapter.bids
        }

        message = 'Writer assigned successfully'
        break

      case 'change_status':
        const allowedStatuses = ['draft', 'pending', 'in_progress', 'completed', 'revision', 'approved']
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

      case 'extend_deadline':
        if (!data.deadline) {
          return NextResponse.json({ 
            message: 'New deadline is required' 
          }, { status: 400 })
        }

        const newDeadline = new Date(data.deadline)
        if (newDeadline <= new Date()) {
          return NextResponse.json({ 
            message: 'Deadline must be in the future' 
          }, { status: 400 })
        }

        updateData.deadline = newDeadline
        message = 'Deadline extended successfully'
        break

      case 'update_cost':
        if (typeof data.estimatedCost !== 'number' || data.estimatedCost < 0) {
          return NextResponse.json({ 
            message: 'Valid cost is required' 
          }, { status: 400 })
        }

        updateData.estimatedCost = data.estimatedCost
        message = 'Cost updated successfully'
        break

      default:
        return NextResponse.json({ 
          message: 'Invalid action' 
        }, { status: 400 })
    }

    // Add admin log entry
    updateData.$push = {
      adminLogs: {
        adminId: session.user.id,
        action,
        changes: data,
        timestamp: new Date()
      }
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      chapterId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'userId',
        select: 'name email university department'
      },
      {
        path: 'writerId',
        select: 'name email writerProfile'
      },
      {
        path: 'paymentId',
        select: 'status amount currency'
      },
      {
        path: 'bids.writerId',
        select: 'name email writerProfile'
      }
    ])

    return NextResponse.json({
      message,
      chapter: updatedChapter
    })

  } catch (error) {
    console.error('Admin update chapter error:', error)
    
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

// Enhanced DELETE chapter (admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'content_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get('id')

    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json({ 
        message: 'Valid chapter ID is required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }

    // Check if chapter can be deleted (not paid or completed)
    if (chapter.isPaid || chapter.status === 'completed') {
      return NextResponse.json({ 
        message: 'Cannot delete paid or completed chapters' 
      }, { status: 400 })
    }

    // Check if there are pending bids
    const hasPendingBids = chapter.bids?.some(bid => bid.status === 'pending')
    if (hasPendingBids) {
      return NextResponse.json({ 
        message: 'Cannot delete chapter with pending bids. Please reject all bids first.' 
      }, { status: 400 })
    }

    await Chapter.findByIdAndDelete(chapterId)

    return NextResponse.json({ 
      message: 'Chapter deleted successfully' 
    })

  } catch (error) {
    console.error('Admin delete chapter error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}