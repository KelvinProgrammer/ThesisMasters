// app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { connectToDatabase } from '@/lib/mongodb'
import Chapter from '@/models/Chapter'
import Payment from '@/models/Payment'

export async function GET(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }

    await connectToDatabase()

    // Get chapter statistics
    const chapterStats = await Chapter.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          averageProgress: { 
            $avg: { 
              $multiply: [
                { $divide: ['$wordCount', '$targetWordCount'] }, 
                100
              ]
            }
          }
        }
      }
    ])

    // Get total chapters and overall progress
    const totalChapters = await Chapter.countDocuments({ userId: session.user.id })
    const completedChapters = await Chapter.countDocuments({ 
      userId: session.user.id, 
      status: 'completed' 
    })

    // Get recent activity
    const recentChapters = await Chapter.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt chapterNumber')

    // Get payment statistics
    const paymentStats = await Payment.aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ])

    // Calculate overall progress
    const overallProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0

    // Get writing streak (days with chapter updates in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const writingDays = await Chapter.aggregate([
      { 
        $match: { 
          userId: session.user.id,
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

    // Format chapter stats for easy consumption
    const statusCounts = {}
    const statusProgress = {}
    let totalWords = 0

    chapterStats.forEach(stat => {
      statusCounts[stat._id] = stat.count
      statusProgress[stat._id] = Math.round(stat.averageProgress || 0)
      totalWords += stat.totalWords
    })

    // Format payment stats
    const paymentSummary = {}
    let totalPaid = 0

    paymentStats.forEach(stat => {
      paymentSummary[stat._id] = {
        count: stat.count,
        amount: stat.totalAmount
      }
      if (stat._id === 'completed') {
        totalPaid = stat.totalAmount
      }
    })

    return NextResponse.json({
      chapters: {
        total: totalChapters,
        completed: completedChapters,
        progress: Math.round(overallProgress),
        totalWords,
        byStatus: statusCounts,
        progressByStatus: statusProgress
      },
      payments: {
        total: paymentSummary.completed?.amount || 0,
        pending: paymentSummary.pending?.amount || 0,
        byStatus: paymentSummary
      },
      activity: {
        recentChapters,
        writingStreak
      },
      overview: {
        chaptersCount: totalChapters,
        progressPercentage: Math.round(overallProgress),
        totalCitations: 0, // Placeholder - implement if needed
        hoursSpent: Math.round(totalWords / 250) // Rough estimate: 250 words per hour
      }
    })
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}