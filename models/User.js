// models/User.js - Quick Fix Version
// Replace your existing User model with this updated version

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
    enum: ['student', 'supervisor', 'admin', 'writer'], // Added 'writer' here
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
  },
  
  // Writer-specific fields - only populated for writer role
  writerProfile: {
    specializations: [{
      type: String,
      enum: ['academic_writing', 'research', 'statistics', 'data_analysis', 'literature_review', 'methodology']
    }],
    yearsExperience: {
      type: Number,
      min: 0,
      default: 0
    },
    education: {
      level: {
        type: String,
        enum: ['bachelors', 'masters', 'phd']
      },
      field: String,
      institution: String
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    isVerified: {
      type: Boolean,
      default: false // Requires admin verification
    },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available'
    }
  },
  
  // Admin-specific fields - only populated for admin role
  adminProfile: {
    permissions: [{
      type: String,
      enum: ['user_management', 'writer_management', 'content_management', 'payment_management', 'system_settings']
    }],
    department: {
      type: String,
      enum: ['operations', 'quality_assurance', 'customer_support', 'finance', 'technical']
    },
    accessLevel: {
      type: String,
      enum: ['junior', 'senior', 'super_admin'],
      default: 'junior'
    }
  }
}, {
  timestamps: true
})

// Indexes for better performance
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1 })
UserSchema.index({ 'writerProfile.isVerified': 1 })
UserSchema.index({ 'writerProfile.availability': 1 })

// Instance methods
UserSchema.methods.toSafeObject = function() {
  const userObject = this.toObject()
  delete userObject.password
  return userObject
}

UserSchema.methods.isWriter = function() {
  return this.role === 'writer'
}

UserSchema.methods.isAdmin = function() {
  return this.role === 'admin'
}

UserSchema.methods.updateWriterStats = async function(projectCompleted = false) {
  if (this.role !== 'writer') return
  
  this.writerProfile.totalProjects += 1
  if (projectCompleted) {
    this.writerProfile.completedProjects += 1
  }
  
  return this.save()
}

// Static methods
UserSchema.statics.getAvailableWriters = function() {
  return this.find({ 
    role: 'writer',
    'writerProfile.availability': 'available',
    'writerProfile.isVerified': true
  }).sort({ 'writerProfile.rating': -1 })
}

UserSchema.statics.getWritersBySpecialization = function(specialization) {
  return this.find({
    role: 'writer',
    'writerProfile.specializations': specialization,
    'writerProfile.isVerified': true
  })
}

const User = mongoose.models.User || mongoose.model('User', UserSchema)
export default User