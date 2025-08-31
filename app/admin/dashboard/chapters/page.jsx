// app/admin/dashboard/chapters/page.jsx - Admin Chapters Management
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function ChaptersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaid, setFilterPaid] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'view', 'assign', 'reassign', 'status'

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

    fetchChapters()
  }, [status, session, router])

  const fetchChapters = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChapters = [
        {
          _id: '1',
          title: 'Literature Review',
          chapterNumber: 2,
          status: 'in_progress',
          wordCount: 3200,
          targetWordCount: 4000,
          deadline: new Date('2024-03-20'),
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-12'),
          isPaid: true,
          estimatedCost: 15000,
          level: 'masters',
          workType: 'coursework',
          urgency: 'normal',
          userId: {
            _id: 'user1',
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          writerId: {
            _id: 'writer1',
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@example.com'
          },
          paymentId: {
            _id: 'payment1',
            status: 'completed',
            amount: 15000
          }
        },
        {
          _id: '2',
          title: 'Methodology',
          chapterNumber: 3,
          status: 'completed',
          wordCount: 4500,
          targetWordCount: 4000,
          deadline: new Date('2024-03-15'),
          createdAt: new Date('2024-02-20'),
          updatedAt: new Date('2024-03-14'),
          completedAt: new Date('2024-03-14'),
          isPaid: true,
          estimatedCost: 22000,
          level: 'phd',
          workType: 'coursework',
          urgency: 'urgent',
          userId: {
            _id: 'user2',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com'
          },
          writerId: {
            _id: 'writer2',
            name: 'Prof. Michael Chen',
            email: 'michael.chen@example.com'
          },
          paymentId: {
            _id: 'payment2',
            status: 'completed',
            amount: 22000
          }
        },
        {
          _id: '3',
          title: 'Data Analysis',
          chapterNumber: 4,
          status: 'revision',
          wordCount: 3800,
          targetWordCount: 4200,
          deadline: new Date('2024-03-25'),
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-13'),
          isPaid: true,
          estimatedCost: 18500,
          level: 'masters',
          workType: 'statistics',
          urgency: 'normal',
          userId: {
            _id: 'user3',
            name: 'Michael Brown',
            email: 'michael.brown@example.com'
          },
          writerId: {
            _id: 'writer3',
            name: 'Dr. Maria Rodriguez',
            email: 'maria.rodriguez@example.com'
          },
          paymentId: {
            _id: 'payment3',
            status: 'completed',
            amount: 18500
          },
          feedback: [
            {
              reviewer: 'Student',
              comment: 'Please add more statistical analysis and include SPSS output',
              rating: 3,
              createdAt: new Date('2024-03-13')
            }
          ]
        },
        {
          _id: '4',
          title: 'Introduction',
          chapterNumber: 1,
          status: 'draft',
          wordCount: 0,
          targetWordCount: 3000,
          deadline: new Date('2024-03-30'),
          createdAt: new Date('2024-03-10'),
          updatedAt: new Date('2024-03-10'),
          isPaid: false,
          estimatedCost: 12000,
          level: 'masters',
          workType: 'coursework',
          urgency: 'normal',
          userId: {
            _id: 'user4',
            name: 'Sarah Davis',
            email: 'sarah.davis@example.com'
          },
          writerId: null,
          paymentId: null
        },
        {
          _id: '5',
          title: 'Conclusion',
          chapterNumber: 5,
          status: 'in_progress',
          wordCount: 2100,
          targetWordCount: 3500,
          deadline: new Date('2024-03-18'),
          createdAt: new Date('2024-03-08'),
          updatedAt: new Date('2024-03-12'),
          isPaid: true,
          estimatedCost: 16000,
          level: 'masters',
          workType: 'coursework',
          urgency: 'very_urgent',
          userId: {
            _id: 'user5',
            name: 'David Wilson',
            email: 'david.wilson@example.com'
          },
          writerId: {
            _id: 'writer2',
            name: 'Prof. Michael Chen',
            email: 'michael.chen@example.com'
          },
          paymentId: {
            _id: 'payment5',
            status: 'completed',
            amount: 16000
          }
        }
      ]

      setChapters(mockChapters)
    } catch (err) {
      setError('Failed to fetch chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleChapterAction = async (action, chapterId, data = {}) => {
    try {
      // Mock API call - replace with actual implementation
      console.log(`${action} chapter ${chapterId}:`, data)
      
      // Update local state
      setChapters(prev => prev.map(chapter => {
        if (chapter._id === chapterId) {
          switch (action) {
            case 'assign_writer':
              return {
                ...chapter,
                writerId: data.writerId,
                status: 'in_progress'
              }
            case 'change_status':
              return {
                ...chapter,
                status: data.status,
                ...(data.status === 'completed' && { completedAt: new Date() })
              }
            case 'extend_deadline':
              return {
                ...chapter,
                deadline: new Date(data.deadline)
              }
            default:
              return chapter
          }
        }
        return chapter
      }))

      setSuccess(`Chapter ${action.replace('_', ' ')} successfully`)
      setShowModal(false)
      setSelectedChapter(null)
    } catch (err) {
      setError(`Failed to ${action.replace('_', ' ')} chapter`)
    }
  }

  const openModal = (type, chapter) => {
    setModalType(type)
    setSelectedChapter(chapter)
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'revision':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'normal':
        return 'bg-gray-100 text-gray-800'
      case 'urgent':
        return 'bg-orange-100 text-orange-800'
      case 'very_urgent':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const isOverdue = (deadline, status) => {
    return (status === 'in_progress' || status === 'revision') && new Date(deadline) < new Date()
  }

  // Filter chapters
  const filteredChapters = chapters.filter(chapter => {
    const matchesStatus = filterStatus === 'all' || chapter.status === filterStatus
    const matchesPaid = filterPaid === 'all' || 
      (filterPaid === 'paid' && chapter.isPaid) || 
      (filterPaid === 'unpaid' && !chapter.isPaid)
    
    const matchesSearch = !searchTerm || 
      chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (chapter.writerId && chapter.writerId.name.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesStatus && matchesPaid && matchesSearch
  })

  // Calculate stats
  const stats = {
    total: chapters.length,
    inProgress: chapters.filter(c => c.status === 'in_progress').length,
    completed: chapters.filter(c => c.status === 'completed').length,
    revision: chapters.filter(c => c.status === 'revision').length,
    paid: chapters.filter(c => c.isPaid).length,
    unpaid: chapters.filter(c => !c.isPaid).length,
    overdue: chapters.filter(c => isOverdue(c.deadline, c.status)).length,
    totalRevenue: chapters.filter(c => c.isPaid).reduce((sum, c) => sum + c.estimatedCost, 0)
  }

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </AdminDashboardLayout>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapters Management</h1>
          <p className="text-gray-600">Monitor all chapter orders, assignments, and progress</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600 text-sm">Total Chapters</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                <p className="text-gray-600 text-sm">In Progress</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                <p className="text-gray-600 text-sm">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.revision}</p>
                <p className="text-gray-600 text-sm">Under Revision</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
                <p className="text-gray-600 text-sm">Paid Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unpaid}</p>
                <p className="text-gray-600 text-sm">Unpaid Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, student, or writer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="revision">Under Revision</option>
                <option value="approved">Approved</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={filterPaid}
                onChange={(e) => setFilterPaid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredChapters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chapter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Writer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChapters.map((chapter) => (
                    <tr key={chapter._id} className={`hover:bg-gray-50 ${isOverdue(chapter.deadline, chapter.status) ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Ch. {chapter.chapterNumber}: {chapter.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {chapter.level.toUpperCase()} • {chapter.workType.replace('_', ' ')}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(chapter.urgency)}`}>
                            {chapter.urgency.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{chapter.userId.name}</div>
                          <div className="text-sm text-gray-500">{chapter.userId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {chapter.writerId ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{chapter.writerId.name}</div>
                            <div className="text-sm text-gray-500">{chapter.writerId.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {chapter.wordCount.toLocaleString()} / {chapter.targetWordCount.toLocaleString()} words
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min((chapter.wordCount / chapter.targetWordCount) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {Math.round((chapter.wordCount / chapter.targetWordCount) * 100)}% complete
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chapter.status)}`}>
                          {chapter.status === 'in_progress' ? 'In Progress' : 
                           chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(chapter.estimatedCost)}
                          </div>
                          <div className={`text-sm ${chapter.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                            {chapter.isPaid ? 'Paid' : 'Unpaid'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isOverdue(chapter.deadline, chapter.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(chapter.deadline).toLocaleDateString()}
                        </div>
                        {chapter.completedAt && (
                          <div className="text-xs text-green-600">
                            Completed: {new Date(chapter.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal('view', chapter)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          </button>

                          {!chapter.writerId && (
                            <button
                              onClick={() => openModal('assign', chapter)}
                              className="text-green-600 hover:text-green-900"
                              title="Assign Writer"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z"/>
                              </svg>
                            </button>
                          )}

                          {chapter.writerId && (
                            <button
                              onClick={() => openModal('reassign', chapter)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Reassign Writer"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => openModal('status', chapter)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Change Status"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters found</h3>
              <p className="text-gray-500">No chapters match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === 'view' && 'Chapter Details'}
                    {modalType === 'assign' && 'Assign Writer'}
                    {modalType === 'reassign' && 'Reassign Writer'}
                    {modalType === 'status' && 'Change Status'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Chapter Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Student:</span>
                        <p className="text-gray-600">{selectedChapter.userId.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Level:</span>
                        <p className="text-gray-600">{selectedChapter.level.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Work Type:</span>
                        <p className="text-gray-600">{selectedChapter.workType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Cost:</span>
                        <p className="text-gray-600">{formatCurrency(selectedChapter.estimatedCost)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Progress:</span>
                        <p className="text-gray-600">
                          {selectedChapter.wordCount} / {selectedChapter.targetWordCount} words
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Deadline:</span>
                        <p className="text-gray-600">{new Date(selectedChapter.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Modal Content based on type */}
                  {modalType === 'assign' || modalType === 'reassign' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Writer:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Select a writer...</option>
                        <option value="writer1">Dr. Sarah Wilson (Literature, Research)</option>
                        <option value="writer2">Prof. Michael Chen (Statistics, Data Analysis)</option>
                        <option value="writer3">Dr. Maria Rodriguez (Research, Methodology)</option>
                      </select>
                    </div>
                  ) : modalType === 'status' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Status:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="draft">Draft</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="revision">Under Revision</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  ) : null}

                  {/* Feedback Section for view modal */}
                  {modalType === 'view' && selectedChapter.feedback && selectedChapter.feedback.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Recent Feedback</h4>
                      {selectedChapter.feedback.map((feedback, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{feedback.reviewer}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">"{feedback.comment}"</p>
                          {feedback.rating && (
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                </svg>
                              ))}
                              <span className="text-xs text-gray-500 ml-1">({feedback.rating}/5)</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    {modalType === 'view' ? (
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            // Handle action based on modal type
                            const actionData = {}
                            if (modalType === 'assign' || modalType === 'reassign') {
                              const select = document.querySelector('select')
                              actionData.writerId = select.value
                            } else if (modalType === 'status') {
                              const select = document.querySelector('select')
                              actionData.status = select.value
                            }
                            
                            const actionName = modalType === 'assign' ? 'assign_writer' : 
                                             modalType === 'reassign' ? 'assign_writer' : 
                                             'change_status'
                            
                            handleChapterAction(actionName, selectedChapter._id, actionData)
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Confirm {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                        </button>
                        <button
                          onClick={() => setShowModal(false)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}