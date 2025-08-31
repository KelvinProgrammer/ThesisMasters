// app/admin/dashboard/quickaction/page.jsx - Admin Quick Actions
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function QuickActions() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionHistory, setActionHistory] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [modalData, setModalData] = useState({})

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (session?.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchActionHistory()
  }, [status, session, router])

  const fetchActionHistory = async () => {
    try {
      // Mock data - replace with actual API call
      const mockHistory = [
        {
          id: 1,
          action: 'bulk_approve_writers',
          description: 'Approved 5 pending writer applications',
          performedBy: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          affectedCount: 5,
          status: 'completed'
        },
        {
          id: 2,
          action: 'send_payment_reminders',
          description: 'Sent payment reminders to 12 students',
          performedBy: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          affectedCount: 12,
          status: 'completed'
        },
        {
          id: 3,
          action: 'deadline_extension',
          description: 'Extended deadlines for urgent chapters',
          performedBy: 'Admin User',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
          affectedCount: 8,
          status: 'completed'
        }
      ]
      setActionHistory(mockHistory)
    } catch (err) {
      setError('Failed to fetch action history')
    }
  }

  const executeQuickAction = async (actionType, actionData = {}) => {
    setLoading(true)
    try {
      // Mock API call - replace with actual implementation
      console.log(`Executing ${actionType}:`, actionData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add to action history
      const newAction = {
        id: actionHistory.length + 1,
        action: actionType,
        description: getActionDescription(actionType, actionData),
        performedBy: session.user.name,
        timestamp: new Date(),
        affectedCount: actionData.count || 1,
        status: 'completed'
      }
      
      setActionHistory(prev => [newAction, ...prev])
      setSuccess(`${getActionDescription(actionType, actionData)} completed successfully!`)
      setShowModal(false)
      setModalData({})
    } catch (err) {
      setError(`Failed to execute ${actionType}`)
    } finally {
      setLoading(false)
    }
  }

  const getActionDescription = (actionType, actionData) => {
    switch (actionType) {
      case 'bulk_approve_writers':
        return `Approved ${actionData.count || 'pending'} writer applications`
      case 'send_payment_reminders':
        return `Sent payment reminders to ${actionData.count || 'overdue'} students`
      case 'deadline_extension':
        return `Extended deadlines for ${actionData.count || 'urgent'} chapters`
      case 'writer_notifications':
        return `Sent notifications to ${actionData.count || 'all'} writers`
      case 'system_backup':
        return 'Created system backup'
      case 'generate_reports':
        return `Generated ${actionData.reportType || 'monthly'} reports`
      case 'bulk_status_update':
        return `Updated status for ${actionData.count || 'selected'} chapters`
      case 'purge_old_data':
        return 'Purged old system data'
      default:
        return 'Executed action'
    }
  }

  const openModal = (type, data = {}) => {
    setModalType(type)
    setModalData(data)
    setShowModal(true)
  }

  const quickActions = [
    {
      id: 'bulk_approve_writers',
      title: 'Bulk Approve Writers',
      description: 'Approve all pending writer applications at once',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
        </svg>
      ),
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      requiresConfirmation: true,
      dangerLevel: 'low'
    },
    {
      id: 'send_payment_reminders',
      title: 'Send Payment Reminders',
      description: 'Send automated reminders to students with overdue payments',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
        </svg>
      ),
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      requiresConfirmation: true,
      dangerLevel: 'low'
    },
    {
      id: 'deadline_extension',
      title: 'Extend Urgent Deadlines',
      description: 'Automatically extend deadlines for chapters marked as urgent',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      ),
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      requiresConfirmation: true,
      dangerLevel: 'medium'
    },
    {
      id: 'writer_notifications',
      title: 'Notify All Writers',
      description: 'Send important announcements to all active writers',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
        </svg>
      ),
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      requiresConfirmation: true,
      dangerLevel: 'low'
    },
    {
      id: 'system_backup',
      title: 'Create System Backup',
      description: 'Generate a complete backup of all system data',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
        </svg>
      ),
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600',
      requiresConfirmation: false,
      dangerLevel: 'low'
    },
    {
      id: 'generate_reports',
      title: 'Generate Reports',
      description: 'Create comprehensive reports for analysis',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
        </svg>
      ),
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600',
      requiresConfirmation: false,
      dangerLevel: 'low'
    },
    {
      id: 'bulk_status_update',
      title: 'Bulk Status Update',
      description: 'Update status for multiple chapters simultaneously',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
        </svg>
      ),
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      requiresConfirmation: true,
      dangerLevel: 'medium'
    },
    {
      id: 'purge_old_data',
      title: 'Purge Old Data',
      description: 'Remove old logs and temporary files to free up space',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"/>
          <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3l1.5 1.5a1 1 0 01-1.414 1.414L10 10.414V6a1 1 0 011-1z" clipRule="evenodd"/>
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
        </svg>
      ),
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      requiresConfirmation: true,
      dangerLevel: 'high'
    }
  ]

  const formatRelativeTime = (timestamp) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  return (
    <AdminDashboardLayout>
      <div className="p-4 sm:p-6">
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
          <p className="text-gray-600">Execute common administrative tasks quickly and efficiently</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <div className="w-6 h-6 text-amber-600 mt-0.5 mr-3">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <h3 className="text-amber-800 font-medium mb-1">Use with Caution</h3>
              <p className="text-amber-700 text-sm">
                These actions can affect multiple users and data. Please review carefully before executing any bulk operations.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <div key={action.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className={`${action.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    {action.icon}
                  </div>
                  {action.dangerLevel === 'high' && (
                    <span className="bg-red-600 text-xs px-2 py-1 rounded-full">
                      High Risk
                    </span>
                  )}
                  {action.dangerLevel === 'medium' && (
                    <span className="bg-yellow-600 text-xs px-2 py-1 rounded-full">
                      Medium Risk
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                <button
                  onClick={() => {
                    if (action.requiresConfirmation) {
                      openModal(action.id, { title: action.title, description: action.description })
                    } else {
                      executeQuickAction(action.id)
                    }
                  }}
                  disabled={loading}
                  className={`w-full ${action.color} ${action.hoverColor} text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : 'Execute'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Action History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Actions</h2>
          </div>
          <div className="p-6">
            {actionHistory.length > 0 ? (
              <div className="space-y-4">
                {actionHistory.map((action) => (
                  <div key={action.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>By: {action.performedBy}</span>
                        <span>{formatRelativeTime(action.timestamp)}</span>
                        {action.affectedCount && (
                          <span>Affected: {action.affectedCount} items</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Completed
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No actions yet</h3>
                <p className="text-gray-500">Execute an action above to see it in your history.</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-700 mb-2">
                    Are you sure you want to execute: <strong>{modalData.title}</strong>?
                  </p>
                  <p className="text-gray-600 text-sm">
                    {modalData.description}
                  </p>
                  
                  {/* Additional input fields for specific actions */}
                  {modalType === 'deadline_extension' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extension period (days):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        defaultValue="7"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        id="extensionDays"
                      />
                    </div>
                  )}

                  {modalType === 'writer_notifications' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notification message:
                      </label>
                      <textarea
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your message to writers..."
                        id="notificationMessage"
                      />
                    </div>
                  )}

                  {modalType === 'generate_reports' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report type:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" id="reportType">
                        <option value="monthly">Monthly Performance</option>
                        <option value="financial">Financial Summary</option>
                        <option value="writers">Writer Statistics</option>
                        <option value="students">Student Activity</option>
                      </select>
                    </div>
                  )}

                  {modalType === 'bulk_status_update' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filter chapters by current status:
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" id="currentStatus">
                          <option value="draft">Draft</option>
                          <option value="in_progress">In Progress</option>
                          <option value="revision">Under Revision</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New status:
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" id="newStatus">
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="revision">Under Revision</option>
                          <option value="approved">Approved</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Warning:</strong> This action cannot be undone. Please verify all settings before proceeding.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      const actionData = { count: Math.floor(Math.random() * 20) + 1 }
                      
                      // Collect additional data based on action type
                      if (modalType === 'deadline_extension') {
                        actionData.extensionDays = document.getElementById('extensionDays')?.value || 7
                      } else if (modalType === 'writer_notifications') {
                        actionData.message = document.getElementById('notificationMessage')?.value
                      } else if (modalType === 'generate_reports') {
                        actionData.reportType = document.getElementById('reportType')?.value
                      } else if (modalType === 'bulk_status_update') {
                        actionData.currentStatus = document.getElementById('currentStatus')?.value
                        actionData.newStatus = document.getElementById('newStatus')?.value
                      }
                      
                      executeQuickAction(modalType, actionData)
                    }}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Yes, Execute'}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}