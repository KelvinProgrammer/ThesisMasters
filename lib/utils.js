// lib/utils.js
export function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',').shift() || 
         req.socket?.remoteAddress ||
         req.connection?.remoteAddress ||
         req.headers['x-real-ip'] ||
         'unknown'
}

export function parseUserAgent(userAgent) {
  // Simple user agent parsing - in production, consider using a library like 'ua-parser-js'
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)
  const isTablet = /iPad|Tablet/i.test(userAgent)
  
  let device = 'desktop'
  if (isTablet) device = 'tablet'
  else if (isMobile) device = 'mobile'

  const browser = {
    name: 'unknown',
    version: 'unknown'
  }

  if (userAgent.includes('Chrome')) {
    browser.name = 'Chrome'
    const match = userAgent.match(/Chrome\/(\d+)/)
    if (match) browser.version = match[1]
  } else if (userAgent.includes('Firefox')) {
    browser.name = 'Firefox'
    const match = userAgent.match(/Firefox\/(\d+)/)
    if (match) browser.version = match[1]
  } else if (userAgent.includes('Safari')) {
    browser.name = 'Safari'
    const match = userAgent.match(/Version\/(\d+)/)
    if (match) browser.version = match[1]
  }

  return { device, browser }
}

export function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date))
}

export function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength).trim() + '...'
}