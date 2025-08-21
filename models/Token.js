// models/Token.js (Simple, working version)
import mongoose from 'mongoose'

const TokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
})

// Make sure to use this exact export pattern
const Token = mongoose.models.Token || mongoose.model('Token', TokenSchema)
export default Token