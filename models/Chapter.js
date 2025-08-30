// models/Chapter.js - Updated with Files Array and Full Features
import mongoose from 'mongoose'

const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Chapter title is required'],
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  content: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary must be less than 500 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'revision', 'approved'],
    default: 'draft'
  },
  chapterNumber: {
    type: Number,
    required: true,
    min: 1
  },
  wordCount: {
    type: Number,
    default: 0
  },
  targetWordCount: {
    type: Number,
    default: 2000
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    default: ''
  },
  
  // Pricing Information
  level: {
    type: String,
    enum: ['masters', 'phd'],
    default: 'masters'
  },
  workType: {
    type: String,
    enum: ['coursework', 'revision', 'statistics'],
    default: 'coursework'
  },
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'very_urgent'],
    default: 'normal'
  },
  estimatedPages: {
    type: Number,
    default: 0
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  pricing: {
    currency: {
      type: String,
      default: 'KSH'
    },
    pricePerPage: {
      type: Number,
      default: 400
    },
    basePrice: {
      type: Number,
      default: 0
    },
    urgencyMultiplier: {
      type: Number,
      default: 1
    },
    levelMultiplier: {
      type: Number,
      default: 1
    },
    workTypeMultiplier: {
      type: Number,
      default: 1
    },
    totalPrice: {
      type: Number,
      default: 0
    }
  },

  // File Management
  files: [{
    originalName: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  feedback: [{
    reviewer: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  revisions: [{
    version: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    changes: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }
}, {
  timestamps: true
})

// Index for efficient queries
ChapterSchema.index({ userId: 1, chapterNumber: 1 })
ChapterSchema.index({ status: 1 })
ChapterSchema.index({ level: 1 })
ChapterSchema.index({ workType: 1 })
ChapterSchema.index({ isPaid: 1 })

// Instance methods
ChapterSchema.methods.updateWordCount = function() {
  this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length
  return this.wordCount
}

ChapterSchema.methods.getProgress = function() {
  return Math.min((this.wordCount / this.targetWordCount) * 100, 100)
}

ChapterSchema.methods.calculatePricing = function() {
  const pages = Math.ceil(this.targetWordCount / 250)
  const baseRate = 400 // KSH per page
  
  const urgencyMultipliers = { normal: 1, urgent: 1.5, very_urgent: 2 }
  const levelMultipliers = { masters: 1, phd: 1.3 }
  const workTypeMultipliers = { coursework: 1, revision: 0.8, statistics: 1.4 }
  
  const basePrice = pages * baseRate
  const urgencyMultiplier = urgencyMultipliers[this.urgency] || 1
  const levelMultiplier = levelMultipliers[this.level] || 1
  const workTypeMultiplier = workTypeMultipliers[this.workType] || 1
  
  const totalPrice = Math.round(basePrice * urgencyMultiplier * levelMultiplier * workTypeMultiplier)
  
  this.pricing = {
    currency: 'KSH',
    pricePerPage: baseRate,
    basePrice,
    urgencyMultiplier,
    levelMultiplier,
    workTypeMultiplier,
    totalPrice
  }
  
  this.estimatedPages = pages
  this.estimatedCost = totalPrice
  
  return this.pricing
}

ChapterSchema.methods.addFile = function(fileInfo) {
  if (!this.files) {
    this.files = []
  }
  this.files.push(fileInfo)
  return this.save()
}

ChapterSchema.methods.removeFile = function(fileName) {
  if (this.files) {
    this.files = this.files.filter(file => file.fileName !== fileName)
    return this.save()
  }
  return Promise.resolve(this)
}

ChapterSchema.methods.getLatestFile = function() {
  if (!this.files || this.files.length === 0) return null
  return this.files[this.files.length - 1]
}

// Static methods
ChapterSchema.statics.getChaptersByUser = function(userId) {
  return this.find({ userId }).sort({ chapterNumber: 1 })
}

ChapterSchema.statics.getChaptersByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ updatedAt: -1 })
}

ChapterSchema.statics.getUserStatistics = function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalChapters: { $sum: 1 },
        totalCost: { $sum: '$estimatedCost' },
        totalPages: { $sum: '$estimatedPages' },
        totalWords: { $sum: '$wordCount' },
        paidChapters: { $sum: { $cond: ['$isPaid', 1, 0] } },
        completedChapters: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
      }
    }
  ])
}

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema)
export default Chapter