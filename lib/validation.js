// lib/validation.js (Simplified for testing)
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password) {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    }
  }

  // Simplified validation - just check length for now
  return { isValid: true, message: 'Password is valid' }
}

export function validateName(name) {
  if (!name || name.trim().length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long'
    }
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      message: 'Name must be less than 50 characters long'
    }
  }

  return { isValid: true, message: 'Name is valid' }
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