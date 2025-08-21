// lib/security.js
import crypto from 'crypto'

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function verifyCSRF(req) {
  const token = req.headers['x-csrf-token'] || req.body.csrfToken
  const sessionToken = req.session?.csrfToken
  
  if (!token || !sessionToken || token !== sessionToken) {
    throw new Error('Invalid CSRF token')
  }
}