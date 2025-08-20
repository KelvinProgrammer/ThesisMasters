// models/Token.js
import mongoose from 'mongoose'

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['email_verification', 'password_reset']
  },
  expiresAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // 1 hour
  }
}, {
  timestamps: true
})

export default mongoose.models.Token || mongoose.model('Token', TokenSchema)