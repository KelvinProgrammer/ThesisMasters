// app/api/admin/stats/route.js - Admin Dashboard Statistics API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Chapter from '@/models/Chapter'
import Payment from '@/models/Payment'
import mongoose from 'mongoose'

// Helper function to check admin permissions
async function checkAdminPermissions(session) {
  if (!session || !session.user) {
    return { isAuthorized: false, error: 'Not authenticated' }
  }

  if (session.user.role !== 'admin') {
    return { isAuthorized: false, error: 'Admin access required' }
  }

  return { isAuthorized: true }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30' // days
    const includeDetails = searchParams.get('details') === 'true'

    await connectToDatabase()

    const timeframeDays = parseInt(timeframe)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframeDays)

    // Get overall statistics
    const [userStats, chapterStats, paymentStats] = await Promise.all([
      // User Statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            totalStudents: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
            totalWriters: { $sum: { $cond: [{ $eq: ['$role', 'writer'] }, 1, 0] } },
            totalAdmins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            verifiedUsers: { $sum: { $cond: ['$emailVerified', 1, 0] } },
            bannedUsers: { $sum: { $cond: ['$isBanned', 1, 0] } },
            verifiedWriters: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$role', 'writer'] },
                      { $eq: ['$writerProfile.isVerified', true] }
                    ]
                  }, 
                  1, 
                  0
                ] 
              } 
            },
            pendingWriters: { 
              $sum: { 
                $cond: [
                  { 
                    $and: [
                      { $eq: ['$role', 'writer'] },
                      { $eq: ['$writerProfile.isVerified', false] }
                    ]
                  }, 
                  1, 
                  0
                ] 
              } 
            },
            newUsersThisPeriod: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  1,
                  0
                ]
              }
            },
            activeUsersThisPeriod: {
              $sum: {
                $cond: [
                  { $gte: ['$lastLogin', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Chapter Statistics
      Chapter.aggregate([
        {
          $group: {
            _id: null,
            totalChapters: { $sum: 1 },
            draftChapters: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
            inProgressChapters: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            completedChapters: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            revisionChapters: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
            approvedChapters: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
            paidChapters: { $sum: { $cond: ['$isPaid', 1, 0] } },
            unpaidChapters: { $sum: { $cond: ['$isPaid', 0, 1] } },
            overdueChapters: {
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
            urgentChapters: { 
              $sum: { $cond: [{ $in: ['$urgency', ['urgent', 'very_urgent']] }, 1, 0] } 
            },
            totalWords: { $sum: '$wordCount' },
            totalTargetWords: { $sum: '$targetWordCount' },
            totalEstimatedCost: { $sum: '$estimatedCost' },
            averageWordCount: { $avg: '$wordCount' },
            averageEstimatedCost: { $avg: '$estimatedCost' },
            chaptersThisPeriod: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  1,
                  0
                ]
              }
            },
            completedThisPeriod: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $gte: ['$completedAt', startDate] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Payment Statistics
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            completedPayments: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pendingPayments: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            failedPayments: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            refundedPayments: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } },
            disputedPayments: { $sum: { $cond: [{ $eq: ['$status', 'disputed'] }, 1, 0] } },
            totalRevenue: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } 
            },
            pendingRevenue: { 
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } 
            },
            refundedAmount: { 
              $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] } 
            },
            averagePayment: { $avg: '$amount' },
            revenueThisPeriod: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'completed'] },
                      { $gte: ['$createdAt', startDate] }
                    ]
                  },
                  '$amount',
                  0
                ]
              }
            },
            paymentsThisPeriod: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', startDate] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ])

    // Get recent activity if details are requested
    let recentActivity = []
    if (includeDetails) {
      recentActivity = await Promise.all([
        // Recent user registrations
        User.find({ createdAt: { $gte: startDate } })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('name email role createdAt')
          .lean(),
        
        // Recent chapter completions
        Chapter.find({ 
          status: 'completed', 
          completedAt: { $gte: startDate } 
        })
          .sort({ completedAt: -1 })
          .limit(10)
          .populate('userId', 'name email')
          .select('title chapterNumber completedAt userId')
          .lean(),
        
        // Recent payments
        Payment.find({ createdAt: { $gte: startDate } })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('userId', 'name email')
          .select('amount status createdAt userId transactionId')
          .lean()
      ])
    }

    // Get trends (daily data for the timeframe)
    const trendData = await Promise.all([
      // Daily user registrations
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              role: '$role'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.date',
            students: { $sum: { $cond: [{ $eq: ['$_id.role', 'student'] }, '$count', 0] } },
            writers: { $sum: { $cond: [{ $eq: ['$_id.role', 'writer'] }, '$count', 0] } },
            total: { $sum: '$count' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Daily chapter progress
      Chapter.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            created: { $sum: 1 },
            completed: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Daily revenue
      Payment.aggregate([
        {
          $match: { 
            status: 'completed',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ])

    // Format the response
    const statistics = {
      users: userStats[0] || {},
      chapters: chapterStats[0] || {},
      payments: paymentStats[0] || {},
      timeframe: timeframeDays,
      period: {
        start: startDate,
        end: new Date()
      }
    }

    // Calculate growth rates
    if (statistics.users.totalUsers > 0) {
      statistics.users.userGrowthRate = statistics.users.newUsersThisPeriod > 0 
        ? Math.round((statistics.users.newUsersThisPeriod / (statistics.users.totalUsers - statistics.users.newUsersThisPeriod)) * 100)
        : 0
    }

    if (statistics.payments.totalRevenue > 0) {
      statistics.payments.revenueGrowthRate = statistics.payments.revenueThisPeriod > 0 
        ? Math.round((statistics.payments.revenueThisPeriod / (statistics.payments.totalRevenue - statistics.payments.revenueThisPeriod)) * 100)
        : 0
    }

    // Calculate completion rate
    statistics.chapters.completionRate = statistics.chapters.totalChapters > 0
      ? Math.round((statistics.chapters.completedChapters / statistics.chapters.totalChapters) * 100)
      : 0

    // Calculate payment success rate
    statistics.payments.successRate = statistics.payments.totalPayments > 0
      ? Math.round((statistics.payments.completedPayments / statistics.payments.totalPayments) * 100)
      : 0

    const response = {
      statistics,
      trends: {
        userRegistrations: trendData[0] || [],
        chapterProgress: trendData[1] || [],
        dailyRevenue: trendData[2] || []
      }
    }

    if (includeDetails) {
      response.recentActivity = {
        newUsers: recentActivity[0],
        completedChapters: recentActivity[1],
        recentPayments: recentActivity[2]
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Admin get statistics error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// GET specific metric details
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { metric, timeframe = '30', filters = {} } = body

    if (!metric) {
      return NextResponse.json({ 
        message: 'Metric type is required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const timeframeDays = parseInt(timeframe)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframeDays)

    let result = {}

    switch (metric) {
      case 'top_users':
        result = await User.aggregate([
          {
            $lookup: {
              from: 'chapters',
              localField: '_id',
              foreignField: 'userId',
              as: 'chapters'
            }
          },
          {
            $lookup: {
              from: 'payments',
              localField: '_id',
              foreignField: 'userId',
              as: 'payments',
              pipeline: [
                { $match: { status: 'completed' } }
              ]
            }
          },
          {
            $addFields: {
              totalChapters: { $size: '$chapters' },
              totalSpent: { $sum: '$payments.amount' },
              completedChapters: {
                $size: {
                  $filter: {
                    input: '$chapters',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              }
            }
          },
          {
            $match: {
              $or: [
                { totalChapters: { $gt: 0 } },
                { totalSpent: { $gt: 0 } }
              ]
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              role: 1,
              totalChapters: 1,
              completedChapters: 1,
              totalSpent: 1,
              createdAt: 1
            }
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 20 }
        ])
        break

      case 'top_writers':
        result = await User.aggregate([
          {
            $match: { 
              role: 'writer',
              'writerProfile.isVerified': true
            }
          },
          {
            $lookup: {
              from: 'chapters',
              localField: '_id',
              foreignField: 'writerId',
              as: 'writtenChapters'
            }
          },
          {
            $addFields: {
              totalProjects: { $size: '$writtenChapters' },
              completedProjects: {
                $size: {
                  $filter: {
                    input: '$writtenChapters',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                }
              },
              averageRating: '$writerProfile.rating'
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              writerProfile: 1,
              totalProjects: 1,
              completedProjects: 1,
              averageRating: 1
            }
          },
          { $sort: { completedProjects: -1 } },
          { $limit: 20 }
        ])
        break

      case 'revenue_breakdown':
        result = await Payment.aggregate([
          {
            $match: { 
              status: 'completed',
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$paymentMethod',
              totalRevenue: { $sum: '$amount' },
              count: { $sum: 1 },
              avgAmount: { $avg: '$amount' }
            }
          },
          { $sort: { totalRevenue: -1 } }
        ])
        break

      case 'chapter_analytics':
        result = await Chapter.aggregate([
          {
            $group: {
              _id: {
                level: '$level',
                workType: '$workType',
                urgency: '$urgency'
              },
              count: { $sum: 1 },
              avgCost: { $avg: '$estimatedCost' },
              avgWordCount: { $avg: '$wordCount' },
              completedCount: { 
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
              }
            }
          },
          {
            $addFields: {
              completionRate: {
                $cond: [
                  { $gt: ['$count', 0] },
                  { $multiply: [{ $divide: ['$completedCount', '$count'] }, 100] },
                  0
                ]
              }
            }
          },
          { $sort: { count: -1 } }
        ])
        break

      default:
        return NextResponse.json({ 
          message: 'Invalid metric type' 
        }, { status: 400 })
    }

    return NextResponse.json({
      metric,
      timeframe: timeframeDays,
      data: result
    })

  } catch (error) {
    console.error('Admin get metric details error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}