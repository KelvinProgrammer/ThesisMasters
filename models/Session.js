// models/Session.js (FIXED - No duplicate indexes)
import mongoose from 'mongoose'

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true  // Single index definition
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true  // This creates the index automatically
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  device: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: {
    name: String,
    version: String
  },
  os: {
    name: String,
    version: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true  // Single index definition
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0  // TTL index - automatically delete expired documents
  }
}, {
  timestamps: true
})

// Instance methods
SessionSchema.methods.updateActivity = function() {
  this.lastActivityAt = new Date()
  return this.save()
}

SessionSchema.methods.terminate = function() {
  this.isActive = false
  return this.save()
}

export default mongoose.models.Session || mongoose.model('Session', SessionSchema)