// models/Chapter.js
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

// Instance methods
ChapterSchema.methods.updateWordCount = function() {
  this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length
  return this.wordCount
}

ChapterSchema.methods.getProgress = function() {
  return Math.min((this.wordCount / this.targetWordCount) * 100, 100)
}

// Static methods
ChapterSchema.statics.getChaptersByUser = function(userId) {
  return this.find({ userId }).sort({ chapterNumber: 1 })
}

ChapterSchema.statics.getChaptersByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ updatedAt: -1 })
}

const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema)
export default Chapter