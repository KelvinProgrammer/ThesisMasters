// app/dashboard/payment/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function PaymentDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchPaymentDetails()
  }, [status, router, params.id])

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment details')
      }

      setPayment(data.payment)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCompletePayment = async () => {
    setProcessing(true)
    setError('')
    setSuccess('')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      const response = await fetch(`/api/payments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          transactionId: `TXN_${Date.now()}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete payment')
      }

      setSuccess('Payment completed successfully!')
      fetchPaymentDetails()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleCancelPayment = async () => {
    if (!confirm('Are you sure you want to cancel this payment?')) {
      return
    }

    try {
      const response = await fetch(`/api/payments/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'failed',
          failureReason: 'Cancelled by user'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel payment')
      }

      setSuccess('Payment cancelled successfully!')
      fetchPaymentDetails()
    } catch (err) {
      setError(err.message)
    }
  }

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
          </svg>
        )
      case 'processing':
        return (
          <svg className="w-6 h-6 text-blue-600 animate-spin" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
          </svg>
        )
      case 'failed':
        return (
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!payment) {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Payment not found</h3>
            <p className="text-gray-500 mb-6">The payment you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => router.push('/dashboard/billing')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Billing
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
            className="mb-6"
          />
        )}

        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Details</h1>
            <p className="text-gray-600">Transaction ID: {payment.transactionId || payment._id}</p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Back to Billing
          </button>
        </div>

        {/* Payment Status Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {getStatusIcon(payment.status)}
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(payment.amount, payment.currency)}
                </h2>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
              </div>
            </div>

            {payment.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={handleCompletePayment}
                  disabled={processing}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Complete Payment'
                  )}
                </button>
                <button
                  onClick={handleCancelPayment}
                  disabled={processing}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel Payment
                </button>
              </div>
            )}
          </div>

          {/* Payment Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="mt-1 text-gray-900">{payment.description}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Payment Method</span>
              <p className="mt-1 text-gray-900 capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Type</span>
              <p className="mt-1 text-gray-900 capitalize">{payment.type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Currency</span>
              <p className="mt-1 text-gray-900">{payment.currency}</p>
            </div>
          </div>
        </div>

        {/* Chapter Information */}
        {payment.chapterId && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chapter Information</h3>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-xl font-medium text-gray-900">
                  Chapter {payment.chapterId.chapterNumber}: {payment.chapterId.title}
                </h4>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                  <span>Word Count: {payment.chapterId.wordCount?.toLocaleString() || 'N/A'}</span>
                  <span>Status: {payment.chapterId.status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}</span>
                </div>
              </div>
              <button
                onClick={() => router.push(`/dashboard/chapters/${payment.chapterId._id}/view`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                View Chapter
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment Created</p>
                <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {payment.status === 'completed' && payment.transactionId && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment Completed</p>
                  <p className="text-xs text-gray-500">{new Date(payment.updatedAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Transaction ID: {payment.transactionId}</p>
                </div>
              </div>
            )}

            {payment.status === 'failed' && payment.failureReason && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment Failed</p>
                  <p className="text-xs text-gray-500">{new Date(payment.updatedAt).toLocaleString()}</p>
                  <p className="text-xs text-red-600">Reason: {payment.failureReason}</p>
                </div>
              </div>
            )}

            {payment.status === 'refunded' && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment Refunded</p>
                  <p className="text-xs text-gray-500">{new Date(payment.updatedAt).toLocaleString()}</p>
                  {payment.refundAmount && (
                    <p className="text-xs text-gray-600">
                      Refund Amount: {formatCurrency(payment.refundAmount, payment.currency)}
                    </p>
                  )}
                  {payment.refundReason && (
                    <p className="text-xs text-gray-600">Reason: {payment.refundReason}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Instructions */}
        {payment.status === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Instructions</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <p><strong>Step 1:</strong> Review the payment details above</p>
              <p><strong>Step 2:</strong> Click "Complete Payment" to proceed with the transaction</p>
              <p><strong>Step 3:</strong> You will be redirected to our secure payment processor</p>
              <p><strong>Step 4:</strong> Complete the payment using your preferred method</p>
              <p><strong>Step 5:</strong> Return to this page to see your payment confirmation</p>
            </div>

            <div className="mt-4 p-3 bg-blue-100 rounded">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a demo environment. The payment will be automatically processed when you click "Complete Payment".
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        {payment.metadata && Object.keys(payment.metadata).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-2">
              {Object.entries(payment.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 capitalize">{key.replace('_', ' ')}:</span>
                  <span className="text-sm text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}