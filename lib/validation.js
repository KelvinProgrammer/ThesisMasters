// lib/validation.js - Updated validation utilities
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return {
      isValid: false,
      message: 'Name is required'
    }
  }

  const trimmedName = name.trim()

  if (trimmedName.length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long'
    }
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      message: 'Name must be less than 50 characters long'
    }
  }

  return {
    isValid: true,
    message: 'Name is valid'
  }
}

export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

export function validatePassword(password) {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    }
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    }
  }

  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password must be less than 128 characters long'
    }
  }

  // Simplified validation - just check length for now
  return { isValid: true, message: 'Password is valid' }
}

export function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = []

  // Validate name
  const nameValidation = validateName(name)
  if (!nameValidation.isValid) {
    errors.push(nameValidation.message)
  }

  // Validate email
  if (!validateEmail(email)) {
    errors.push('Please enter a valid email address')
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.message)
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    errors.push('Passwords do not match')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}