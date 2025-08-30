// models/User.js - Updated with profile fields
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name must be less than 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: function() {
      return !this.provider || this.provider === 'credentials'
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  image: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['student', 'supervisor', 'admin'],
    default: 'student'
  },
  // Added profile fields
  university: {
    type: String,
    trim: true,
    maxlength: [100, 'University name must be less than 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department name must be less than 100 characters']
  },
  researchField: {
    type: String,
    trim: true,
    maxlength: [200, 'Research field must be less than 200 characters']
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  },
  // Additional useful fields
  phone: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio must be less than 500 characters']
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
})

// Index for better performance - removed email index to avoid duplication since unique: true already creates one
UserSchema.index({ createdAt: -1 })

// Instance methods
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

// Update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save()
}

// Static method to find by email
UserSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Make sure to use this exact export pattern
const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User