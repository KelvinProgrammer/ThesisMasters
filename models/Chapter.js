// models/Chapter.js - Merged Chapter model with bidding system and file management
import mongoose from "mongoose"

const bidSchema = new mongoose.Schema(
  {
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bidMessage: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    estimatedDays: {
      type: Number,
      required: true,
      min: 1,
      max: 365,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    _id: true,
  },
)

const revisionSchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    changes: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
)

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

const feedbackSchema = new mongoose.Schema({
  reviewer: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  },
)

const ChapterSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: [200, "Title must be less than 200 characters"],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [1000, "Summary must be less than 1000 characters"],
    },
    chapterNumber: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: [1, "Chapter number must be at least 1"],
    },

    // Content and Progress
    content: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50000, "Content cannot exceed 50,000 characters"],
    },
    wordCount: {
      type: Number,
      default: 0,
      min: [0, "Word count cannot be negative"],
    },
    targetWordCount: {
      type: Number,
      default: 2000,
      min: [100, "Target word count must be at least 100 words"],
    },

    // Relationships
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    writerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    // Status and Timeline
    status: {
      type: String,
      enum: ["draft", "pending", "in_progress", "revision", "completed", "approved"],
      default: "draft",
    },
    urgency: {
      type: String,
      enum: ["normal", "urgent", "very_urgent"],
      default: "normal",
    },
    deadline: {
      type: Date,
    },
    assignedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },

    // Academic Details
    level: {
      type: String,
      enum: ["high_school", "undergraduate", "masters", "phd", "postdoc"],
      default: "masters",
    },
    workType: {
      type: String,
      enum: [
        "essay",
        "research_paper",
        "thesis",
        "dissertation",
        "coursework",
        "assignment",
        "project",
        "revision",
        "statistics",
      ],
      default: "coursework",
    },
    subject: {
      type: String,
      trim: true,
      maxlength: [100, "Subject cannot exceed 100 characters"],
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"],
      },
    ],

    // Pricing and Payment
    estimatedCost: {
      type: Number,
      default: 0,
      min: [0, "Estimated cost cannot be negative"],
    },
    estimatedPages: {
      type: Number,
      default: 0,
      min: [0, "Estimated pages cannot be negative"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    pricing: {
      currency: {
        type: String,
        default: "KSH",
      },
      pricePerPage: {
        type: Number,
        default: 400,
      },
      basePrice: {
        type: Number,
        default: 0,
      },
      urgencyMultiplier: {
        type: Number,
        default: 1,
      },
      levelMultiplier: {
        type: Number,
        default: 1,
      },
      workTypeMultiplier: {
        type: Number,
        default: 1,
      },
      totalPrice: {
        type: Number,
        default: 0,
      },
    },

    // Bidding System
    bids: [bidSchema],
    acceptedBidAmount: {
      type: Number,
      min: [0, "Accepted bid amount cannot be negative"],
    },
    expectedCompletionDays: {
      type: Number,
      min: [1, "Expected completion days must be at least 1"],
    },

    // Legacy bid fields (for backward compatibility)
    bidAmount: {
      type: Number,
      min: [0, "Bid amount cannot be negative"],
    },
    bidMessage: {
      type: String,
      trim: true,
      maxlength: [500, "Bid message cannot exceed 500 characters"],
    },

    // File Management
    files: [fileSchema],

    // Content Management
    revisions: [revisionSchema],
    feedback: [feedbackSchema],
    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // Additional Requirements
    requirements: {
      citations: {
        type: String,
        enum: ["apa", "mla", "chicago", "harvard", "ieee", "none"],
        default: "apa",
      },
      sources: {
        type: Number,
        default: 0,
        min: [0, "Number of sources cannot be negative"],
      },
      spacing: {
        type: String,
        enum: ["single", "double", "1.5"],
        default: "double",
      },
      font: {
        type: String,
        default: "Times New Roman",
        trim: true,
      },
      fontSize: {
        type: Number,
        default: 12,
        min: [8, "Font size must be at least 8"],
        max: [24, "Font size cannot exceed 24"],
      },
    },

    // Communication
    messages: [
      {
        senderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        senderRole: {
          type: String,
          enum: ["student", "writer", "admin"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, "Message cannot exceed 1000 characters"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // File Attachments (alternative structure)
    attachments: [
      {
        fileName: {
          type: String,
          required: true,
          trim: true,
        },
        fileUrl: {
          type: String,
          required: true,
          trim: true,
        },
        fileSize: {
          type: Number,
          required: true,
          min: [0, "File size cannot be negative"],
        },
        fileType: {
          type: String,
          required: true,
          trim: true,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Admin Management
    adminLogs: [adminLogSchema],

    // Quality Control
    qualityScore: {
      type: Number,
      min: [0, "Quality score cannot be negative"],
      max: [10, "Quality score cannot exceed 10"],
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for performance
ChapterSchema.index({ userId: 1, chapterNumber: 1 })
ChapterSchema.index({ writerId: 1, status: 1 })
ChapterSchema.index({ status: 1, createdAt: -1 })
ChapterSchema.index({ deadline: 1, status: 1 })
ChapterSchema.index({ isPaid: 1, status: 1 })
ChapterSchema.index({ "bids.writerId": 1, "bids.status": 1 })
ChapterSchema.index({ "bids.status": 1 })
ChapterSchema.index({ isActive: 1, isDeleted: 1 })
ChapterSchema.index({ level: 1 })
ChapterSchema.index({ workType: 1 })

// Virtual properties
ChapterSchema.virtual("progressPercentage").get(function () {
  if (!this.targetWordCount || this.targetWordCount === 0) return 0
  return Math.min(Math.round((this.wordCount / this.targetWordCount) * 100), 100)
})

ChapterSchema.virtual("estimatedReadingTime").get(function () {
  if (!this.wordCount) return 0
  return Math.ceil(this.wordCount / 200)
})

ChapterSchema.virtual("daysSinceAssigned").get(function () {
  if (!this.assignedAt) return null
  return Math.floor((new Date() - this.assignedAt) / (1000 * 60 * 60 * 24))
})

ChapterSchema.virtual("daysUntilDeadline").get(function () {
  if (!this.deadline) return null
  return Math.ceil((this.deadline - new Date()) / (1000 * 60 * 60 * 24))
})

ChapterSchema.virtual("isOverdue").get(function () {
  if (!this.deadline) return false
  return this.deadline < new Date() && ["draft", "in_progress", "revision"].includes(this.status)
})

ChapterSchema.virtual("pendingBidsCount").get(function () {
  return this.bids ? this.bids.filter((bid) => bid.status === "pending").length : 0
})

ChapterSchema.virtual("totalBidsCount").get(function () {
  return this.bids ? this.bids.length : 0
})

ChapterSchema.virtual("writerEarnings").get(function () {
  const baseAmount = this.acceptedBidAmount || this.estimatedCost || 0
  return Math.round(baseAmount * 0.7 * 100) / 100
})

// Pre-save middleware
ChapterSchema.pre("save", function (next) {
  if (this.isModified("content") && this.content) {
    this.wordCount = this.content.split(/\s+/).filter((word) => word.length > 0).length
  }

  if (this.isModified("status") && this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date()
  }

  if (this.isModified("writerId") && this.writerId && !this.assignedAt) {
    this.assignedAt = new Date()
  }

  next()
})

// Instance methods
ChapterSchema.methods.updateWordCount = function () {
  this.wordCount = this.content.split(/\s+/).filter((word) => word.length > 0).length
  return this.wordCount
}

ChapterSchema.methods.getProgress = function () {
  return Math.min((this.wordCount / this.targetWordCount) * 100, 100)
}

ChapterSchema.methods.calculatePricing = function () {
  const pages = Math.ceil(this.targetWordCount / 250)
  const baseRate = 400

  const urgencyMultipliers = { normal: 1, urgent: 1.5, very_urgent: 2 }
  const levelMultipliers = { high_school: 0.8, undergraduate: 0.9, masters: 1, phd: 1.3, postdoc: 1.5 }
  const workTypeMultipliers = {
    coursework: 1,
    revision: 0.8,
    statistics: 1.4,
    essay: 1,
    research_paper: 1.2,
    thesis: 1.3,
    dissertation: 1.5,
    assignment: 0.9,
    project: 1.1,
  }

  const basePrice = pages * baseRate
  const urgencyMultiplier = urgencyMultipliers[this.urgency] || 1
  const levelMultiplier = levelMultipliers[this.level] || 1
  const workTypeMultiplier = workTypeMultipliers[this.workType] || 1

  const totalPrice = Math.round(basePrice * urgencyMultiplier * levelMultiplier * workTypeMultiplier)

  this.pricing = {
    currency: "KSH",
    pricePerPage: baseRate,
    basePrice,
    urgencyMultiplier,
    levelMultiplier,
    workTypeMultiplier,
    totalPrice,
  }

  this.estimatedPages = pages
  this.estimatedCost = totalPrice

  return this.pricing
}

ChapterSchema.methods.addFile = function (fileInfo) {
  if (!this.files) {
    this.files = []
  }
  this.files.push(fileInfo)
  return this.save()
}

ChapterSchema.methods.removeFile = function (fileName) {
  if (this.files) {
    this.files = this.files.filter((file) => file.fileName !== fileName)
    return this.save()
  }
  return Promise.resolve(this)
}

ChapterSchema.methods.getLatestFile = function () {
  if (!this.files || this.files.length === 0) return null
  return this.files[this.files.length - 1]
}

ChapterSchema.methods.addBid = function (writerId, bidData) {
  const existingBid = this.bids.find(
    (bid) => bid.writerId.toString() === writerId.toString() && bid.status === "pending",
  )

  if (existingBid) {
    throw new Error("Writer already has a pending bid on this chapter")
  }

  const newBid = {
    writerId,
    bidAmount: bidData.bidAmount,
    bidMessage: bidData.bidMessage,
    estimatedDays: bidData.estimatedDays,
    status: "pending",
    createdAt: new Date(),
  }

  this.bids.push(newBid)

  if (this.status === "draft") {
    this.status = "pending"
  }

  return this.save()
}

ChapterSchema.methods.acceptBid = function (bidId, adminId) {
  const bidIndex = this.bids.findIndex((bid) => bid._id.toString() === bidId.toString())

  if (bidIndex === -1) {
    throw new Error("Bid not found")
  }

  const bid = this.bids[bidIndex]

  if (bid.status !== "pending") {
    throw new Error("Bid is not pending")
  }

  this.bids[bidIndex].status = "accepted"
  this.bids[bidIndex].acceptedAt = new Date()
  this.bids[bidIndex].acceptedBy = adminId

  this.writerId = bid.writerId
  this.status = "in_progress"
  this.assignedAt = new Date()
  this.acceptedBidAmount = bid.bidAmount
  this.expectedCompletionDays = bid.estimatedDays

  this.bids.forEach((otherBid, index) => {
    if (index !== bidIndex && otherBid.status === "pending") {
      otherBid.status = "rejected"
      otherBid.rejectedAt = new Date()
      otherBid.rejectedBy = adminId
      otherBid.rejectionReason = "Another bid was accepted"
    }
  })

  return this.save()
}

ChapterSchema.methods.rejectBid = function (bidId, adminId, reason = "Bid rejected by admin") {
  const bidIndex = this.bids.findIndex((bid) => bid._id.toString() === bidId.toString())

  if (bidIndex === -1) {
    throw new Error("Bid not found")
  }

  if (this.bids[bidIndex].status !== "pending") {
    throw new Error("Bid is not pending")
  }

  this.bids[bidIndex].status = "rejected"
  this.bids[bidIndex].rejectedAt = new Date()
  this.bids[bidIndex].rejectedBy = adminId
  this.bids[bidIndex].rejectionReason = reason

  return this.save()
}

ChapterSchema.methods.canUserBid = function (writerId) {
  if (this.writerId || this.status === "completed" || this.status === "approved") {
    return false
  }

  const existingBid = this.bids.find(
    (bid) => bid.writerId.toString() === writerId.toString() && bid.status === "pending",
  )

  return !existingBid
}

// Static methods
ChapterSchema.statics.getChaptersByUser = function (userId) {
  return this.find({ userId }).sort({ chapterNumber: 1 })
}

ChapterSchema.statics.getChaptersByStatus = function (userId, status) {
  return this.find({ userId, status }).sort({ updatedAt: -1 })
}

ChapterSchema.statics.getChaptersByWriter = function (writerId, status = null) {
  const query = { writerId, isActive: true, isDeleted: false }
  if (status) query.status = status

  return this.find(query)
    .populate("userId", "name email university department")
    .populate("paymentId", "status amount currency")
    .sort({ updatedAt: -1 })
}

ChapterSchema.statics.getAvailableChapters = function (isPaidOnly = false) {
  const query = {
    writerId: { $exists: false },
    isActive: true,
    isDeleted: false,
  }

  if (isPaidOnly) {
    query.isPaid = true
  }

  return this.find(query)
    .populate("userId", "name email university department")
    .populate("paymentId", "status amount currency")
    .sort({ deadline: 1, createdAt: -1 })
}

ChapterSchema.statics.getChaptersWithPendingBids = function () {
  return this.find({
    "bids.status": "pending",
    isActive: true,
    isDeleted: false,
  })
    .populate("userId", "name email university department")
    .populate("bids.writerId", "name email writerProfile")
    .sort({ updatedAt: -1 })
}

ChapterSchema.statics.getUserStatistics = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalChapters: { $sum: 1 },
        totalCost: { $sum: "$estimatedCost" },
        totalPages: { $sum: "$estimatedPages" },
        totalWords: { $sum: "$wordCount" },
        paidChapters: { $sum: { $cond: ["$isPaid", 1, 0] } },
        completedChapters: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      },
    },
  ])
}

const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", ChapterSchema)
export default Chapter
