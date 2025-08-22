// app/dashboard/revisionchapters/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function RevisionChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchRevisionChapters()
  }, [status, router])

  const fetchRevisionChapters = async () => {
    try {
      const response = await fetch('/api/chapters?status=revision')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chapters')
      }

      setChapters(data.chapters)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (chapterId, newStatus) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update chapter')
      }

      // Refresh chapters list
      fetchRevisionChapters()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddFeedback = async (chapterId, feedback) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: [...(selectedChapter?.feedback || []), {
            reviewer: session?.user?.name || 'Self Review',
            comment: feedback.comment,
            rating: feedback.rating,
            createdAt: new Date()
          }]
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to add feedback')
      }

      setShowFeedbackModal(false)
      setSelectedChapter(null)
      fetchRevisionChapters()
    } catch (err) {
      setError(err.message)
    }
  }

  const getPriorityLevel = (chapter) => {
    const daysSinceUpdate = Math.floor((new Date() - new Date(chapter.updatedAt)) / (1000 * 60 * 60 * 24))
    
    if (chapter.deadline) {
      const daysUntilDeadline = Math.floor((new Date(chapter.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      if (daysUntilDeadline <= 3) return 'high'
      if (daysUntilDeadline <= 7) return 'medium'
    }
    
    if (daysSinceUpdate >= 7) return 'high'
    if (daysSinceUpdate >= 3) return 'medium'
    return 'low'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLatestFeedback = (chapter) => {
    if (!chapter.feedback || chapter.feedback.length === 0) return null
    return chapter.feedback[chapter.feedback.length - 1]
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapters Under Revision</h1>
          <p className="text-gray-600">Review feedback and make necessary improvements</p>
        </div>

        {/* Stats */}
        {chapters.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                  <p className="text-gray-600 text-sm">In Revision</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {chapters.filter(ch => getPriorityLevel(ch) === 'high').length}
                  </p>
                  <p className="text-gray-600 text-sm">High Priority</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {chapters.reduce((total, ch) => total + (ch.feedback?.length || 0), 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Total Feedback</p>
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
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(chapters.reduce((total, ch) => {
                      const days = Math.floor((new Date() - new Date(ch.updatedAt)) / (1000 * 60 * 60 * 24))
                      return total + days
                    }, 0) / chapters.length) || 0}
                  </p>
                  <p className="text-gray-600 text-sm">Avg. Days</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapters List */}
        {chapters.length > 0 ? (
          <div className="space-y-6">
            {chapters.map((chapter) => {
              const priority = getPriorityLevel(chapter)
              const latestFeedback = getLatestFeedback(chapter)
              
              return (
                <div key={chapter._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          Chapter {chapter.chapterNumber}: {chapter.title}
                        </h3>
                        
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(priority)}`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                        </span>
                        
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          Under Revision
                        </span>
                      </div>
                      
                      {chapter.summary && (
                        <p className="text-gray-600 mb-3">{chapter.summary}</p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                        <span>{chapter.wordCount.toLocaleString()} words</span>
                        {chapter.deadline && (
                          <span className={`${new Date(chapter.deadline) < new Date() ? 'text-red-600 font-medium' : ''}`}>
                            Due: {new Date(chapter.deadline).toLocaleDateString()}
                          </span>
                        )}
                        <span>Last updated: {new Date(chapter.updatedAt).toLocaleDateString()}</span>
                        {chapter.feedback && (
                          <span>{chapter.feedback.length} feedback(s)</span>
                        )}
                      </div>

                      {/* Latest Feedback */}
                      {latestFeedback && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-sm font-medium text-yellow-900">Latest Feedback</h4>
                                {latestFeedback.rating && (
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={`w-4 h-4 ${i < latestFeedback.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                      </svg>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-yellow-800">"{latestFeedback.comment}"</p>
                              <p className="text-xs text-yellow-600 mt-1">
                                - {latestFeedback.reviewer} • {new Date(latestFeedback.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {chapter.tags && chapter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/dashboard/chapters/${chapter._id}/edit`)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Edit Chapter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedChapter(chapter)
                          setShowFeedbackModal(true)
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                        title="Add Feedback"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      
                      <div className="relative group">
                        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                          </svg>
                        </button>
                        
                        <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleUpdateStatus(chapter._id, 'in_progress')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Resume Writing
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(chapter._id, 'completed')}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Mark as Completed
                            </button>
                            <button
                              onClick={() => router.push(`/dashboard/chapters/${chapter._id}/history`)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View History
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Revision Timeline */}
                  {chapter.revisions && chapter.revisions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Revision History</h4>
                      <div className="space-y-2">
                        {chapter.revisions.slice(-3).map((revision, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                            <span>Version {revision.version}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(revision.createdAt).toLocaleDateString()}</span>
                            {revision.changes && (
                              <>
                                <span className="mx-2">•</span>
                                <span className="text-gray-500">{revision.changes}</span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters under revision</h3>
            <p className="text-gray-500 mb-6">Great! You don't have any chapters that need revision right now.</p>
            <button
              onClick={() => router.push('/dashboard/currentchapters')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Current Chapters
            </button>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedChapter && (
          <FeedbackModal
            chapter={selectedChapter}
            onClose={() => {
              setShowFeedbackModal(false)
              setSelectedChapter(null)
            }}
            onSubmit={handleAddFeedback}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

// Feedback Modal Component
function FeedbackModal({ chapter, onClose, onSubmit }) {
  const [feedback, setFeedback] = useState({
    comment: '',
    rating: 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (feedback.comment.trim()) {
      onSubmit(chapter._id, feedback)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add Feedback</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter: {chapter.title}
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (Optional)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                    className={`w-8 h-8 ${feedback.rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments *
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Share your thoughts on this chapter..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Add Feedback
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}