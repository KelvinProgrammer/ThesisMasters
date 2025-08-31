// app/writer/dashboard/currentchapters/page.jsx - Writer Current Chapters
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterCurrentChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [chapters, setChapters] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('current')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showContentModal, setShowContentModal] = useState(false)
  const [contentForm, setContentForm] = useState({ content: '', notes: '', changes: '' })
  const [updating, setUpdating] = useState(false)

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

    fetchChapters()
  }, [status, session, router, filterStatus])

  const fetchChapters = async () => {
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        limit: '50',
        sortBy: 'updatedAt',
        sortOrder: 'desc'
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

  const handleAcceptChapter = async (chapterId) => {
    try {
      setUpdating(true)
      const response = await fetch('/api/writer/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          action: 'accept'
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Chapter accepted successfully!')
      fetchChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleStatusChange = async (chapterId, newStatus) => {
    try {
      setUpdating(true)
      const response = await fetch('/api/writer/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          action: 'update_status',
          data: { status: newStatus }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess(`Chapter marked as ${newStatus.replace('_', ' ')}!`)
      fetchChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleContentSubmit = async (e) => {
    e.preventDefault()
    try {
      setUpdating(true)
      const response = await fetch('/api/writer/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: selectedChapter._id,
          action: 'add_content',
          data: contentForm
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Content updated successfully!')
      setShowContentModal(false)
      setContentForm({ content: '', notes: '', changes: '' })
      fetchChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const openContentModal = (chapter) => {
    setSelectedChapter(chapter)
    setContentForm({
      content: chapter.content || '',
      notes: chapter.notes || '',
      changes: ''
    })
    setShowContentModal(true)
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      revision: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
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

  return (
    <WriterDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Current Chapters</h1>
          <p className="text-gray-600 mt-1">Manage your writing assignments</p>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                <p className="text-gray-600 text-sm">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.inProgress || 0}</p>
                <p className="text-gray-600 text-sm">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.completed || 0}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(statistics.totalEarnings || 0)}</p>
                <p className="text-gray-600 text-sm">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="current">Current Projects</option>
              <option value="available">Available Projects</option>
              <option value="in_progress">In Progress</option>
              <option value="revision">Needs Revision</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Chapters List */}
        {chapters.length > 0 ? (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(chapter.status)}`}>
                        {chapter.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    {chapter.summary && (
                      <p className="text-gray-600 mb-3">{chapter.summary}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Student:</span> {chapter.user?.name}
                      </div>
                      <div>
                        <span className="font-medium">Words:</span> {chapter.wordCount || 0} / {chapter.targetWordCount}
                      </div>
                      <div>
                        <span className="font-medium">Earnings:</span> {formatCurrency(chapter.earnings || 0)}
                      </div>
                      <div>
                        <span className="font-medium">Deadline:</span> {chapter.deadline ? new Date(chapter.deadline).toLocaleDateString() : 'No deadline'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {filterStatus === 'available' && !chapter.writerId ? (
                      <button
                        onClick={() => handleAcceptChapter(chapter._id)}
                        disabled={updating}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        Accept Project
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => openContentModal(chapter)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Edit Content
                        </button>
                        
                        {chapter.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusChange(chapter._id, 'completed')}
                            disabled={updating}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Mark Complete
                          </button>
                        )}
                        
                        {chapter.status === 'completed' && (
                          <button
                            onClick={() => handleStatusChange(chapter._id, 'revision')}
                            disabled={updating}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                          >
                            Request Revision
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {chapter.targetWordCount > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Writing Progress</span>
                      <span>{Math.round(((chapter.wordCount || 0) / chapter.targetWordCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(((chapter.wordCount || 0) / chapter.targetWordCount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                {chapter.content && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Content Preview:</h4>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {chapter.content.substring(0, 200)}...
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'available' ? 'No available projects' : 'No projects found'}
            </h3>
            <p className="text-gray-500">
              {filterStatus === 'available' 
                ? 'Check back later for new writing opportunities.' 
                : `No ${filterStatus.replace('_', ' ')} projects at the moment.`
              }
            </p>
          </div>
        )}

        {/* Content Modal */}
        {showContentModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Content: {selectedChapter.title}
                  </h2>
                  <button
                    onClick={() => setShowContentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleContentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      value={contentForm.content}
                      onChange={(e) => setContentForm({...contentForm, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={20}
                      placeholder="Write your chapter content here..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Words: {contentForm.content.split(/\s+/).filter(word => word.length > 0).length}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (for student)
                    </label>
                    <textarea
                      value={contentForm.notes}
                      onChange={(e) => setContentForm({...contentForm, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Add any notes for the student..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summary of Changes
                    </label>
                    <input
                      type="text"
                      value={contentForm.changes}
                      onChange={(e) => setContentForm({...contentForm, changes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of what you changed..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Saving...' : 'Save Content'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContentModal(false)}
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