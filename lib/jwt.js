// lib/jwt.js (Enhanced version)
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || '6gi7GBydevorfOi'

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable')
}

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export function generateResetToken() {
  const payload = {
    type: 'password_reset',
    timestamp: Date.now()
  }
  return signToken(payload, '1h')
}

export function generateVerificationToken() {
  const payload = {
    type: 'email_verification',
    timestamp: Date.now()
  }
  return signToken(payload, '24h')
}
