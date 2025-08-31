// app/writer/dashboard/paidchapters/page.jsx - Writer Paid Chapters
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterPaidChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [chapters, setChapters] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    phoneNumber: '',
    selectedChapters: []
  })
  const [processingPayout, setProcessingPayout] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/writer/login')
      return
    }
    if (session?.user?.role !== 'writer') {
      router.push('/dashboard')
      return
    }

    fetchPaidChapters()
  }, [status, session, router])

  const fetchPaidChapters = async () => {
    try {
      const response = await fetch('/api/writer/payments')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch paid chapters')
      }

      setChapters(data.chapters || [])
      setStatistics(data.statistics || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async (e) => {
    e.preventDefault()
    try {
      setProcessingPayout(true)
      
      const payoutData = {
        amount: parseFloat(payoutForm.amount),
        paymentMethod: 'mpesa',
        accountDetails: {
          phoneNumber: payoutForm.phoneNumber
        },
        chapterIds: payoutForm.selectedChapters
      }

      const response = await fetch('/api/writer/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payoutData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess(`Payout request for ${formatCurrency(payoutForm.amount)} submitted successfully!`)
      setShowPayoutModal(false)
      setPayoutForm({ amount: '', phoneNumber: '', selectedChapters: [] })
      fetchPaidChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessingPayout(false)
    }
  }

  const handleSelectChapter = (chapterId, earnings) => {
    const isSelected = payoutForm.selectedChapters.includes(chapterId)
    
    if (isSelected) {
      setPayoutForm({
        ...payoutForm,
        selectedChapters: payoutForm.selectedChapters.filter(id => id !== chapterId),
        amount: (parseFloat(payoutForm.amount || 0) - earnings).toString()
      })
    } else {
      setPayoutForm({
        ...payoutForm,
        selectedChapters: [...payoutForm.selectedChapters, chapterId],
        amount: (parseFloat(payoutForm.amount || 0) + earnings).toString()
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const getTotalEarnings = () => {
    return chapters.reduce((total, chapter) => total + (chapter.writerEarnings || 0), 0)
  }

  if (loading) {
    return (
      <WriterDashboardLayout>
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
      </WriterDashboardLayout>
    )
  }

  return (
    <WriterDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Paid Chapters</h1>
              <p className="text-gray-600 mt-1">Track your earnings and request payouts</p>
            </div>
            {chapters.length > 0 && (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Request Payout
              </button>
            )}
          </div>
        </div>

        {/* Alerts */}
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

        {chapters.length > 0 ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalEarnings())}</p>
                    <p className="text-gray-600 text-sm">Total Earnings</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                    <p className="text-gray-600 text-sm">Chapters Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zM8 6v1h4V6a2 2 0 10-4 0zm5 3a1 1 0 11-2 0 1 1 0 012 0zm-7 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(getTotalEarnings() * 0.3)}</p>
                    <p className="text-gray-600 text-sm">Available for Payout</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Completed Chapters</h2>
                <p className="text-gray-600 text-sm mt-1">Chapters you've completed and earned from</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allIds = chapters.map(c => c._id)
                              const totalAmount = chapters.reduce((sum, c) => sum + (c.writerEarnings || 0), 0)
                              setPayoutForm({
                                ...payoutForm,
                                selectedChapters: allIds,
                                amount: totalAmount.toString()
                              })
                            } else {
                              setPayoutForm({
                                ...payoutForm,
                                selectedChapters: [],
                                amount: ''
                              })
                            }
                          }}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chapter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Words
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chapters.map((chapter) => (
                      <tr key={chapter._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={payoutForm.selectedChapters.includes(chapter._id)}
                            onChange={() => handleSelectChapter(chapter._id, chapter.writerEarnings || 0)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Chapter {chapter.chapterNumber}: {chapter.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {chapter.level?.toUpperCase()} • {chapter.workType?.replace('_', ' ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{chapter.user?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{chapter.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {chapter.completedAt ? new Date(chapter.completedAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{chapter.wordCount?.toLocaleString() || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(chapter.writerEarnings || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            chapter.isPaidOut ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {chapter.isPaidOut ? 'Paid Out' : 'Available'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No paid chapters yet</h3>
            <p className="text-gray-500 mb-4">Complete and get paid for your first chapter to see earnings here!</p>
            <button
              onClick={() => router.push('/writer/dashboard/currentchapters')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              View Current Projects
            </button>
          </div>
        )}

        {/* Payout Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Request Payout</h2>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payout Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={payoutForm.amount}
                      onChange={(e) => setPayoutForm({...payoutForm, amount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: {formatCurrency(getTotalEarnings())}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={payoutForm.phoneNumber}
                      onChange={(e) => setPayoutForm({...payoutForm, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      placeholder="254712345678"
                      required
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected {payoutForm.selectedChapters.length} chapters
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Payment will be processed within 1-3 business days
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={processingPayout || !payoutForm.amount || !payoutForm.phoneNumber}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processingPayout ? 'Processing...' : 'Request Payout'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPayoutModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </WriterDashboardLayout>
  )
}