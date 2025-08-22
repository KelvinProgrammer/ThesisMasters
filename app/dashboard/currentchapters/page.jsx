// app/dashboard/currentchapters/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function CurrentChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchChapters()
  }, [status, router])

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters?status=draft,in_progress')
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
      fetchChapters()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete chapter')
      }

      // Refresh chapters list
      fetchChapters()
    } catch (err) {
      setError(err.message)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'revision':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (chapter) => {
    if (!chapter.targetWordCount) return 0
    return Math.min((chapter.wordCount / chapter.targetWordCount) * 100, 100)
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Current Chapters</h1>
            <p className="text-gray-600">Manage your chapters in progress</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/addchapter')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add Chapter
          </button>
        </div>

        {/* Chapters List */}
        {chapters.length > 0 ? (
          <div className="space-y-6">
            {chapters.map((chapter) => (
              <div key={chapter._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
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

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span>{chapter.wordCount} / {chapter.targetWordCount} words</span>
                      {chapter.deadline && (
                        <span>Due: {new Date(chapter.deadline).toLocaleDateString()}</span>
                      )}
                      <span>Updated: {new Date(chapter.updatedAt).toLocaleDateString()}</span>
                    </div>
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
                    
                    <div className="relative group">
                      <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                        </svg>
                      </button>
                      
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <div className="py-1">
                          <button
                            onClick={() => handleUpdateStatus(chapter._id, 'completed')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(chapter._id, 'revision')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Send for Revision
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(chapter._id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete Chapter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getProgressPercentage(chapter))}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(chapter)}%` }}
                    ></div>
                  </div>
                </div>

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
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No current chapters</h3>
            <p className="text-gray-500 mb-6">You don't have any chapters in progress. Start writing your first chapter!</p>
            <button
              onClick={() => router.push('/dashboard/addchapter')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Your First Chapter
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}