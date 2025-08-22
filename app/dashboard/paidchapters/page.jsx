// app/dashboard/paidchapters/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function PaidChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all') // all, completed, processing

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchPaidChapters()
  }, [status, router])

  const fetchPaidChapters = async () => {
    try {
      // Fetch chapters with payment information
      const chaptersResponse = await fetch('/api/chapters')
      const chaptersData = await chaptersResponse.json()

      if (!chaptersResponse.ok) {
        throw new Error(chaptersData.message || 'Failed to fetch chapters')
      }

      // Filter chapters that have payments
      const paidChapters = chaptersData.chapters.filter(chapter => chapter.isPaid || chapter.paymentId)

      // Fetch payment details
      const paymentsResponse = await fetch('/api/payments')
      const paymentsData = await paymentsResponse.json()

      if (paymentsResponse.ok) {
        setPayments(paymentsData.payments)
      }

      setChapters(paidChapters)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInitiatePayment = async (chapterId, amount = 50) => {
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chapterId,
          amount,
          currency: 'USD',
          paymentMethod: 'credit_card',
          description: `Payment for Chapter ${chapters.find(ch => ch._id === chapterId)?.chapterNumber}`,
          type: 'chapter_payment'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to initiate payment')
      }

      // Redirect to payment page
      router.push(data.paymentUrl)
    } catch (err) {
      setError(err.message)
    }
  }

  const getPaymentForChapter = (chapterId) => {
    return payments.find(payment => payment.chapterId?._id === chapterId)
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
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredChapters = chapters.filter(chapter => {
    if (filter === 'all') return true
    const payment = getPaymentForChapter(chapter._id)
    if (filter === 'completed') return payment?.status === 'completed'
    if (filter === 'processing') return ['pending', 'processing'].includes(payment?.status)
    return true
  })

  const totalPaid = payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0)

  const pendingPayments = payments
    .filter(payment => ['pending', 'processing'].includes(payment.status))
    .reduce((sum, payment) => sum + payment.amount, 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paid Chapters</h1>
            <p className="text-gray-600">Manage chapter payments and access premium features</p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/billing')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
            View All Payments
          </button>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 6h16v6H4v-6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
                <p className="text-gray-600 text-sm">Total Paid</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingPayments)}</p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                <p className="text-gray-600 text-sm">Paid Chapters</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => p.status === 'completed').length}
                </p>
                <p className="text-gray-600 text-sm">Transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'all', label: 'All Chapters', count: chapters.length },
                { id: 'completed', label: 'Completed Payments', count: payments.filter(p => p.status === 'completed').length },
                { id: 'processing', label: 'Processing', count: payments.filter(p => ['pending', 'processing'].includes(p.status)).length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-1 px-2 rounded-full text-xs ${
                      filter === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Chapters List */}
        {filteredChapters.length > 0 ? (
          <div className="space-y-6">
            {filteredChapters.map((chapter) => {
              const payment = getPaymentForChapter(chapter._id)
              
              return (
                <div key={chapter._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        
                        {payment && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        )}

                        {chapter.isPaid && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            Paid
                          </span>
                        )}
                      </div>
                      
                      {chapter.summary && (
                        <p className="text-gray-600 mb-3">{chapter.summary}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>{chapter.wordCount.toLocaleString()} words</span>
                        <span>Status: {chapter.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        {payment && (
                          <>
                            <span>Amount: {formatCurrency(payment.amount, payment.currency)}</span>
                            <span>Date: {new Date(payment.createdAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {payment && (
                        <button
                          onClick={() => router.push(`/dashboard/payment/${payment._id}`)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="View Payment Details"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => router.push(`/dashboard/chapters/${chapter._id}/view`)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="View Chapter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                        </svg>
                      </button>

                      {(!payment || payment.status === 'failed') && (
                        <button
                          onClick={() => handleInitiatePayment(chapter._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Payment Details */}
                  {payment && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Transaction ID:</span>
                          <p className="text-gray-600">{payment.transactionId || 'Pending'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Payment Method:</span>
                          <p className="text-gray-600 capitalize">{payment.paymentMethod.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Description:</span>
                          <p className="text-gray-600">{payment.description}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Last Updated:</span>
                          <p className="text-gray-600">{new Date(payment.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {payment.failureReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-800">
                            <strong>Payment Failed:</strong> {payment.failureReason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Premium Features Available */}
                  {chapter.isPaid && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Available Premium Features:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          AI Writing Assistant
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Grammar Check
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          Citation Generator
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          PDF Export
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No paid chapters yet' : 
               filter === 'completed' ? 'No completed payments' : 
               'No processing payments'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Upgrade your chapters to access premium features'
                : filter === 'completed'
                ? 'Complete a payment to see it here'
                : 'No payments are currently being processed'
              }
            </p>
            <button
              onClick={() => router.push('/dashboard/currentchapters')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Chapters
            </button>
          </div>
        )}

        {/* Pricing Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Unlock Premium Features</h2>
            <p className="text-blue-100 mb-6">
              Pay per chapter to access advanced AI writing tools, grammar checking, citation generation, and more.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Basic Chapter</h3>
                <p className="text-2xl font-bold mb-2">$25</p>
                <p className="text-blue-100">Standard writing tools and basic export</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Premium Chapter</h3>
                <p className="text-2xl font-bold mb-2">$50</p>
                <p className="text-blue-100">AI assistance, grammar check, citations</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Pro Chapter</h3>
                <p className="text-2xl font-bold mb-2">$75</p>
                <p className="text-blue-100">All features + priority support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}