// app/api/dashboard/stats/route.js - UPDATED AND ENHANCED
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Import authOptions
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import Payment from '@/models/Payment'
import User from '@/models/User'
import mongoose from 'mongoose'

// Helper function to get userId from session
async function getUserIdFromSession(session) {
  let userId = session.user.id || session.user._id
  
  // If still no userId, try to find user by email
  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email })
    if (user) {
      userId = user._id
    }
  }
  
  return userId
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions) // Pass authOptions
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    console.log('Dashboard stats - Session:', JSON.stringify(session.user, null, 2))

    await connectToDatabase()

    // Get user ID with proper handling
    const userId = await getUserIdFromSession(session)
    
    if (!userId) {
      console.error('No userId found in dashboard stats:', session.user)
      return NextResponse.json({ message: 'User identification failed' }, { status: 400 })
    }

    console.log('Dashboard stats - Using userId:', userId)

    // Convert to ObjectId for aggregation
    const userObjectId = new mongoose.Types.ObjectId(userId)

    // Get comprehensive chapter statistics
    const chapterStats = await Chapter.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          totalTargetWords: { $sum: '$targetWordCount' },
          totalEstimatedCost: { $sum: '$estimatedCost' },
          totalEstimatedPages: { $sum: '$estimatedPages' },
          averageProgress: { 
            $avg: { 
              $cond: {
                if: { $gt: ['$targetWordCount', 0] },
                then: { 
                  $multiply: [
                    { $divide: ['$wordCount', '$targetWordCount'] }, 
                    100
                  ]
                },
                else: 0
              }
            }
          }
        }
      }
    ])

    console.log('Chapter stats aggregation result:', chapterStats)

    // Get urgent chapters count
    const urgentChapters = await Chapter.countDocuments({ 
      userId: userObjectId, 
      urgency: { $in: ['urgent', 'very_urgent'] },
      status: { $in: ['draft', 'in_progress', 'revision'] }
    })

    // Get paid chapters count
    const paidChapters = await Chapter.countDocuments({ 
      userId: userObjectId, 
      isPaid: true 
    })

    // Get overdue chapters (past deadline and not completed)
    const currentDate = new Date()
    const overdueChapters = await Chapter.countDocuments({
      userId: userObjectId,
      deadline: { $lt: currentDate },
      status: { $in: ['draft', 'in_progress', 'revision'] }
    })

    // Get total chapters and overall progress
    const totalChapters = await Chapter.countDocuments({ userId: userObjectId })
    const completedChapters = await Chapter.countDocuments({ 
      userId: userObjectId, 
      status: 'completed' 
    })

    // Get recent activity (last 10 chapters updated)
    const recentChapters = await Chapter.find({ userId: userObjectId })
      .sort({ updatedAt: -1 })
      .limit(10)
      .select('title status updatedAt chapterNumber estimatedCost level workType urgency isPaid')

    // Get payment statistics
    const paymentStats = await Payment.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ])

    console.log('Payment stats aggregation result:', paymentStats)

    // Calculate overall progress
    const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0

    // Get writing streak (days with chapter updates in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const writingDays = await Chapter.aggregate([
      { 
        $match: { 
          userId: userObjectId,
          updatedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' }
          }
        }
      },
      { $count: 'uniqueDays' }
    ])

    const writingStreak = writingDays[0]?.uniqueDays || 0

    // Get monthly chapter completion trend (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTrend = await Chapter.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'completed',
          updatedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' }
          },
          count: { $sum: 1 },
          totalWords: { $sum: '$wordCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Format chapter stats for easy consumption
    const statusCounts = {
      draft: 0,
      in_progress: 0,
      completed: 0,
      revision: 0,
      approved: 0
    }
    
    const statusProgress = {
      draft: 0,
      in_progress: 0,
      completed: 100,
      revision: 0,
      approved: 100
    }

    let totalWords = 0
    let totalTargetWords = 0
    let totalEstimatedCost = 0
    let totalEstimatedPages = 0

    chapterStats.forEach(stat => {
      statusCounts[stat._id] = stat.count
      statusProgress[stat._id] = Math.round(stat.averageProgress || 0)
      totalWords += stat.totalWords || 0
      totalTargetWords += stat.totalTargetWords || 0
      totalEstimatedCost += stat.totalEstimatedCost || 0
      totalEstimatedPages += stat.totalEstimatedPages || 0
    })

    // Format payment stats
    const paymentSummary = {
      completed: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      failed: { count: 0, amount: 0 },
      processing: { count: 0, amount: 0 }
    }
    
    let totalPaid = 0
    let totalPending = 0

    paymentStats.forEach(stat => {
      paymentSummary[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      }
      
      if (stat._id === 'completed') {
        totalPaid = stat.totalAmount
      } else if (stat._id === 'pending' || stat._id === 'processing') {
        totalPending += stat.totalAmount
      }
    })

    // Calculate productivity metrics
    const averageWordsPerChapter = totalChapters > 0 ? Math.round(totalWords / totalChapters) : 0
    const completionRate = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0
    const estimatedHoursSpent = Math.round(totalWords / 250) // Rough estimate: 250 words per hour

    // Build comprehensive response
    const response = {
      chapters: {
        total: totalChapters,
        completed: completedChapters,
        inProgress: statusCounts.in_progress,
        draft: statusCounts.draft,
        revision: statusCounts.revision,
        urgent: urgentChapters,
        overdue: overdueChapters,
        paid: paidChapters,
        progress: Math.round(overallProgress),
        totalWords,
        totalTargetWords,
        totalEstimatedCost,
        totalEstimatedPages,
        averageWordsPerChapter,
        completionRate,
        byStatus: statusCounts,
        progressByStatus: statusProgress
      },
      payments: {
        totalPaid,
        totalPending,
        completedPayments: paymentSummary.completed.count,
        pendingPayments: paymentSummary.pending.count,
        byStatus: paymentSummary
      },
      activity: {
        recentChapters: recentChapters.map(chapter => ({
          id: chapter._id,
          title: chapter.title,
          chapterNumber: chapter.chapterNumber,
          status: chapter.status,
          estimatedCost: chapter.estimatedCost,
          level: chapter.level,
          workType: chapter.workType,
          urgency: chapter.urgency,
          isPaid: chapter.isPaid,
          updatedAt: chapter.updatedAt,
          timeAgo: getTimeAgo(chapter.updatedAt)
        })),
        writingStreak,
        monthlyTrend: monthlyTrend.map(trend => ({
          month: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}`,
          chapters: trend.count,
          words: trend.totalWords
        }))
      },
      overview: {
        chaptersCount: totalChapters,
        progressPercentage: Math.round(overallProgress),
        totalWords,
        estimatedHoursSpent,
        writingStreak,
        completionRate,
        urgentTasks: urgentChapters,
        overdueTasks: overdueChapters
      },
      user: {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role
      }
    }

    console.log('Dashboard stats response summary:', {
      totalChapters: response.chapters.total,
      completedChapters: response.chapters.completed,
      totalCost: response.chapters.totalEstimatedCost,
      totalPaid: response.payments.totalPaid
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    
    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return NextResponse.json({ 
      message: 'Internal server error',
      error: isDevelopment ? error.message : undefined,
      stack: isDevelopment ? error.stack : undefined
    }, { status: 500 })
  }
}

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return new Date(date).toLocaleDateString()
}