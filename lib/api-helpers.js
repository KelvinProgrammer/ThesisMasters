// lib/api-helpers.js
export function createApiHandler(handlers) {
  return async (req, res) => {
    const method = req.method
    const handler = handlers[method]

    if (!handler) {
      res.setHeader('Allow', Object.keys(handlers))
      return res.status(405).json({ message: `Method ${method} not allowed` })
    }

    try {
      await handler(req, res)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error.name === 'ValidationError') {
        return res.status(400).json({ 
          message: 'Validation error', 
          details: error.message 
        })
      }

      if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' })
      }

      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export function validateRequiredFields(fields, data) {
  const missing = fields.filter(field => !data[field])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}