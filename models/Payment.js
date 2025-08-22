// models/Payment.js
import mongoose from 'mongoose'

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'KES']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer', 'mpesa'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    sparse: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['chapter_payment', 'subscription', 'one_time'],
    default: 'chapter_payment'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
})

// Index for efficient queries
PaymentSchema.index({ userId: 1, status: 1 })
PaymentSchema.index({ transactionId: 1 })
PaymentSchema.index({ createdAt: -1 })

// Instance methods
PaymentSchema.methods.markAsCompleted = function(transactionId) {
  this.status = 'completed'
  this.transactionId = transactionId
  return this.save()
}

PaymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed'
  this.failureReason = reason
  return this.save()
}

// Static methods
PaymentSchema.statics.getPaymentsByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 }).populate('chapterId', 'title chapterNumber')
}

PaymentSchema.statics.getTotalRevenue = function() {
  return this.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ])
}

const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)
export default Payment