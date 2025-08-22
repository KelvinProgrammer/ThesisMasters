// app/dashboard/overview/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function DashboardOverview() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchStats()
  }, [status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats')
      }

      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">Here's your thesis progress overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.chaptersCount || 0}</p>
                <p className="text-gray-600 text-sm">Chapters</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.progressPercentage || 0}%</p>
                <p className="text-gray-600 text-sm">Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.chapters?.totalWords || 0}</p>
                <p className="text-gray-600 text-sm">Words Written</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.hoursSpent || 0}</p>
                <p className="text-gray-600 text-sm">Hours Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapter Status */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chapter Status</h2>
              
              {stats?.chapters?.total > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900">Draft Chapters</p>
                      <p className="text-sm text-blue-600">{stats?.chapters?.byStatus?.draft || 0} chapters</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.chapters?.byStatus?.draft || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-yellow-900">In Progress</p>
                      <p className="text-sm text-yellow-600">{stats?.chapters?.byStatus?.in_progress || 0} chapters</p>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats?.chapters?.byStatus?.in_progress || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900">Completed</p>
                      <p className="text-sm text-green-600">{stats?.chapters?.byStatus?.completed || 0} chapters</p>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.chapters?.byStatus?.completed || 0}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium text-purple-900">Under Revision</p>
                      <p className="text-sm text-purple-600">{stats?.chapters?.byStatus?.revision || 0} chapters</p>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.chapters?.byStatus?.revision || 0}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">No chapters yet</p>
                  <button 
                    onClick={() => router.push('/dashboard/addchapter')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Chapter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            
            {stats?.activity?.recentChapters?.length > 0 ? (
              <div className="space-y-4">
                {stats.activity.recentChapters.map((chapter) => (
                  <div key={chapter._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      chapter.status === 'completed' ? 'bg-green-500' :
                      chapter.status === 'in_progress' ? 'bg-yellow-500' :
                      chapter.status === 'revision' ? 'bg-purple-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Chapter {chapter.chapterNumber}: {chapter.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(chapter.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Ready to continue your thesis journey?</h2>
            <p className="text-blue-100 mb-6">
              Get started with our AI-powered tools to research, write, and defend your thesis with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/dashboard/addchapter')}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start New Chapter
              </button>
              <button 
                onClick={() => router.push('/dashboard/quickactions')}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Quick Actions
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}