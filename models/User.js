// models/User.js (Simple, working version)
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  provider: {
    type: String,
    enum: ['credentials', 'google'],
    default: 'credentials'
  }
}, {
  timestamps: true
})

// Instance methods
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

// Make sure to use this exact export pattern
const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User