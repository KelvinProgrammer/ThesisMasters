// app/writer/dashboard/profile/page.jsx - Writer Profile Management
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [profile, setProfile] = useState(null)
  const [statistics, setStatistics] = useState({})
  const [recentFeedback, setRecentFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    specializations: [],
    yearsExperience: 0,
    education: {
      level: 'bachelors',
      field: '',
      institution: ''
    },
    availability: 'available'
  })

  const specializationOptions = [
    { value: 'academic_writing', label: 'Academic Writing' },
    { value: 'research', label: 'Research' },
    { value: 'statistics', label: 'Statistics' },
    { value: 'data_analysis', label: 'Data Analysis' },
    { value: 'literature_review', label: 'Literature Review' },
    { value: 'methodology', label: 'Methodology' }
  ]

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

    fetchProfile()
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/writer/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile')
      }

      setProfile(data.writer)
      setStatistics(data.statistics || {})
      setRecentFeedback(data.recentFeedback || [])
      
      // Set form data
      setFormData({
        name: data.writer.name || '',
        specializations: data.writer.writerProfile?.specializations || [],
        yearsExperience: data.writer.writerProfile?.yearsExperience || 0,
        education: data.writer.writerProfile?.education || {
          level: 'bachelors',
          field: '',
          institution: ''
        },
        availability: data.writer.writerProfile?.availability || 'available'
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const response = await fetch('/api/writer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setProfile(data.writer)
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSpecializationChange = (value) => {
    const currentSpecs = formData.specializations || []
    if (currentSpecs.includes(value)) {
      setFormData({
        ...formData,
        specializations: currentSpecs.filter(spec => spec !== value)
      })
    } else {
      setFormData({
        ...formData,
        specializations: [...currentSpecs, value]
      })
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const getAvailabilityColor = (availability) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-yellow-100 text-yellow-800',
      unavailable: 'bg-red-100 text-red-800'
    }
    return colors[availability] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <WriterDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Writer Profile</h1>
              <p className="text-gray-600 mt-1">Manage your writer profile and view performance metrics</p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      fetchProfile()
                    }}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
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

        {profile && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Profile Section */}
            <div className="xl:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
                
                {isEditing ? (
                  <form onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={formData.yearsExperience}
                        onChange={(e) => setFormData({...formData, yearsExperience: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {specializationOptions.map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.specializations?.includes(option.value)}
                              onChange={() => handleSpecializationChange(option.value)}
                              className="rounded border-gray-300 mr-2"
                            />
                            <span className="text-sm text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability Status
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({...formData, availability: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="available">Available for Projects</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Education Level
                        </label>
                        <select
                          value={formData.education.level}
                          onChange={(e) => setFormData({
                            ...formData,
                            education: {...formData.education, level: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="bachelors">Bachelor's</option>
                          <option value="masters">Master's</option>
                          <option value="phd">PhD</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Field of Study
                        </label>
                        <input
                          type="text"
                          value={formData.education.field}
                          onChange={(e) => setFormData({
                            ...formData,
                            education: {...formData.education, field: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={formData.education.institution}
                          onChange={(e) => setFormData({
                            ...formData,
                            education: {...formData.education, institution: e.target.value}
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="University name"
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-2xl font-bold text-green-600">
                          {profile.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{profile.name}</h3>
                        <p className="text-gray-600">{profile.email}</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(profile.writerProfile?.availability)}`}>
                            {profile.writerProfile?.availability?.replace('_', ' ').toUpperCase()}
                          </span>
                          {profile.writerProfile?.isVerified && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                        <p className="text-gray-600">{profile.writerProfile?.yearsExperience || 0} years</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
                        <div className="flex items-center">
                          {profile.writerProfile?.rating > 0 ? (
                            <>
                              <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              <span className="font-semibold">{profile.writerProfile.rating.toFixed(1)}</span>
                            </>
                          ) : (
                            <span className="text-gray-500">No rating yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {profile.writerProfile?.education && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                        <p className="text-gray-600">
                          {profile.writerProfile.education.level?.toUpperCase()} in {profile.writerProfile.education.field || 'N/A'}
                          {profile.writerProfile.education.institution && (
                            <span> from {profile.writerProfile.education.institution}</span>
                          )}
                        </p>
                      </div>
                    )}

                    {profile.writerProfile?.specializations?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.writerProfile.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                            >
                              {spec.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Feedback */}
              {recentFeedback.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Feedback</h2>
                  <div className="space-y-4">
                    {recentFeedback.map((feedback, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{feedback.chapterTitle}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(feedback.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm italic">"{feedback.feedback.comment}"</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500 mr-2">Rating:</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < feedback.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              {/* Performance Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Projects</span>
                    <span className="font-semibold text-gray-900">{statistics.totalProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-900">{statistics.completedProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-semibold text-gray-900">{statistics.inProgressProjects || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completion Rate</span>
                    <span className="font-semibold text-gray-900">{statistics.completionRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earnings</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(statistics.totalEarnings || 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. per Project</span>
                    <span className="font-semibold text-gray-900">{formatCurrency((statistics.totalEarnings || 0) / Math.max(statistics.totalProjects || 1, 1))}</span>
                  </div>
                </div>
              </div>

              {/* Writing Stats */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Words</span>
                    <span className="font-semibold text-gray-900">{statistics.totalWords?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Words/Project</span>
                    <span className="font-semibold text-gray-900">{statistics.avgWordsPerProject?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Pages</span>
                    <span className="font-semibold text-gray-900">{statistics.totalPages || Math.ceil((statistics.totalWords || 0) / 250)}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Performance */}
              {statistics.monthlyPerformance?.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
                  <div className="space-y-3">
                    {statistics.monthlyPerformance.slice(-3).map((month, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3">
                        <div className="font-medium text-gray-900">{month.month}</div>
                        <div className="text-sm text-gray-600">
                          {month.chapters} chapters • {month.words.toLocaleString()} words
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(month.earnings)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </WriterDashboardLayout>
  )
}