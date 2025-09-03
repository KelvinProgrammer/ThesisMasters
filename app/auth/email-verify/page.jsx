// app/auth/email-verify/page.jsx 
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Create a separate component for the verification logic
function EmailVerificationContent() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      verifyEmail(tokenParam)
    } else {
      setError('Invalid verification link')
      setLoading(false)
    }
  }, [searchParams])

  const verifyEmail = async (verificationToken) => {
    try {
      console.log('🔍 Starting email verification for token:', verificationToken.substring(0, 10) + '...')
      
      const response = await fetch(`/api/auth/email-verify?token=${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📋 Verification response status:', response.status)
      const data = await response.json()
      console.log('📦 Verification response data:', data)

      if (response.ok) {
        console.log('✅ Email verification successful')
        setSuccess(true)
      } else {
        console.log('❌ Email verification failed:', data.message)
        setError(data.message || 'Verification failed')
      }
    } catch (error) {
      console.error('💥 Verification error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email...</h1>
          <p className="text-gray-600">Please wait while we verify your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mr-3">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">ThesisMaster</span>
          </Link>
        </div>

        {/* Verification Result */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Email verified!</h1>
              <p className="text-gray-600 mb-6">
                Great! Your email has been successfully verified. You can now sign in to your account.
              </p>
              <Link
                href="/auth/login"
                className="inline-block bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Sign in to your account
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification failed</h1>
              <p className="text-gray-600 mb-6">
                {error || 'This verification link is invalid or has expired.'}
              </p>
              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="block bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Try registering again
                </Link>
                <Link
                  href="/auth/login"
                  className="block text-blue-600 hover:text-blue-500 font-medium"
                >
                  Already have a verified account? Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
        <p className="text-gray-600">Please wait while we load the verification page.</p>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function EmailVerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EmailVerificationContent />
    </Suspense>
  )
}