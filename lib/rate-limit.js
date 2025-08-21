// lib/rate-limit.js
const rateLimitMap = new Map()

export function rateLimit({ windowMs = 60000, maxRequests = 5 } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, [])
    }

    const requests = rateLimitMap.get(ip)
    const validRequests = requests.filter(timestamp => timestamp > windowStart)

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }

    validRequests.push(now)
    rateLimitMap.set(ip, validRequests)

    // Clean up old entries periodically
    if (Math.random() < 0.01) {
      for (const [key, timestamps] of rateLimitMap.entries()) {
        const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart)
        if (validTimestamps.length === 0) {
          rateLimitMap.delete(key)
        } else {
          rateLimitMap.set(key, validTimestamps)
        }
      }
    }

    next()
  }
}