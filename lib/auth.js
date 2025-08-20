// lib/auth.js
import { verifyToken } from './jwt'
import connectDB from './mongodb'
import User from '../models/User'

export const auth = async (req) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('No token provided')
    }
    
    const decoded = verifyToken(token)
    
    await connectDB()
    const user = await User.findById(decoded.id)
    
    if (!user) {
      throw new Error('User not found')
    }
    
    return user
  } catch (error) {
    throw new Error('Unauthorized')
  }
}

// Middleware to protect routes
export const protect = (handler) => {
  return async (req, res) => {
    try {
      const user = await auth(req)
      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      })
    }
  }
}
