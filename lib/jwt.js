// lib/jwt.js
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || '6gi7GBydevorfOi'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const createTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role
  }
  
  const accessToken = signToken(payload)
  const refreshToken = signToken({ id: user._id }, { expiresIn: '30d' })
  
  return { accessToken, refreshToken }
}
