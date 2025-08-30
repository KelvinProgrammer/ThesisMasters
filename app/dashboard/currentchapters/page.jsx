// app/dashboard/currentchapters/page.jsx - FULL FEATURED VERSION
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function CurrentChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  // State management
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('chapterNumber')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [uploadingFile, setUploadingFile] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)

  // Fetch chapters on component mount
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    fetchChapters()
  }, [status, router])

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const fetchChapters = async () => {
    try {
      const response = await fetch('/api/chapters?status=draft,in_progress,revision')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chapters')
      }

      setChapters(data.chapters || [])
    } catch (err) {
      setError(err.message)
      setChapters([])
    } finally {
      setLoading(false)
    }
  }

  // CRUD Operations
  const handleUpdateChapter = async (chapterId, updates) => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Chapter updated successfully!')
      fetchChapters()
      setShowEditModal(false)
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

      setSuccess('Chapter deleted successfully!')
      fetchChapters()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleStatusChange = async (chapterId, newStatus) => {
    await handleUpdateChapter(chapterId, { status: newStatus })
  }

  // File Upload
  const handleFileUpload = async (chapterId) => {
    const file = fileInputRef.current?.files[0]
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    // Validate file type and size
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt']
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      setError('Please upload a PDF, DOC, DOCX, or TXT file')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB')
      return
    }

    setUploadingFile(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chapterId', chapterId)

      const response = await fetch('/api/chapters/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess(`File uploaded successfully: ${file.name}`)
      fetchChapters()
      fileInputRef.current.value = '' // Clear input
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  // Payment Processing
  const handlePayment = async (chapter) => {
    setProcessingPayment(true)
    
    try {
      // Mock payment processing - replace with actual payment integration
      const paymentData = {
        chapterId: chapter._id,
        amount: chapter.estimatedCost || 0,
        currency: 'KSH',
        description: `Payment for Chapter ${chapter.chapterNumber}: ${chapter.title}`
      }

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess(`Payment of KSH ${chapter.estimatedCost?.toLocaleString()} processed successfully!`)
      await handleUpdateChapter(chapter._id, { isPaid: true, status: 'in_progress' })
      setShowPaymentModal(false)
    } catch (err) {
      setError(err.message || 'Payment processing failed')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Modal handlers
  const openEditModal = (chapter) => {
    setSelectedChapter(chapter)
    setEditFormData({
      title: chapter.title,
      summary: chapter.summary || '',
      targetWordCount: chapter.targetWordCount,
      deadline: chapter.deadline ? new Date(chapter.deadline).toISOString().split('T')[0] : '',
      tags: chapter.tags?.join(', ') || '',
      level: chapter.level || 'masters',
      workType: chapter.workType || 'coursework',
      urgency: chapter.urgency || 'normal'
    })
    setShowEditModal(true)
  }

  const openPaymentModal = (chapter) => {
    setSelectedChapter(chapter)
    setShowPaymentModal(true)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    const updates = {
      ...editFormData,
      tags: editFormData.tags ? editFormData.tags.split(',').map(tag => tag.trim()) : [],
      targetWordCount: parseInt(editFormData.targetWordCount),
      deadline: editFormData.deadline || undefined
    }
    handleUpdateChapter(selectedChapter._id, updates)
  }

  // Helper functions
  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      revision: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getBadgeColor = (type, value) => {
    const colors = {
      level: { masters: 'bg-blue-100 text-blue-800', phd: 'bg-indigo-100 text-indigo-800' },
      workType: { 
        coursework: 'bg-green-100 text-green-800', 
        revision: 'bg-orange-100 text-orange-800', 
        statistics: 'bg-red-100 text-red-800' 
      },
      urgency: { 
        normal: 'bg-gray-100 text-gray-800', 
        urgent: 'bg-orange-100 text-orange-800', 
        very_urgent: 'bg-red-100 text-red-800' 
      }
    }
    return colors[type]?.[value] || 'bg-gray-100 text-gray-800'
  }

  // Filter and sort chapters
  const filteredChapters = chapters.filter(chapter => {
    if (filterStatus === 'all') return true
    return chapter.status === filterStatus
  })

  const sortedChapters = [...filteredChapters].sort((a, b) => {
    switch (sortBy) {
      case 'chapterNumber': return a.chapterNumber - b.chapterNumber
      case 'title': return a.title.localeCompare(b.title)
      case 'cost': return (b.estimatedCost || 0) - (a.estimatedCost || 0)
      case 'updatedAt': return new Date(b.updatedAt) - new Date(a.updatedAt)
      default: return 0
    }
  })

  // Calculate totals
  const totals = chapters.reduce((acc, chapter) => ({
    cost: acc.cost + (chapter.estimatedCost || 0),
    pages: acc.pages + (chapter.estimatedPages || Math.ceil((chapter.targetWordCount || 0) / 250)),
    chapters: acc.chapters + 1
  }), { cost: 0, pages: 0, chapters: 0 })

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        {/* Alerts */}
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')} 
            className="mb-4 sm:mb-6"
          />
        )}

        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
            className="mb-4 sm:mb-6"
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Current Chapters</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your chapters in progress</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/addchapter')}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
            Add Chapter
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totals.chapters}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Chapters</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  KSH {totals.cost.toLocaleString()}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">Total Cost</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{totals.pages}</p>
                <p className="text-gray-600 text-xs sm:text-sm">Total Pages</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  {chapters.filter(c => ['urgent', 'very_urgent'].includes(c.urgency)).length}
                </p>
                <p className="text-gray-600 text-xs sm:text-sm">Urgent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {chapters.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                  <option value="revision">Revision</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                >
                  <option value="chapterNumber">Chapter Number</option>
                  <option value="title">Title</option>
                  <option value="cost">Cost (High to Low)</option>
                  <option value="updatedAt">Last Modified</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Chapters List */}
        {sortedChapters.length > 0 ? (
          <div className="space-y-4 sm:space-y-6">
            {sortedChapters.map((chapter) => (
              <div key={chapter._id} className="bg-white rounded-lg shadow p-4 sm:p-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                        Ch. {chapter.chapterNumber}: {chapter.title}
                      </h3>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium self-start ${getStatusColor(chapter.status)}`}>
                        {chapter.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    
                    {chapter.summary && (
                      <p className="text-gray-600 mb-3 text-sm sm:text-base">{chapter.summary}</p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {chapter.level && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('level', chapter.level)}`}>
                          {chapter.level.toUpperCase()}
                        </span>
                      )}
                      {chapter.workType && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('workType', chapter.workType)}`}>
                          {chapter.workType.toUpperCase()}
                        </span>
                      )}
                      {chapter.urgency && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor('urgency', chapter.urgency)}`}>
                          {chapter.urgency.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                      {chapter.isPaid && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          PAID
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                        </svg>
                        <span className="truncate">{chapter.wordCount || 0} / {chapter.targetWordCount || 0} words</span>
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <span className="truncate">KSH {(chapter.estimatedCost || 0).toLocaleString()}</span>
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 00-2 2v6a2 2 0 002 2v1a2 2 0 01-2-2V5zM14 5a2 2 0 012 2v6a2 2 0 01-2 2v1a2 2 0 002-2V7a2 2 0 00-2-2v1zm-1-1V3a1 1 0 10-2 0v1h2z" clipRule="evenodd"/>
                        </svg>
                        <span className="truncate">{chapter.estimatedPages || Math.ceil((chapter.targetWordCount || 0) / 250)} pages</span>
                      </span>
                      {chapter.deadline && (
                        <span className="flex items-center col-span-2 sm:col-span-1">
                          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                          <span className="truncate">Due: {new Date(chapter.deadline).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap sm:flex-col gap-2">
                    <button
                      onClick={() => openEditModal(chapter)}
                      className="flex-1 sm:flex-none px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      Edit
                    </button>
                    
                    {!chapter.isPaid && (
                      <button
                        onClick={() => openPaymentModal(chapter)}
                        className="flex-1 sm:flex-none px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        Pay
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedChapter(chapter)
                        fileInputRef.current?.click()
                      }}
                      className="flex-1 sm:flex-none px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                      disabled={uploadingFile}
                    >
                      Upload
                    </button>

                    <div className="relative">
                      <select
                        onChange={(e) => {
                          if (e.target.value === 'delete') {
                            handleDeleteChapter(chapter._id)
                          } else if (e.target.value) {
                            handleStatusChange(chapter._id, e.target.value)
                          }
                          e.target.value = ''
                        }}
                        className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium border-0 focus:ring-2 focus:ring-gray-300"
                      >
                        <option value="">More</option>
                        <option value="completed">Mark Completed</option>
                        <option value="revision">Send for Revision</option>
                        <option value="in_progress">Mark In Progress</option>
                        <option value="delete">Delete</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {chapter.targetWordCount > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                      <span>Progress</span>
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
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filterStatus === 'all' ? 'No chapters found' : `No ${filterStatus.replace('_', ' ')} chapters`}
            </h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              {filterStatus === 'all' 
                ? "You don't have any chapters yet. Start writing your first chapter!" 
                : `No chapters with status "${filterStatus.replace('_', ' ')}" found.`
              }
            </p>
            <button
              onClick={() => filterStatus === 'all' ? router.push('/dashboard/addchapter') : setFilterStatus('all')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {filterStatus === 'all' ? 'Create Your First Chapter' : 'Show All Chapters'}
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={() => selectedChapter && handleFileUpload(selectedChapter._id)}
        />

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit Chapter</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                    <textarea
                      value={editFormData.summary}
                      onChange={(e) => setEditFormData({...editFormData, summary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Word Count</label>
                      <input
                        type="number"
                        value={editFormData.targetWordCount}
                        onChange={(e) => setEditFormData({...editFormData, targetWordCount: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        min="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                      <input
                        type="date"
                        value={editFormData.deadline}
                        onChange={(e) => setEditFormData({...editFormData, deadline: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={editFormData.level}
                        onChange={(e) => setEditFormData({...editFormData, level: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="masters">Masters</option>
                        <option value="phd">PhD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                      <select
                        value={editFormData.workType}
                        onChange={(e) => setEditFormData({...editFormData, workType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="coursework">Coursework</option>
                        <option value="revision">Revision</option>
                        <option value="statistics">Statistics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                      <select
                        value={editFormData.urgency}
                        onChange={(e) => setEditFormData({...editFormData, urgency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="very_urgent">Very Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={editFormData.tags}
                      onChange={(e) => setEditFormData({...editFormData, tags: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="comma, separated, tags"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Update Chapter
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Confirmation</h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Chapter Details</h3>
                    <p className="text-sm text-gray-600">Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}</p>
                    <p className="text-sm text-gray-600">Pages: {selectedChapter.estimatedPages || 'TBD'}</p>
                    <p className="text-sm text-gray-600">Type: {selectedChapter.workType?.replace('_', ' ').toUpperCase()}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">
                        KSH {(selectedChapter.estimatedCost || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => handlePayment(selectedChapter)}
                      disabled={processingPayment}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {processingPayment ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}