// app/writer/dashboard/completed/page.jsx - Writer Completed Chapters
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterCompletedChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [chapters, setChapters] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [sortBy, setSortBy] = useState('completedAt')
  const [sortOrder, setSortOrder] = useState('desc')

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

    fetchCompletedChapters()
  }, [status, session, router, sortBy, sortOrder])

  const fetchCompletedChapters = async () => {
    try {
      const params = new URLSearchParams({
        status: 'completed',
        limit: '100',
        sortBy,
        sortOrder
      })

      const response = await fetch(`/api/writer/chapters?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chapters')
      }

      setChapters(data.chapters || [])
      setStatistics(data.statistics || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDetailsModal = (chapter) => {
    setSelectedChapter(chapter)
    setShowDetailsModal(true)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const calculateCompletionTime = (createdAt, completedAt) => {
    if (!createdAt || !completedAt) return 'Unknown'
    
    const start = new Date(createdAt)
    const end = new Date(completedAt)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day'
    if (diffDays < 7) return `${diffDays} days`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
    return `${Math.floor(diffDays / 30)} months`
  }

  const getTotalStats = () => {
    return chapters.reduce((acc, chapter) => ({
      totalWords: acc.totalWords + (chapter.wordCount || 0),
      totalEarnings: acc.totalEarnings + (chapter.earnings || 0),
      totalPages: acc.totalPages + (chapter.estimatedPages || 0)
    }), { totalWords: 0, totalEarnings: 0, totalPages: 0 })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
      </div>
    )
  }

  const totalStats = getTotalStats()

  return (
    <WriterDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Completed Chapters</h1>
          <p className="text-gray-600 mt-1">Your finished writing projects and achievements</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                    <p className="text-gray-600 text-sm">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalWords.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Total Words</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2v1a2 2 0 01-2-2V5zM14 5a2 2 0 012 2v6a2 2 0 01-2 2v1a2 2 0 002-2V7a2 2 0 00-2-2v1zm-1-1V3a1 1 0 10-2 0v1h2z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalStats.totalPages}</p>
                    <p className="text-gray-600 text-sm">Total Pages</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalEarnings)}</p>
                    <p className="text-gray-600 text-sm">Total Earned</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sorting */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="completedAt">Completion Date</option>
                    <option value="chapterNumber">Chapter Number</option>
                    <option value="title">Title</option>
                    <option value="wordCount">Word Count</option>
                    <option value="earnings">Earnings</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-6">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      </div>
                      
                      {chapter.summary && (
                        <p className="text-gray-600 mb-3">{chapter.summary}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-gray-700">Student:</span>
                          <p className="text-gray-900">{chapter.user?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Words Written:</span>
                          <p className="text-gray-900">{chapter.wordCount?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Earnings:</span>
                          <p className="text-gray-900 font-semibold">{formatCurrency(chapter.earnings || 0)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Completion Time:</span>
                          <p className="text-gray-900">{calculateCompletionTime(chapter.createdAt, chapter.completedAt)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          Completed: {chapter.completedAt ? new Date(chapter.completedAt).toLocaleDateString() : 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2v1a2 2 0 01-2-2V5zM14 5a2 2 0 012 2v6a2 2 0 01-2 2v1a2 2 0 002-2V7a2 2 0 00-2-2v1zm-1-1V3a1 1 0 10-2 0v1h2z" clipRule="evenodd"/>
                          </svg>
                          {chapter.estimatedPages || Math.ceil((chapter.wordCount || 0) / 250)} pages
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          ~{Math.round((chapter.wordCount || 0) / 250)} hours
                        </span>
                        {chapter.level && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.75 2.524z"/>
                            </svg>
                            {chapter.level.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => openDetailsModal(chapter)}
                        className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {chapter.tags && chapter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {chapter.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quality Score (if available) */}
                  {chapter.qualityScore && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          Quality Score: {chapter.qualityScore}/5
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed chapters yet</h3>
            <p className="text-gray-500 mb-4">Complete your first chapter to see it here!</p>
            <button
              onClick={() => router.push('/writer/dashboard/currentchapters')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Current Projects
            </button>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Chapter Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h3>
                    {selectedChapter.summary && (
                      <p className="text-gray-600">{selectedChapter.summary}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Project Details</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Student:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.user?.name || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Level:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.level?.toUpperCase()}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Type:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.workType?.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Urgency:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.urgency?.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Completion Stats</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Words Written:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.wordCount?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Pages:</span>
                          <span className="ml-2 text-gray-900">{selectedChapter.estimatedPages || Math.ceil((selectedChapter.wordCount || 0) / 250)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Earnings:</span>
                          <span className="ml-2 text-gray-900 font-semibold">{formatCurrency(selectedChapter.earnings || 0)}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Completed:</span>
                          <span className="ml-2 text-gray-900">
                            {selectedChapter.completedAt ? new Date(selectedChapter.completedAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedChapter.content && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Content Preview</h4>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {selectedChapter.content.substring(0, 500)}
                          {selectedChapter.content.length > 500 && '...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {selectedChapter.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800">{selectedChapter.notes}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </WriterDashboardLayout>
  )
}