// app/writer/dashboard/revisionchapters/page.jsx - Enhanced revision handling with file upload
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterRevisionChapters() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)
  
  // State management
  const [chapters, setChapters] = useState([])
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [revisionForm, setRevisionForm] = useState({ content: '', revisionNotes: '' })
  const [updating, setUpdating] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

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

    fetchRevisionChapters()
  }, [status, session, router])

  const fetchRevisionChapters = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        status: 'revision',
        limit: '50',
        sortBy: 'revisionRequestedAt',
        sortOrder: 'desc'
      })

      const response = await fetch(`/api/writer/chapters?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch chapters')
      }

      // Filter to only show chapters assigned to this writer that are in revision
      const myRevisionChapters = (data.chapters || []).filter(chapter => 
        chapter.writerId && chapter.writerId.toString() === session.user.id && chapter.status === 'revision'
      )

      setChapters(myRevisionChapters)
      setStatistics(data.statistics || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (chapter) => {
    const file = fileInputRef.current?.files[0]
    if (!file) {
      setError('Please select a file to upload')
      return
    }

    // Validate file type
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
      formData.append('chapterId', chapter._id)

      const response = await fetch('/api/chapters/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      // Update chapter with file info
      await fetch(`/api/chapters/${chapter._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload_file',
          fileName: data.file.fileName,
          fileUrl: data.file.fileUrl,
          fileSize: data.file.fileSize,
          fileType: data.file.fileType
        })
      })

      setSuccess(`File uploaded successfully: ${file.name}`)
      fetchRevisionChapters()
      fileInputRef.current.value = ''
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmitRevision = async (e) => {
    e.preventDefault()
    if (!revisionForm.content.trim() && (!selectedChapter.files || selectedChapter.files.length === 0)) {
      setError('Please either add content or upload a file before submitting')
      return
    }

    if (!revisionForm.revisionNotes.trim()) {
      setError('Please provide revision notes explaining the changes made')
      return
    }

    try {
      setUpdating(true)
      const response = await fetch(`/api/chapters/${selectedChapter._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_revision',
          content: revisionForm.content.trim(),
          revisionNotes: revisionForm.revisionNotes.trim()
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Revision submitted successfully! The student will be notified.')
      setShowSubmitModal(false)
      setRevisionForm({ content: '', revisionNotes: '' })
      fetchRevisionChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleResumeWork = async (chapterId) => {
    try {
      setUpdating(true)
      const response = await fetch('/api/writer/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          action: 'update_status',
          data: { status: 'in_progress' }
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Chapter status updated to in progress')
      fetchRevisionChapters()
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdating(false)
    }
  }

  const openRevisionModal = (chapter) => {
    setSelectedChapter(chapter)
    setRevisionForm({
      content: chapter.content || '',
      revisionNotes: ''
    })
    setShowRevisionModal(true)
  }

  const openSubmitModal = (chapter) => {
    setSelectedChapter(chapter)
    setRevisionForm({
      content: chapter.content || '',
      revisionNotes: ''
    })
    setShowSubmitModal(true)
  }

  const getUrgencyColor = (urgency) => {
    const colors = {
      normal: 'bg-green-100 text-green-800',
      urgent: 'bg-orange-100 text-orange-800',
      very_urgent: 'bg-red-100 text-red-800'
    }
    return colors[urgency] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTimeInRevision = (chapter) => {
    if (!chapter.revisionRequestedAt) return 'Unknown'
    const now = new Date()
    const requested = new Date(chapter.revisionRequestedAt)
    const diffTime = now - requested
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const hasFiles = (chapter) => {
    return chapter.files && chapter.files.length > 0
  }

  const getRevisionCount = (chapter) => {
    return chapter.revisionCount || 0
  }

  const calculateProgress = (chapter) => {
    if (!chapter.targetWordCount) return 0
    return Math.min(((chapter.wordCount || 0) / chapter.targetWordCount) * 100, 100)
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
          <h1 className="text-3xl font-bold text-gray-900">Revision Requests</h1>
          <p className="text-gray-600 mt-1">Handle student revision requests and submit updated work</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                <p className="text-gray-600 text-sm">Pending Revisions</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chapters.filter(ch => getDaysUntilDeadline(ch.deadline) <= 3).length}
                </p>
                <p className="text-gray-600 text-sm">Urgent</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(chapters.reduce((sum, ch) => sum + (ch.earnings || 0), 0))}
                </p>
                <p className="text-gray-600 text-sm">Revision Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={() => selectedChapter && handleFileUpload(selectedChapter)}
        />

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
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        Revision #{getRevisionCount(chapter)}
                      </span>
                      {chapter.urgency !== 'normal' && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(chapter.urgency)}`}>
                          {chapter.urgency.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
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
                        <span className="font-medium text-gray-700">Level:</span>
                        <p className="text-gray-900">{chapter.level?.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Requested:</span>
                        <p className="text-gray-900">{getTimeInRevision(chapter)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Your Earnings:</span>
                        <p className="text-gray-900 font-semibold">{formatCurrency(chapter.earnings || 0)}</p>
                      </div>
                    </div>

                    {/* Revision Request */}
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Student's Revision Request</h4>
                      <p className="text-sm text-yellow-800">
                        {chapter.revisionNotes || 'No specific revision notes provided.'}
                      </p>
                      <p className="text-xs text-yellow-600 mt-2">
                        Requested: {new Date(chapter.revisionRequestedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Reference Files from Student */}
                    {hasFiles(chapter) && (
                      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-blue-900 mb-2">Reference Files:</h4>
                        <div className="space-y-2">
                          {chapter.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                                </svg>
                                <div>
                                  <p className="text-sm font-medium text-blue-900">{file.fileName}</p>
                                  <p className="text-xs text-blue-700">
                                    {Math.round(file.fileSize / 1024)}KB • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <a 
                                href={file.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline Warning */}
                    {chapter.deadline && (
                      <div className={`p-3 rounded-lg mb-4 ${
                        getDaysUntilDeadline(chapter.deadline) <= 2 
                          ? 'bg-red-50 border border-red-200' 
                          : getDaysUntilDeadline(chapter.deadline) <= 7
                          ? 'bg-yellow-50 border border-yellow-200'
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center">
                          <svg className={`w-4 h-4 mr-2 ${
                            getDaysUntilDeadline(chapter.deadline) <= 2 
                              ? 'text-red-600' 
                              : getDaysUntilDeadline(chapter.deadline) <= 7
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          <span className={`text-sm font-medium ${
                            getDaysUntilDeadline(chapter.deadline) <= 2 
                              ? 'text-red-800' 
                              : getDaysUntilDeadline(chapter.deadline) <= 7
                              ? 'text-yellow-800'
                              : 'text-green-800'
                          }`}>
                            {getDaysUntilDeadline(chapter.deadline) > 0 
                              ? `${getDaysUntilDeadline(chapter.deadline)} days until deadline`
                              : `Deadline passed ${Math.abs(getDaysUntilDeadline(chapter.deadline))} days ago`
                            }
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Current Progress</span>
                        <span>{chapter.wordCount || 0} / {chapter.targetWordCount} words ({Math.round(calculateProgress(chapter))}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${calculateProgress(chapter)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Content Preview */}
                    {chapter.content && (
                      <div className="p-4 bg-gray-50 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Current Content Preview:</h4>
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {chapter.content.substring(0, 300)}...
                        </p>
                      </div>
                    )}

                    {/* Upload Files Section */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">Upload Revised Files</h4>
                          <p className="text-sm text-gray-600">Upload your revised work files for the student</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedChapter(chapter)
                            fileInputRef.current?.click()
                          }}
                          disabled={uploadingFile}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                        >
                          {uploadingFile ? 'Uploading...' : 'Upload File'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => openRevisionModal(chapter)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Work on Revision
                    </button>
                    
                    <button
                      onClick={() => openSubmitModal(chapter)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Submit Revision
                    </button>
                    
                    <button
                      onClick={() => handleResumeWork(chapter._id)}
                      disabled={updating}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      Resume Work
                    </button>

                    <div className="text-center">
                      <div className="text-xs text-orange-600 mb-1">⚠ Revision Needed</div>
                      <div className="text-xs text-gray-500">Address student feedback</div>
                    </div>
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No revision requests</h3>
            <p className="text-gray-500 mb-4">Great! You don't have any chapters requiring revisions.</p>
            <button
              onClick={() => router.push('/writer/dashboard/acceptedchapters')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Accepted Chapters
            </button>
          </div>
        )}

        {/* Work on Revision Modal */}
        {showRevisionModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Work on Revision: {selectedChapter.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Address the student's revision request and update your work
                    </p>
                  </div>
                  <button
                    onClick={() => setShowRevisionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                {/* Student's Request */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                  <h3 className="font-medium text-yellow-900 mb-2">Student's Revision Request:</h3>
                  <p className="text-sm text-yellow-800">{selectedChapter.revisionNotes}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Updated Content
                    </label>
                    <textarea
                      value={revisionForm.content}
                      onChange={(e) => setRevisionForm({...revisionForm, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={15}
                      placeholder="Update your chapter content here..."
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Words: {revisionForm.content.split(/\s+/).filter(word => word.length > 0).length}</span>
                      <span>Target: {selectedChapter.targetWordCount}</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        setShowRevisionModal(false)
                        openSubmitModal(selectedChapter)
                      }}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Ready to Submit
                    </button>
                    <button
                      onClick={() => setShowRevisionModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Save Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Revision Modal */}
        {showSubmitModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Submit Revision</h2>
                  <button
                    onClick={() => setShowSubmitModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitRevision} className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You're about to submit your revised chapter. Please explain what changes you made.
                    </p>
                  </div>

                  {/* Student's Original Request */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Original Request:</h4>
                    <p className="text-sm text-gray-700">{selectedChapter.revisionNotes}</p>
                  </div>

                  {/* Files Status */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Files Status:</h4>
                    {hasFiles(selectedChapter) ? (
                      <div className="space-y-1">
                        {selectedChapter.files.map((file, index) => (
                          <div key={index} className="text-sm text-blue-800">
                            ✓ {file.fileName} ({Math.round(file.fileSize / 1024)}KB)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-blue-800">No files uploaded</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Revision Summary *
                    </label>
                    <textarea
                      value={revisionForm.revisionNotes}
                      onChange={(e) => setRevisionForm({...revisionForm, revisionNotes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Explain what changes you made to address the student's feedback..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe the changes you made and how they address the student's concerns.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Ready to submit?</strong> Your revised chapter will be sent back to the student for review. 
                      They can either accept it or request further changes.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={updating || !revisionForm.revisionNotes.trim()}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? 'Submitting...' : 'Submit Revision'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSubmitModal(false)}
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