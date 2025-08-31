// app/api/admin/users/route.js - Admin User Management API
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Chapter from '@/models/Chapter'
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
    const authCheck = await checkAdminPermissions(session, 'user_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const role = searchParams.get('role') // 'student', 'writer', 'admin'
    const search = searchParams.get('search')
    const status = searchParams.get('status') // 'active', 'inactive', 'banned'
    const verified = searchParams.get('verified')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    await connectToDatabase()

    // Build query
    let query = {}

    if (role && role !== 'all') {
      query.role = role
    }

    if (status && status !== 'all') {
      switch (status) {
        case 'active':
          query.emailVerified = true
          query.isBanned = { $ne: true }
          break
        case 'inactive':
          query.emailVerified = false
          break
        case 'banned':
          query.isBanned = true
          break
      }
    }

    if (verified && verified !== 'all') {
      query.emailVerified = verified === 'true'
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1

    const skip = (page - 1) * limit

    // Get users with aggregated data
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'chapters',
          localField: '_id',
          foreignField: 'userId',
          as: 'chapters',
          pipeline: [
            {
              $group: {
                _id: null,
                totalChapters: { $sum: 1 },
                completedChapters: { 
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
                },
                totalSpent: { $sum: '$estimatedCost' },
                paidChapters: { $sum: { $cond: ['$isPaid', 1, 0] } }
              }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'userId',
          as: 'payments',
          pipeline: [
            {
              $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalPaid: { 
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } 
                },
                pendingPayments: { 
                  $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } 
                }
              }
            }
          ]
        }
      },
      {
        $addFields: {
          chapterStats: { $arrayElemAt: ['$chapters', 0] },
          paymentStats: { $arrayElemAt: ['$payments', 0] },
          isActive: {
            $and: [
              { $eq: ['$emailVerified', true] },
              { $ne: ['$isBanned', true] }
            ]
          }
        }
      },
      {
        $project: {
          password: 0,
          // Don't expose sensitive writer/admin profile data in list
          'writerProfile.portfolio': 0,
          'adminProfile.permissions': 0
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ])

    // Get total count for pagination
    const total = await User.countDocuments(query)

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          writers: { $sum: { $cond: [{ $eq: ['$role', 'writer'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          verified: { $sum: { $cond: ['$emailVerified', 1, 0] } },
          unverified: { $sum: { $cond: ['$emailVerified', 0, 1] } },
          banned: { $sum: { $cond: ['$isBanned', 1, 0] } },
          activeToday: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          },
          activeThisWeek: {
            $sum: {
              $cond: [
                { $gte: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                1,
                0
              ]
            }
          }
        }
      }
    ])

    // Get registration trend (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const registrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            role: '$role'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          students: { 
            $sum: { $cond: [{ $eq: ['$_id.role', 'student'] }, '$count', 0] } 
          },
          writers: { 
            $sum: { $cond: [{ $eq: ['$_id.role', 'writer'] }, '$count', 0] } 
          },
          admins: { 
            $sum: { $cond: [{ $eq: ['$_id.role', 'admin'] }, '$count', 0] } 
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    const statistics = userStats[0] || {
      total: 0,
      students: 0,
      writers: 0,
      admins: 0,
      verified: 0,
      unverified: 0,
      banned: 0,
      activeToday: 0,
      activeThisWeek: 0
    }

    return NextResponse.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      statistics,
      registrationTrend
    })

  } catch (error) {
    console.error('Admin get users error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}

// UPDATE user (ban, unban, verify, etc.)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'user_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action, data = {} } = body

    if (!userId || !action) {
      return NextResponse.json({ 
        message: 'User ID and action are required' 
      }, { status: 400 })
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        message: 'Invalid user ID' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Prevent self-modification
    if (userId === session.user.id) {
      return NextResponse.json({ 
        message: 'Cannot modify your own account' 
      }, { status: 400 })
    }

    let updateData = {}
    let message = ''

    switch (action) {
      case 'ban':
        if (user.role === 'admin') {
          return NextResponse.json({ 
            message: 'Cannot ban admin users' 
          }, { status: 400 })
        }

        updateData.isBanned = true
        updateData.bannedAt = new Date()
        updateData.banReason = data.reason || 'No reason provided'
        updateData.bannedBy = session.user.id
        message = 'User banned successfully'
        break

      case 'unban':
        updateData.isBanned = false
        updateData.$unset = { bannedAt: 1, banReason: 1, bannedBy: 1 }
        message = 'User unbanned successfully'
        break

      case 'verify_email':
        updateData.emailVerified = true
        message = 'Email verified successfully'
        break

      case 'verify_writer':
        if (user.role !== 'writer') {
          return NextResponse.json({ 
            message: 'User is not a writer' 
          }, { status: 400 })
        }

        updateData['writerProfile.isVerified'] = true
        updateData['writerProfile.verifiedAt'] = new Date()
        updateData['writerProfile.verifiedBy'] = session.user.id
        message = 'Writer verified successfully'
        break

      case 'unverify_writer':
        if (user.role !== 'writer') {
          return NextResponse.json({ 
            message: 'User is not a writer' 
          }, { status: 400 })
        }

        updateData['writerProfile.isVerified'] = false
        updateData.$unset = { 
          'writerProfile.verifiedAt': 1, 
          'writerProfile.verifiedBy': 1 
        }
        message = 'Writer verification removed'
        break

      case 'change_role':
        const allowedRoles = ['student', 'writer']
        if (!data.newRole || !allowedRoles.includes(data.newRole)) {
          return NextResponse.json({ 
            message: 'Valid role is required (student, writer)' 
          }, { status: 400 })
        }

        if (user.role === 'admin') {
          return NextResponse.json({ 
            message: 'Cannot change admin role' 
          }, { status: 400 })
        }

        updateData.role = data.newRole

        // Initialize role-specific profiles
        if (data.newRole === 'writer' && !user.writerProfile) {
          updateData.writerProfile = {
            specializations: [],
            yearsExperience: 0,
            education: { level: 'bachelors', field: '', institution: '' },
            rating: 0,
            totalProjects: 0,
            completedProjects: 0,
            isVerified: false,
            availability: 'available'
          }
        }

        message = `Role changed to ${data.newRole} successfully`
        break

      case 'update_profile':
        const allowedFields = ['name', 'university', 'department', 'phone', 'bio']
        const profileUpdates = {}

        allowedFields.forEach(field => {
          if (data[field] !== undefined) {
            profileUpdates[field] = data[field]
          }
        })

        updateData = { ...updateData, ...profileUpdates }
        message = 'Profile updated successfully'
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

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    return NextResponse.json({
      message,
      user: updatedUser.toSafeObject()
    })

  } catch (error) {
    console.error('Admin update user error:', error)
    
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

// DELETE user (soft delete for data integrity)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkAdminPermissions(session, 'user_management')
    
    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ 
        message: 'Valid user ID is required' 
      }, { status: 400 })
    }

    await connectToDatabase()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Prevent self-deletion
    if (userId === session.user.id) {
      return NextResponse.json({ 
        message: 'Cannot delete your own account' 
      }, { status: 400 })
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return NextResponse.json({ 
        message: 'Cannot delete admin users' 
      }, { status: 400 })
    }

    // Check for active chapters or payments
    const activeChapters = await Chapter.countDocuments({ 
      userId, 
      status: { $in: ['in_progress', 'revision'] } 
    })

    if (activeChapters > 0) {
      return NextResponse.json({ 
        message: 'Cannot delete user with active chapters' 
      }, { status: 400 })
    }

    // Soft delete - mark as deleted but keep data for integrity
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: session.user.id,
      // Anonymize email to prevent conflicts
      email: `deleted_${userId}@deleted.com`
    })

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    })

  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 })
  }
}