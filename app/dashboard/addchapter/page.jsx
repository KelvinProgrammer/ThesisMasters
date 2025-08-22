// app/dashboard/addchapter/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function AddChapter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    chapterNumber: '',
    targetWordCount: '2000',
    deadline: '',
    tags: ''
  })

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Process tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []

      const submitData = {
        ...formData,
        chapterNumber: parseInt(formData.chapterNumber),
        targetWordCount: parseInt(formData.targetWordCount),
        deadline: formData.deadline || undefined,
        tags: tagsArray
      }

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create chapter')
      }

      setSuccess('Chapter created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        chapterNumber: '',
        targetWordCount: '2000',
        deadline: '',
        tags: ''
      })

      // Redirect to chapter list after a delay
      setTimeout(() => {
        router.push('/dashboard/currentchapters')
      }, 2000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Chapter</h1>
          <p className="text-gray-600">Create a new chapter for your thesis</p>
        </div>

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

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter chapter title"
              />
            </div>

            {/* Chapter Number and Target Word Count */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  id="chapterNumber"
                  name="chapterNumber"
                  value={formData.chapterNumber}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>

              <div>
                <label htmlFor="targetWordCount" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Word Count
                </label>
                <input
                  type="number"
                  id="targetWordCount"
                  name="targetWordCount"
                  value={formData.targetWordCount}
                  onChange={handleChange}
                  min="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2000"
                />
              </div>
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Summary
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of what this chapter will cover..."
              />
            </div>

            {/* Deadline */}
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="methodology, literature review, analysis (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Chapter...
                  </div>
                ) : (
                  'Create Chapter'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/overview')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Chapter Writing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Structure:</strong> Start with a clear outline before writing
            </div>
            <div>
              <strong>Word Count:</strong> Aim for consistent chapter lengths
            </div>
            <div>
              <strong>Deadlines:</strong> Set realistic timelines for completion
            </div>
            <div>
              <strong>Tags:</strong> Use tags to organize related chapters
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}