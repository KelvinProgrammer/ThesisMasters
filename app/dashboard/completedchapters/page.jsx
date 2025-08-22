// app/dashboard/completedchapters/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function CompletedChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('chapterNumber')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchCompletedChapters()
  }, [status, router])

  const fetchCompletedChapters = async () => {
    try {
      const response = await fetch('/api/chapters?status=completed')
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

  const handleExportChapter = async (chapterId) => {
    try {
      // This would implement chapter export functionality
      alert('Export functionality would be implemented here')
    } catch (err) {
      setError('Failed to export chapter')
    }
  }

  const handleDownloadPDF = async (chapterId) => {
    try {
      // This would implement PDF generation
      alert('PDF download functionality would be implemented here')
    } catch (err) {
      setError('Failed to generate PDF')
    }
  }

  const filteredChapters = chapters.filter(chapter =>
    chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chapter.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    switch (sortBy) {
      case 'chapterNumber':
        return a.chapterNumber - b.chapterNumber
      case 'title':
        return a.title.localeCompare(b.title)
      case 'wordCount':
        return b.wordCount - a.wordCount
      case 'updatedAt':
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      default:
        return 0
    }
  })

  const totalWords = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
  const averageWords = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Completed Chapters</h1>
            <p className="text-gray-600">Your finished thesis chapters ready for review</p>
          </div>
          
          {chapters.length > 0 && (
            <button
              onClick={() => alert('Bulk export functionality would be implemented here')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              Export All
            </button>
          )}
        </div>

        {chapters.length > 0 ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
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

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{totalWords.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Total Words</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{averageWords.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Avg. Words</p>
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
                    <p className="text-2xl font-bold text-gray-900">{Math.round(totalWords / 250)}</p>
                    <p className="text-gray-600 text-sm">Est. Hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Chapters
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, summary, or tags..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:w-48">
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="chapterNumber">Chapter Number</option>
                    <option value="title">Title</option>
                    <option value="wordCount">Word Count</option>
                    <option value="updatedAt">Last Modified</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Chapters List */}
            <div className="space-y-6">
              {sortedChapters.map((chapter) => (
                <div key={chapter._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
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

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                          </svg>
                          {chapter.wordCount.toLocaleString()} words
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          Completed: {new Date(chapter.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          ~{Math.round(chapter.wordCount / 250)} hours
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/dashboard/chapters/${chapter._id}/view`)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="View Chapter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDownloadPDF(chapter._id)}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title="Download PDF"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleExportChapter(chapter._id)}
                        className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                        title="Export Chapter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V3a1 1 0 011-1zM4 11a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zm0 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
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

                  {/* Feedback if available */}
                  {chapter.feedback && chapter.feedback.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Feedback:</h4>
                      <div className="text-sm text-gray-600">
                        <p>"{chapter.feedback[chapter.feedback.length - 1].comment}"</p>
                        <p className="text-xs text-gray-500 mt-1">
                          - {chapter.feedback[chapter.feedback.length - 1].reviewer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed chapters yet</h3>
            <p className="text-gray-500 mb-6">Complete your first chapter to see it here!</p>
            <button
              onClick={() => router.push('/dashboard/currentchapters')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Current Chapters
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}