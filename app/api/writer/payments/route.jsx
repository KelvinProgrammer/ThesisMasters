// app/api/writer/payments/route.js - Writer Payments Management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Chapter from '@/models/Chapter'
import Payment from '@/models/Payment'
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
  if (!user || !user.writerProfile?.isVerified) {
    return { isAuthorized: false, error: 'Writer verification required' }
  }

  return { isAuthorized: true, userId }
}

// GET - Fetch writer earnings and payment history
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await connectToDatabase()

    // Get earnings from completed chapters
    let chapterQuery = { 
      writerId: authCheck.userId,
      status: 'completed'
    }

    // Add date filter if provided
    if (startDate || endDate) {
      chapterQuery.completedAt = {}
      if (startDate) chapterQuery.completedAt.$gte = new Date(startDate)
      if (endDate) chapterQuery.completedAt.$lte = new Date(endDate)
    }

    const skip = (page - 1) * limit

    // Get completed chapters with earnings
    const completedChapters = await Chapter.find(chapterQuery)
      .populate('userId', 'name email')
      .populate('paymentId', 'status amount currency transactionId')
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)

    // Calculate writer earnings (70% of chapter cost)
    const chaptersWithEarnings = completedChapters.map(chapter => ({
      ...chapter.toObject(),
      writerEarnings: Math.round(chapter.estimatedCost * 0.7),
      isPaidOut: false, // TODO: Implement payout tracking
      payoutStatus: 'pending' // pending, processing, completed, failed
    }))

    // Get total count for pagination
    const totalCount = await Chapter.countDocuments(chapterQuery)

    // Get earnings statistics
    const earningsStats = await Chapter.aggregate([
      { $match: chapterQuery },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
          totalChapters: { $sum: 1 },
          avgEarningsPerChapter: { $avg: { $multiply: ['$estimatedCost', 0.7] } },
          totalWords: { $sum: '$wordCount' },
          avgWordsPerChapter: { $avg: '$wordCount' }
        }
      }
    ])

    // Get monthly earnings breakdown
    const monthlyEarnings = await Chapter.aggregate([
      { 
        $match: { 
          writerId: authCheck.userId,
          status: 'completed',
          completedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          earnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
          chapters: { $sum: 1 },
          words: { $sum: '$wordCount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get pending payments (chapters completed but not paid out)
    const pendingPayouts = await Chapter.aggregate([
      { 
        $match: { 
          writerId: authCheck.userId,
          status: 'completed'
          // TODO: Add payout status filter when implemented
        }
      },
      {
        $group: {
          _id: null,
          pendingAmount: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
          pendingChapters: { $sum: 1 }
        }
      }
    ])

    const statistics = earningsStats[0] || {
      totalEarnings: 0,
      totalChapters: 0,
      avgEarningsPerChapter: 0,
      totalWords: 0,
      avgWordsPerChapter: 0
    }

    const pending = pendingPayouts[0] || {
      pendingAmount: 0,
      pendingChapters: 0
    }

    return NextResponse.json({
      chapters: chaptersWithEarnings,
      pagination: {
        current: page,
        pages: Math.ceil(totalCount / limit),
        total: totalCount,
        limit
      },
      statistics: {
        ...statistics,
        ...pending,
        monthlyBreakdown: monthlyEarnings.map(item => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          earnings: item.earnings,
          chapters: item.chapters,
          words: item.words,
          avgPerChapter: item.chapters > 0 ? Math.round(item.earnings / item.chapters) : 0
        }))
      }
    })

  } catch (error) {
    console.error('Get writer payments error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// POST - Request payout
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { 
      amount, 
      paymentMethod = 'mpesa', 
      accountDetails, 
      chapterIds 
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ 
        message: 'Valid amount is required' 
      }, { status: 400 })
    }

    if (!accountDetails || !accountDetails.phoneNumber) {
      return NextResponse.json({ 
        message: 'Payment account details are required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Verify writer has sufficient earnings
    const totalEarnings = await Chapter.aggregate([
      {
        $match: {
          writerId: authCheck.userId,
          status: 'completed',
          ...(chapterIds ? { _id: { $in: chapterIds.map(id => new mongoose.Types.ObjectId(id)) } } : {})
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } },
          chapterCount: { $sum: 1 }
        }
      }
    ])

    const availableEarnings = totalEarnings[0]?.totalEarnings || 0

    if (amount > availableEarnings) {
      return NextResponse.json({ 
        message: 'Requested amount exceeds available earnings' 
      }, { status: 400 })
    }

    // Create payout request
    const payoutRequest = {
      writerId: authCheck.userId,
      amount,
      paymentMethod,
      accountDetails,
      chapterIds: chapterIds || [],
      status: 'pending',
      requestedAt: new Date(),
      description: `Writer payout for ${totalEarnings[0]?.chapterCount || 0} completed chapters`
    }

    // TODO: Implement actual payout processing
    // For now, we'll simulate the payout request
    const mockPayoutId = new mongoose.Types.ObjectId()

    // In a real implementation, you would:
    // 1. Create a payout record in database
    // 2. Integrate with payment processor (M-Pesa, bank transfer, etc.)
    // 3. Update chapter payout status
    // 4. Send notification to writer

    console.log('Payout request created:', payoutRequest)

    return NextResponse.json({
      message: 'Payout request submitted successfully',
      payoutId: mockPayoutId,
      amount,
      estimatedProcessingTime: '1-3 business days',
      paymentMethod,
      status: 'pending'
    }, { status: 201 })

  } catch (error) {
    console.error('Writer payout request error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}