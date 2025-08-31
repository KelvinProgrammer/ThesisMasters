// app/api/writer/profile/route.js - Writer Profile Management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Chapter from '@/models/Chapter'

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

  return { isAuthorized: true, userId }
}

// GET - Fetch writer profile with statistics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    await connectToDatabase()

    // Get writer profile
    const writer = await User.findById(authCheck.userId).select('-password')
    
    if (!writer) {
      return NextResponse.json({ message: 'Writer not found' }, { status: 404 })
    }

    // Get detailed statistics from chapters
    const chapterStats = await Chapter.aggregate([
      { $match: { writerId: authCheck.userId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          completedProjects: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgressProjects: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          revisionProjects: { $sum: { $cond: [{ $eq: ['$status', 'revision'] }, 1, 0] } },
          totalWords: { $sum: '$wordCount' },
          totalEarnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } }, // 70% to writer
          avgRating: { $avg: '$rating' },
          totalPages: { $sum: '$estimatedPages' }
        }
      }
    ])

    // Get monthly performance for last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await Chapter.aggregate([
      {
        $match: {
          writerId: authCheck.userId,
          completedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          chaptersCompleted: { $sum: 1 },
          wordsWritten: { $sum: '$wordCount' },
          earnings: { $sum: { $multiply: ['$estimatedCost', 0.7] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Get recent feedback/ratings
    const recentFeedback = await Chapter.find({
      writerId: authCheck.userId,
      'feedback.0': { $exists: true }
    })
    .select('title feedback createdAt')
    .sort({ updatedAt: -1 })
    .limit(10)

    const stats = chapterStats[0] || {
      totalProjects: 0,
      completedProjects: 0,
      inProgressProjects: 0,
      revisionProjects: 0,
      totalWords: 0,
      totalEarnings: 0,
      avgRating: 0,
      totalPages: 0
    }

    // Calculate completion rate and other metrics
    const completionRate = stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects * 100) : 0
    const avgWordsPerProject = stats.totalProjects > 0 ? Math.round(stats.totalWords / stats.totalProjects) : 0

    return NextResponse.json({
      writer: writer.toSafeObject(),
      statistics: {
        ...stats,
        completionRate: Math.round(completionRate),
        avgWordsPerProject,
        monthlyPerformance: monthlyStats.map(stat => ({
          month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
          chapters: stat.chaptersCompleted,
          words: stat.wordsWritten,
          earnings: stat.earnings
        }))
      },
      recentFeedback: recentFeedback.map(chapter => ({
        chapterTitle: chapter.title,
        feedback: chapter.feedback[chapter.feedback.length - 1], // Latest feedback
        date: chapter.createdAt
      }))
    })

  } catch (error) {
    console.error('Get writer profile error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// PUT - Update writer profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      specializations, 
      yearsExperience, 
      education, 
      availability,
      bio 
    } = body

    // Validate required fields
    if (name && (name.trim().length < 2 || name.trim().length > 50)) {
      return NextResponse.json({ 
        message: 'Name must be between 2 and 50 characters' 
      }, { status: 400 })
    }

    if (yearsExperience && (yearsExperience < 0 || yearsExperience > 50)) {
      return NextResponse.json({ 
        message: 'Years of experience must be between 0 and 50' 
      }, { status: 400 })
    }

    if (specializations && (!Array.isArray(specializations) || specializations.length === 0)) {
      return NextResponse.json({ 
        message: 'At least one specialization is required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    // Build update object
    const updateData = {}
    
    if (name) updateData.name = name.trim()
    
    if (specializations || yearsExperience || education || availability || bio) {
      updateData.writerProfile = {}
      
      if (specializations) updateData['writerProfile.specializations'] = specializations
      if (yearsExperience !== undefined) updateData['writerProfile.yearsExperience'] = yearsExperience
      if (education) updateData['writerProfile.education'] = education
      if (availability) updateData['writerProfile.availability'] = availability
    }

    // Update writer profile
    const updatedWriter = await User.findByIdAndUpdate(
      authCheck.userId,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    )

    if (!updatedWriter) {
      return NextResponse.json({ message: 'Writer not found' }, { status: 404 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      writer: updatedWriter.toSafeObject()
    })

  } catch (error) {
    console.error('Update writer profile error:', error)
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: Object.values(error.errors)[0].message 
      }, { status: 400 })
    }

    if (error.code === 11000) {
      return NextResponse.json({ 
        message: 'Email already exists' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}