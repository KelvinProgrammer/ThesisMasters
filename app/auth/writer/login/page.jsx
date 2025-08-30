// app/writer/login/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function WriterLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    getSession().then((session) => {
      if (session?.user?.role === 'writer') {
        router.push('/writer/dashboard')
      } else if (session) {
        // User is logged in but not a writer
        router.push('/dashboard/overview')
      }
    })
  }, [router])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 Attempting writer login for:', formData.email)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: 'writer', // Specify role for validation
        redirect: false
      })

      console.log('📋 Writer login result:', result)

      if (result?.error) {
        console.log('❌ Writer login failed:', result.error)
        setError(result.error)
      } else {
        console.log('✅ Writer login successful, redirecting...')
        // Redirect with role parameter
        window.location.href = '/writer/dashboard'
      }
    } catch (error) {
      console.error('💥 Writer login exception:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Check if error is about email verification
  const isEmailVerificationError = error.toLowerCase().includes('verify your email')
  const isVerificationPendingError = error.toLowerCase().includes('pending admin verification')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">ThesisMaster</span>
          </Link>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Writer Portal</h1>
            <p className="text-gray-600">Sign in to your writer account</p>
          </div>

          {error && (
            <div className={`mb-6 p-4 ${
              isEmailVerificationError ? 'bg-orange-50 border-orange-200' : 
              isVerificationPendingError ? 'bg-blue-50 border-blue-200' :
              'bg-red-50 border-red-200'
            } border rounded-lg`}>
              <div className="flex items-start">
                <svg className={`w-5 h-5 ${
                  isEmailVerificationError ? 'text-orange-500' : 
                  isVerificationPendingError ? 'text-blue-500' :
                  'text-red-500'
                } mr-2 mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  {isEmailVerificationError || isVerificationPendingError ? (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  )}
                </svg>
                <div className="flex-1">
                  <span className={`${
                    isEmailVerificationError ? 'text-orange-800' : 
                    isVerificationPendingError ? 'text-blue-800' :
                    'text-red-800'
                  } text-sm`}>{error}</span>
                  {isEmailVerificationError && (
                    <p className="text-orange-700 text-xs mt-1">
                      Check your email inbox for the verification link.
                    </p>
                  )}
                  {isVerificationPendingError && (
                    <p className="text-blue-700 text-xs mt-1">
                      Please wait for admin approval. You'll receive an email notification once approved.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors"
                placeholder="your.email@domain.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m6.075-6.075L21 3" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-500">
                Forgot your password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in to Writer Portal'
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Writer Benefits:</h3>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Earn money helping students with their academic work</li>
              <li>• Flexible working hours and projects</li>
              <li>• Build your reputation with ratings and reviews</li>
              <li>• Access to quality assurance tools and resources</li>
            </ul>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have a writer account?{' '}
            <Link href="/writer/register" className="text-green-600 hover:text-green-500 font-medium">
              Apply to become a writer
            </Link>
          </p>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 text-sm">
              Student login instead?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}