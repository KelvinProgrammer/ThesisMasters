// app/api/writer/chapters/route.js - Fixed API with proper error handling
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import Chapter from "@/models/Chapter"
import User from "@/models/User"
import mongoose from "mongoose"

// Helper function to check writer permissions
async function checkWriterPermissions(session) {
  if (!session || !session.user) {
    return { isAuthorized: false, error: "Not authenticated" }
  }

  if (session.user.role !== "writer") {
    return { isAuthorized: false, error: "Writer access required" }
  }

  await connectToDatabase()
  let userId = session.user.id || session.user._id

  if (!userId && session.user.email) {
    const user = await User.findOne({ email: session.user.email })
    if (user) userId = user._id
  }

  const user = await User.findById(userId)
  if (!user) {
    return { isAuthorized: false, error: "User not found" }
  }

  return { isAuthorized: true, userId, isVerified: user.writerProfile?.isVerified || false }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    const authCheck = await checkWriterPermissions(session)

    if (!authCheck.isAuthorized) {
      return NextResponse.json({ message: authCheck.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const sortBy = searchParams.get("sortBy") || "updatedAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    console.log("Writer API - Status param:", status)
    console.log("Writer API - WriterId:", authCheck.userId)

    await connectToDatabase()

    let query = {}

    // Handle different status scenarios for bidding system
    if (status === "available") {
      query = {
        $or: [{ writerId: { $exists: false } }, { writerId: null }],
      }
    } else if (status === "accepted") {
      query = { writerId: authCheck.userId }
    } else if (status === "current") {
      query = {
        $or: [
          { writerId: authCheck.userId },
          {
            $or: [{ writerId: { $exists: false } }, { writerId: null }],
          },
        ],
      }
    } else if (status && status.includes(",")) {
      const statusArray = status.split(",").map((s) => s.trim())
      query = {
        writerId: authCheck.userId,
        status: { $in: statusArray },
      }
    } else if (status === "in-progress") {
      query = {
        writerId: authCheck.userId,
        status: { $in: ["in_progress", "revision"] },
      }
    } else if (status === "completed") {
      query = {
        writerId: authCheck.userId,
        status: "completed",
      }
    } else if (status && status !== "all") {
      if (["draft", "pending", "in_progress", "revision", "completed"].includes(status)) {
        if (status === "pending") {
          query = {
            bids: {
              $elemMatch: {
                status: "pending",
              },
            },
          }
        } else {
          query = {
            status: status,
            $or: [{ writerId: { $exists: false } }, { writerId: null }, { writerId: authCheck.userId }],
          }
        }
      } else {
        query = {
          writerId: authCheck.userId,
          status: status,
        }
      }
    } else {
      query = {
        $or: [{ writerId: { $exists: false } }, { writerId: null }],
      }
    }

    const skip = (page - 1) * limit

    const chapters = await Chapter.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { name: 1, email: 1, university: 1, department: 1 } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "writerId",
          foreignField: "_id",
          as: "writer",
          pipeline: [{ $project: { name: 1, email: 1 } }],
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "paymentId",
          foreignField: "_id",
          as: "payment",
          pipeline: [{ $project: { status: 1, amount: 1, currency: 1 } }],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          writer: { $arrayElemAt: ["$writer", 0] },
          payment: { $arrayElemAt: ["$payment", 0] },

          bidsWithWriters: {
            $map: {
              input: { $ifNull: ["$bids", []] },
              as: "bid",
              in: {
                $mergeObjects: [
                  "$$bid",
                  {
                    writerInfo: {
                      $cond: {
                        if: { $ne: ["$$bid.writerId", null] },
                        then: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: "$bidWriters",
                                cond: { $eq: ["$$this._id", "$$bid.writerId"] },
                              },
                            },
                            0,
                          ],
                        },
                        else: null,
                      },
                    },
                  },
                ],
              },
            },
          },

          estimatedEarnings: {
            $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7],
          },
          earnings: {
            $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7],
          },

          isAssignedToMe: {
            $eq: ["$writerId", new mongoose.Types.ObjectId(authCheck.userId)],
          },

          isAvailableForBidding: {
            $and: [
              {
                $or: [{ $not: { $ifNull: ["$writerId", false] } }, { $eq: ["$writerId", null] }],
              },
            ],
          },

          canBid: {
            $and: [
              {
                $or: [{ $not: { $ifNull: ["$writerId", false] } }, { $eq: ["$writerId", null] }],
              },
              {
                $not: {
                  $in: [
                    new mongoose.Types.ObjectId(authCheck.userId),
                    {
                      $map: {
                        input: {
                          $filter: {
                            input: { $ifNull: ["$bids", []] },
                            cond: { $eq: ["$$this.status", "pending"] },
                          },
                        },
                        as: "bid",
                        in: "$$bid.writerId",
                      },
                    },
                  ],
                },
              },
            ],
          },

          myBid: {
            $arrayElemAt: [
              {
                $filter: {
                  input: { $ifNull: ["$bids", []] },
                  cond: { $eq: ["$$this.writerId", new mongoose.Types.ObjectId(authCheck.userId)] },
                },
              },
              0,
            ],
          },
        },
      },
      { $sort: { [sortBy]: sortOrder === "desc" ? -1 : 1 } },
      { $skip: skip },
      { $limit: limit },
    ])

    console.log("Writer API - Found chapters:", chapters.length)

    const totalCountPipeline = [{ $match: query }, { $count: "total" }]
    const totalResult = await Chapter.aggregate(totalCountPipeline)
    const total = totalResult[0]?.total || 0

    const stats = await Chapter.aggregate([
      {
        $facet: {
          availableForBidding: [
            {
              $match: {
                $or: [{ writerId: { $exists: false } }, { writerId: null }],
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalValue: { $sum: { $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7] } },
                avgValue: { $avg: { $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7] } },
                withBids: {
                  $sum: {
                    $cond: [{ $gt: [{ $size: { $ifNull: ["$bids", []] } }, 0] }, 1, 0],
                  },
                },
              },
            },
          ],
          myChapters: [
            { $match: { writerId: new mongoose.Types.ObjectId(authCheck.userId) } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
                completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
                revision: { $sum: { $cond: [{ $eq: ["$status", "revision"] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
                totalEarnings: { $sum: { $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7] } },
                completedEarnings: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "completed"] },
                      { $multiply: [{ $ifNull: ["$estimatedCost", 0] }, 0.7] },
                      0,
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    ])

    const availableStats = stats[0]?.availableForBidding[0] || {
      total: 0,
      totalValue: 0,
      avgValue: 0,
      withBids: 0,
    }

    const myStats = stats[0]?.myChapters[0] || {
      total: 0,
      inProgress: 0,
      completed: 0,
      revision: 0,
      draft: 0,
      totalEarnings: 0,
      completedEarnings: 0,
    }

    const statistics = {
      availableChapters: availableStats.total,
      available: availableStats.total,
      availableValue: availableStats.totalValue,
      avgChapterValue: availableStats.avgValue || 0,
      chaptersWithBids: availableStats.withBids,

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
      myCompletedEarnings: myStats.completedEarnings,

      myPendingBids: 0,
      myAcceptedBids: 0,
      myRejectedBids: 0,
      myTotalBidAmount: 0,
      pendingBidsCount: 0,
    }

    return NextResponse.json({
      chapters,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
      },
      statistics,
      writerInfo: {
        writerId: authCheck.userId,
        isVerified: authCheck.isVerified,
        canBid: authCheck.isVerified,
      },
      debug: {
        query,
        statusParam: status,
        availableCount: availableStats.total,
        myChaptersCount: myStats.total,
      },
    })
  } catch (error) {
    console.error("Writer get chapters error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

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
      return NextResponse.json(
        {
          message: "Chapter ID and action are required",
        },
        { status: 400 },
      )
    }

    if (!mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json(
        {
          message: "Invalid chapter ID",
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const chapter = await Chapter.findById(chapterId)
    if (!chapter) {
      return NextResponse.json({ message: "Chapter not found" }, { status: 404 })
    }

    const updateData = {}
    let message = ""

    switch (action) {
      case "submit_bid":
        if (!authCheck.isVerified) {
          return NextResponse.json(
            {
              message: "Writer verification required to bid on chapters",
            },
            { status: 403 },
          )
        }

        if (chapter.writerId) {
          return NextResponse.json(
            {
              message: "Chapter already assigned to another writer",
            },
            { status: 400 },
          )
        }

        const existingBid = chapter.bids?.find(
          (bid) => bid.writerId.toString() === authCheck.userId.toString() && bid.status === "pending",
        )

        if (existingBid) {
          return NextResponse.json(
            {
              message: "You already have a pending bid on this chapter",
            },
            { status: 400 },
          )
        }

        if (!data.bidAmount || data.bidAmount <= 0) {
          return NextResponse.json(
            {
              message: "Valid bid amount is required",
            },
            { status: 400 },
          )
        }

        if (!data.estimatedDays || data.estimatedDays <= 0) {
          return NextResponse.json(
            {
              message: "Estimated completion days is required",
            },
            { status: 400 },
          )
        }

        if (!data.bidMessage || data.bidMessage.trim().length < 10) {
          return NextResponse.json(
            {
              message: "Bid message must be at least 10 characters",
            },
            { status: 400 },
          )
        }

        const newBid = {
          _id: new mongoose.Types.ObjectId(),
          writerId: authCheck.userId,
          bidAmount: data.bidAmount,
          bidMessage: data.bidMessage.trim(),
          estimatedDays: data.estimatedDays,
          status: "pending",
          createdAt: new Date(),
        }

        updateData.$push = { bids: newBid }

        if (chapter.status === "draft") {
          updateData.status = "pending"
        }

        message = "Bid submitted successfully! Wait for admin approval."
        break

      case "bid":
      case "accept":
        if (!authCheck.isVerified) {
          return NextResponse.json(
            {
              message: "Writer verification required to accept chapters",
            },
            { status: 403 },
          )
        }

        if (chapter.writerId) {
          return NextResponse.json(
            {
              message: "Chapter already assigned to another writer",
            },
            { status: 400 },
          )
        }

        updateData.writerId = authCheck.userId
        updateData.status = "in_progress"
        updateData.assignedAt = new Date()

        if (data.bidAmount) {
          updateData.bidAmount = data.bidAmount
        }
        if (data.bidMessage) {
          updateData.bidMessage = data.bidMessage
        }

        message = "Chapter accepted successfully"
        break

      case "update_status":
        if (chapter.writerId?.toString() !== authCheck.userId.toString()) {
          return NextResponse.json(
            {
              message: "You can only update your own chapters",
            },
            { status: 403 },
          )
        }

        const allowedStatuses = ["in_progress", "completed", "revision"]
        if (!data.status || !allowedStatuses.includes(data.status)) {
          return NextResponse.json(
            {
              message: "Valid status is required",
            },
            { status: 400 },
          )
        }

        updateData.status = data.status
        if (data.status === "completed") {
          updateData.completedAt = new Date()
        }
        message = "Chapter status updated successfully"
        break

      case "add_content":
        if (chapter.writerId?.toString() !== authCheck.userId.toString()) {
          return NextResponse.json(
            {
              message: "You can only update your own chapters",
            },
            { status: 403 },
          )
        }

        if (!data.content) {
          return NextResponse.json(
            {
              message: "Content is required",
            },
            { status: 400 },
          )
        }

        if (chapter.content && chapter.content !== data.content) {
          if (!chapter.revisions) {
            chapter.revisions = []
          }
          chapter.revisions.push({
            version: chapter.revisions.length + 1,
            content: chapter.content,
            changes: data.changes || "Content updated",
            createdAt: new Date(),
          })
        }

        updateData.content = data.content
        updateData.wordCount = data.content.split(/\s+/).filter((word) => word.length > 0).length
        updateData.notes = data.notes || chapter.notes

        if (chapter.status === "draft") {
          updateData.status = "in_progress"
        }

        message = "Content updated successfully"
        break

      default:
        return NextResponse.json(
          {
            message: "Invalid action",
          },
          { status: 400 },
        )
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(chapterId, updateData, {
      new: true,
      runValidators: true,
    }).populate([
      {
        path: "userId",
        select: "name email university department",
      },
    ])

    if (action === "update_status" && data.status === "completed") {
      await User.findByIdAndUpdate(authCheck.userId, {
        $inc: {
          "writerProfile.completedProjects": 1,
        },
      })
    }

    return NextResponse.json({
      message,
      chapter: updatedChapter,
    })
  } catch (error) {
    console.error("Writer update chapter error:", error)

    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          message: Object.values(error.errors)[0].message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
