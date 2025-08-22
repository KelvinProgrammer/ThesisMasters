// app/dashboard/quickactions/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function QuickActions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    fetchDashboardStats()
  }, [status, router])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      // Silently fail for stats
      console.error('Failed to fetch stats:', err)
    }
  }

  const quickActions = [
    {
      id: 'add-chapter',
      title: 'Add New Chapter',
      description: 'Start writing your next thesis chapter',
      icon: 'plus',
      color: 'blue',
      action: () => router.push('/dashboard/addchapter'),
      enabled: true
    },
    {
      id: 'research-assistant',
      title: 'Research Assistant',
      description: 'AI-powered research and citation help',
      icon: 'search',
      color: 'purple',
      action: () => alert('Research Assistant feature coming soon!'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'writing-coach',
      title: 'Writing Coach',
      description: 'Get AI feedback on your writing style',
      icon: 'edit',
      color: 'green',
      action: () => alert('Writing Coach feature coming soon!'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'grammar-check',
      title: 'Grammar & Style Check',
      description: 'Improve your academic writing quality',
      icon: 'check',
      color: 'red',
      action: () => alert('Grammar Check feature coming soon!'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'citation-generator',
      title: 'Citation Generator',
      description: 'Generate proper academic citations',
      icon: 'book',
      color: 'yellow',
      action: () => alert('Citation Generator feature coming soon!'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'export-thesis',
      title: 'Export Full Thesis',
      description: 'Download your complete thesis as PDF',
      icon: 'download',
      color: 'indigo',
      action: () => handleExportThesis(),
      enabled: stats?.chapters?.completed > 0
    },
    {
      id: 'backup-data',
      title: 'Backup Data',
      description: 'Create a backup of all your work',
      icon: 'cloud',
      color: 'gray',
      action: () => handleBackupData(),
      enabled: true
    },
    {
      id: 'progress-report',
      title: 'Progress Report',
      description: 'Generate detailed progress analytics',
      icon: 'chart',
      color: 'teal',
      action: () => handleGenerateReport(),
      enabled: stats?.chapters?.total > 0
    }
  ]

  const handleExportThesis = async () => {
    if (!stats?.chapters?.completed) {
      setError('No completed chapters to export')
      return
    }

    setLoading(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess('Thesis exported successfully! Check your downloads.')
    } catch (err) {
      setError('Failed to export thesis')
    } finally {
      setLoading(false)
    }
  }

  const handleBackupData = async () => {
    setLoading(true)
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess('Data backup completed successfully!')
    } catch (err) {
      setError('Failed to backup data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!stats?.chapters?.total) {
      setError('No chapters available for report generation')
      return
    }

    setLoading(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess('Progress report generated! Check your email.')
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName) => {
    const icons = {
      plus: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      ),
      search: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 3a6 6 0 100 12 6 6 0 000-12zM2 9a7 7 0 1112.452 4.391l3.328 3.329a1 1 0 11-1.414 1.414l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
        </svg>
      ),
      edit: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
        </svg>
      ),
      check: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
      ),
      book: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
        </svg>
      ),
      download: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
      ),
      cloud: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
        </svg>
      ),
      chart: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
        </svg>
      )
    }
    return icons[iconName] || icons.plus
  }

  const getColorClasses = (color, enabled) => {
    if (!enabled) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-400',
        hover: '',
        border: 'border-gray-200'
      }
    }

    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        hover: 'hover:bg-blue-200',
        border: 'border-blue-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        hover: 'hover:bg-purple-200',
        border: 'border-purple-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        hover: 'hover:bg-green-200',
        border: 'border-green-200'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        hover: 'hover:bg-red-200',
        border: 'border-red-200'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        hover: 'hover:bg-yellow-200',
        border: 'border-yellow-200'
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        hover: 'hover:bg-indigo-200',
        border: 'border-indigo-200'
      },
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        hover: 'hover:bg-gray-200',
        border: 'border-gray-200'
      },
      teal: {
        bg: 'bg-teal-100',
        text: 'text-teal-600',
        hover: 'hover:bg-teal-200',
        border: 'border-teal-200'
      }
    }
    return colors[color] || colors.blue
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

        {success && (
          <Alert 
            type="success" 
            message={success} 
            onClose={() => setSuccess('')} 
            className="mb-6"
          />
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h1>
          <p className="text-gray-600">Streamline your thesis workflow with these powerful tools</p>
        </div>

        {/* Current Status */}
        {stats && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
            <h2 className="text-xl font-bold mb-4">Your Progress at a Glance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.chapters?.total || 0}</div>
                <div className="text-sm text-blue-100">Total Chapters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.chapters?.completed || 0}</div>
                <div className="text-sm text-blue-100">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.chapters?.totalWords?.toLocaleString() || 0}</div>
                <div className="text-sm text-blue-100">Total Words</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.overview?.progressPercentage || 0}%</div>
                <div className="text-sm text-blue-100">Overall Progress</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quickActions.map((action) => {
            const colors = getColorClasses(action.color, action.enabled)
            
            return (
              <button
                key={action.id}
                onClick={action.enabled ? action.action : undefined}
                disabled={!action.enabled || loading}
                className={`
                  relative p-6 border-2 rounded-lg text-left transition-all duration-200
                  ${colors.border} ${colors.hover}
                  ${action.enabled ? 'cursor-pointer shadow-sm hover:shadow-md' : 'cursor-not-allowed opacity-75'}
                  ${loading ? 'pointer-events-none' : ''}
                `}
              >
                {/* Coming Soon Badge */}
                {action.comingSoon && (
                  <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                    Coming Soon
                  </div>
                )}

                {/* Icon */}
                <div className={`w-16 h-16 ${colors.bg} rounded-lg flex items-center justify-center mb-4 ${colors.text}`}>
                  {getIcon(action.icon)}
                </div>

                {/* Content */}
                <h3 className={`text-lg font-semibold mb-2 ${action.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                  {action.title}
                </h3>
                <p className={`text-sm ${action.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                  {action.description}
                </p>

                {/* Status indicators */}
                {!action.enabled && !action.comingSoon && (
                  <div className="mt-3 text-xs text-gray-400">
                    {action.id === 'export-thesis' && 'Complete at least one chapter first'}
                    {action.id === 'progress-report' && 'Create chapters to generate reports'}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Add New Chapter</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + N</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Quick Search</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Save Chapter</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Export Data</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + E</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Open Help</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">F1</kbd>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Toggle Sidebar</span>
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">Ctrl + B</kbd>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Productivity Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>Daily Writing:</strong> Set a daily word count goal and stick to it
            </div>
            <div>
              <strong>Regular Backups:</strong> Backup your work at least once a week
            </div>
            <div>
              <strong>Citation Management:</strong> Add citations as you write, not later
            </div>
            <div>
              <strong>Progress Tracking:</strong> Review your progress weekly
            </div>
            <div>
              <strong>Version Control:</strong> Save major revisions as separate versions
            </div>
            <div>
              <strong>Feedback Integration:</strong> Address feedback promptly
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}