// app/api/admin/payments/route.js - Admin Payments Management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import Payment from '@/models/Payment'
import User from '@/models/User'
import Chapter from '@/models/Chapter'
import mongoose from 'mongoose'

// Helper function to check admin permissions
async function checkAdminPermissions(session, requiredPermission = null) {
  if (!session || !session.user) {
    return { isAuthorized: false, error: 'Not authenticated' }
  }

  if (session.user.role !== 'admin') {
    return { isAuthorized: false, error: 'Admin access required' }
  }

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
    const authCheck = await checkAdminPermissions(session, 'payment_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const paymentMethod = searchParams.get('paymentMethod')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    await connectToDatabase()

    // Build query
    let query = {}

    if (status && status !== 'all') {
      if (status === 'overdue') {
        query = {
          status: 'pending',
          dueDate: { $lt: new Date() }
        }
      } else {
        query.status = status
      }
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z')
      }
    }

    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    // Get payments with user and chapter information
    const payments = await Payment.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
          pipeline: [
            { $project: { name: 1, email: 1, university: 1 } }
          ]
        }
      },
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapterId',
          foreignField: '_id',
          as: 'chapter',
          pipeline: [
            { 
              $project: { 
                title: 1, 
                chapterNumber: 1, 
                level: 1, 
                workType: 1,
                urgency: 1,
                writerId: 1
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
              $addFields: {
                writer: { $arrayElemAt: ['$writer', 0] }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
          chapter: { $arrayElemAt: ['$chapter', 0] },
          isOverdue: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              then: true,
              else: false
            }
          },
          daysOverdue: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$status', 'pending'] },
                  { $lt: ['$dueDate', new Date()] }
                ]
              },
              then: {
                $dateDiff: {
                  startDate: '$dueDate',
                  endDate: new Date(),
                  unit: 'day'
                }
              },
              else: 0
            }
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
    const totalResult = await Payment.aggregate(totalCountPipeline)
    const total = totalResult[0]?.total || 0

    // Get payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
          disputed: { $sum: { $cond: [{ $eq: ['$status', 'disputed'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'pending'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalRevenue: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } 
          },
          pendingAmount: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } 
          },
          refundedAmount: { 
            $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] } 
          },
          averageAmount: { $avg: '$amount' }
        }
      }
    ])

    // Get payment method breakdown
    const paymentMethodStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedAmount: { 
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } 
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ])

    // Get monthly revenue trend (last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const statistics = stats[0] || {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      refunded: 0,
      disputed: 0,
      overdue: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      refundedAmount: 0,
      averageAmount: 0
    }

    // Calculate additional metrics
    const completionRate = statistics.total > 0 
      ? Math.round((statistics.completed / statistics.total) * 100) 
      : 0

    const failureRate = statistics.total > 0 
      ? Math.round((statistics.failed / statistics.total) * 100) 
      : 0

    return NextResponse.json({
      payments,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics: {
        ...statistics,
        completionRate,
        failureRate
      },
      paymentMethodStats,
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue,
        count: item.count,
        avgAmount: Math.round(item.avgAmount)
      }))
    })

  } catch (error) {
    console.error('Admin get payments error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// UPDATE payment (mark as paid, refund, dispute, etc.)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'payment_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, action, data = {} } = body

    if (!paymentId || !action) {
      return NextResponse.json({ 
        message: 'Payment ID and action are required' 
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json({ 
        message: 'Invalid payment ID' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const payment = await Payment.findById(paymentId)
    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }

    let updateData = {}
    let message = ''

    switch (action) {
      case 'mark_paid':
        if (payment.status === 'completed') {
          return NextResponse.json({ 
            message: 'Payment is already completed' 
          }, { status: 400 })
        }

        updateData.status = 'completed'
        updateData.completedAt = new Date()
        updateData.transactionId = data.transactionId || 
          `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Update associated chapter as paid
        if (payment.chapterId) {
          await Chapter.findByIdAndUpdate(payment.chapterId, {
            isPaid: true,
            paymentId: payment._id
          })
        }

        message = 'Payment marked as completed successfully'
        break

      case 'refund':
        if (!['completed', 'pending'].includes(payment.status)) {
          return NextResponse.json({ 
            message: 'Can only refund completed or pending payments' 
          }, { status: 400 })
        }

        if (!data.reason) {
          return NextResponse.json({ 
            message: 'Refund reason is required' 
          }, { status: 400 })
        }

        const refundAmount = data.refundAmount || payment.amount

        updateData.status = 'refunded'
        updateData.refundedAt = new Date()
        updateData.refundAmount = refundAmount
        updateData.refundReason = data.reason
        updateData.refundedBy = session.user.id

        // Update associated chapter
        if (payment.chapterId) {
          await Chapter.findByIdAndUpdate(payment.chapterId, {
            isPaid: false,
            $unset: { paymentId: 1 }
          })
        }

        message = 'Payment refunded successfully'
        break

      case 'dispute':
        if (!data.reason) {
          return NextResponse.json({ 
            message: 'Dispute reason is required' 
          }, { status: 400 })
        }

        updateData.status = 'disputed'
        updateData.disputedAt = new Date()
        updateData.disputeReason = data.reason
        updateData.disputedBy = session.user.id

        message = 'Payment marked as disputed'
        break

      case 'resolve_dispute':
        if (payment.status !== 'disputed') {
          return NextResponse.json({ 
            message: 'Payment is not in dispute' 
          }, { status: 400 })
        }

        if (!data.resolution || !['completed', 'refunded', 'failed'].includes(data.resolution)) {
          return NextResponse.json({ 
            message: 'Valid resolution status required (completed, refunded, failed)' 
          }, { status: 400 })
        }

        updateData.status = data.resolution
        updateData.disputeResolvedAt = new Date()
        updateData.disputeResolution = data.resolutionNote || ''
        updateData.disputeResolvedBy = session.user.id

        // Handle chapter updates based on resolution
        if (payment.chapterId) {
          if (data.resolution === 'completed') {
            await Chapter.findByIdAndUpdate(payment.chapterId, {
              isPaid: true,
              paymentId: payment._id
            })
          } else {
            await Chapter.findByIdAndUpdate(payment.chapterId, {
              isPaid: false,
              $unset: { paymentId: 1 }
            })
          }
        }

        message = `Dispute resolved as ${data.resolution}`
        break

      case 'update_amount':
        if (payment.status === 'completed') {
          return NextResponse.json({ 
            message: 'Cannot update amount for completed payments' 
          }, { status: 400 })
        }

        if (!data.newAmount || typeof data.newAmount !== 'number' || data.newAmount <= 0) {
          return NextResponse.json({ 
            message: 'Valid amount is required' 
          }, { status: 400 })
        }

        updateData.amount = data.newAmount
        updateData.originalAmount = payment.amount
        updateData.amountUpdatedBy = session.user.id
        updateData.amountUpdatedAt = new Date()
        updateData.amountUpdateReason = data.reason || 'Amount adjusted by admin'

        message = 'Payment amount updated successfully'
        break

      case 'extend_due_date':
        if (payment.status !== 'pending') {
          return NextResponse.json({ 
            message: 'Can only extend due date for pending payments' 
          }, { status: 400 })
        }

        if (!data.newDueDate) {
          return NextResponse.json({ 
            message: 'New due date is required' 
          }, { status: 400 })
        }

        const newDueDate = new Date(data.newDueDate)
        if (newDueDate <= new Date()) {
          return NextResponse.json({ 
            message: 'Due date must be in the future' 
          }, { status: 400 })
        }

        updateData.dueDate = newDueDate
        updateData.originalDueDate = payment.dueDate
        updateData.dueDateExtendedBy = session.user.id
        updateData.dueDateExtensionReason = data.reason || 'Due date extended by admin'

        message = 'Due date extended successfully'
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

    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: 'userId',
        select: 'name email university'
      },
      {
        path: 'chapterId',
        select: 'title chapterNumber level workType urgency writerId',
        populate: {
          path: 'writerId',
          select: 'name email'
        }
      }
    ])

    return NextResponse.json({
      message,
      payment: updatedPayment
    })

  } catch (error) {
    console.error('Admin update payment error:', error)
    
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

// CREATE payment (admin can create manual payments)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'payment_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { 
      userId, 
      chapterId, 
      amount, 
      currency = 'KES', 
      description, 
      paymentMethod = 'manual',
      dueDate,
      status = 'pending'
    } = body

    if (!userId || !amount || !description) {
      return NextResponse.json({ 
        message: 'User ID, amount, and description are required' 
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        message: 'Invalid user ID' 
      }, { status: 400 })
    }

    if (chapterId && !mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json({ 
        message: 'Invalid chapter ID' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Verify user exists
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Verify chapter exists if provided
    if (chapterId) {
      const chapter = await Chapter.findById(chapterId)
      if (!chapter) {
        return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
      }
    }

    const payment = new Payment({
      userId,
      chapterId,
      amount,
      currency,
      description,
      paymentMethod,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status,
      type: 'admin_created',
      createdBy: session.user.id,
      metadata: {
        createdByAdmin: true,
        adminId: session.user.id
      }
    })

    await payment.save()

    const populatedPayment = await Payment.findById(payment._id).populate([
      {
        path: 'userId',
        select: 'name email'
      },
      {
        path: 'chapterId',
        select: 'title chapterNumber'
      }
    ])

    return NextResponse.json({
      message: 'Payment created successfully',
      payment: populatedPayment
    }, { status: 201 })

  } catch (error) {
    console.error('Admin create payment error:', error)
    
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