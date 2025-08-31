// app/admin/dashboard/managebilling/page.jsx - Admin Billing Management
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function ManageBilling() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'view', 'refund', 'dispute'

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

    fetchPayments()
  }, [status, session, router])

  const fetchPayments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPayments = [
        {
          _id: '1',
          transactionId: 'TXN-2024-001',
          userId: {
            _id: 'user1',
            name: 'John Doe',
            email: 'john.doe@example.com'
          },
          chapterId: {
            _id: 'chapter1',
            title: 'Literature Review',
            chapterNumber: 2,
            writerId: {
              _id: 'writer1',
              name: 'Dr. Sarah Wilson'
            }
          },
          amount: 15000,
          currency: 'KES',
          status: 'completed',
          paymentMethod: 'mpesa',
          description: 'Payment for Chapter 2: Literature Review',
          dueDate: new Date('2024-03-15'),
          createdAt: new Date('2024-03-10'),
          completedAt: new Date('2024-03-10'),
          fees: {
            platformFee: 750,
            writerShare: 13500,
            adminShare: 750
          }
        },
        {
          _id: '2',
          transactionId: 'TXN-2024-002',
          userId: {
            _id: 'user2',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com'
          },
          chapterId: {
            _id: 'chapter2',
            title: 'Methodology',
            chapterNumber: 3,
            writerId: {
              _id: 'writer2',
              name: 'Prof. Michael Chen'
            }
          },
          amount: 22000,
          currency: 'KES',
          status: 'pending',
          paymentMethod: 'card',
          description: 'Payment for Chapter 3: Methodology',
          dueDate: new Date('2024-03-20'),
          createdAt: new Date('2024-03-12'),
          fees: {
            platformFee: 1100,
            writerShare: 19800,
            adminShare: 1100
          }
        },
        {
          _id: '3',
          transactionId: 'TXN-2024-003',
          userId: {
            _id: 'user3',
            name: 'Michael Brown',
            email: 'michael.brown@example.com'
          },
          chapterId: {
            _id: 'chapter3',
            title: 'Data Analysis',
            chapterNumber: 4,
            writerId: {
              _id: 'writer3',
              name: 'Dr. Maria Rodriguez'
            }
          },
          amount: 18500,
          currency: 'KES',
          status: 'overdue',
          paymentMethod: 'bank_transfer',
          description: 'Payment for Chapter 4: Data Analysis',
          dueDate: new Date('2024-03-01'),
          createdAt: new Date('2024-02-25'),
          fees: {
            platformFee: 925,
            writerShare: 16650,
            adminShare: 925
          }
        },
        {
          _id: '4',
          transactionId: 'TXN-2024-004',
          userId: {
            _id: 'user4',
            name: 'Sarah Davis',
            email: 'sarah.davis@example.com'
          },
          chapterId: {
            _id: 'chapter4',
            title: 'Introduction',
            chapterNumber: 1,
            writerId: {
              _id: 'writer1',
              name: 'Dr. Sarah Wilson'
            }
          },
          amount: 12000,
          currency: 'KES',
          status: 'failed',
          paymentMethod: 'mpesa',
          description: 'Payment for Chapter 1: Introduction',
          dueDate: new Date('2024-03-18'),
          createdAt: new Date('2024-03-13'),
          failureReason: 'Insufficient funds',
          fees: {
            platformFee: 600,
            writerShare: 10800,
            adminShare: 600
          }
        },
        {
          _id: '5',
          transactionId: 'TXN-2024-005',
          userId: {
            _id: 'user5',
            name: 'David Wilson',
            email: 'david.wilson@example.com'
          },
          chapterId: {
            _id: 'chapter5',
            title: 'Conclusion',
            chapterNumber: 5,
            writerId: {
              _id: 'writer2',
              name: 'Prof. Michael Chen'
            }
          },
          amount: 16000,
          currency: 'KES',
          status: 'refunded',
          paymentMethod: 'card',
          description: 'Payment for Chapter 5: Conclusion',
          dueDate: new Date('2024-03-25'),
          createdAt: new Date('2024-03-08'),
          completedAt: new Date('2024-03-08'),
          refundedAt: new Date('2024-03-12'),
          refundReason: 'Writer unavailable',
          fees: {
            platformFee: 800,
            writerShare: 14400,
            adminShare: 800
          }
        }
      ]

      setPayments(mockPayments)
    } catch (err) {
      setError('Failed to fetch payments')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAction = async (action, paymentId, reason = '') => {
    try {
      // Mock API call - replace with actual implementation
      console.log(`${action} payment ${paymentId}:`, reason)
      
      // Update local state
      setPayments(prev => prev.map(payment => {
        if (payment._id === paymentId) {
          switch (action) {
            case 'refund':
              return {
                ...payment,
                status: 'refunded',
                refundedAt: new Date(),
                refundReason: reason
              }
            case 'mark_paid':
              return {
                ...payment,
                status: 'completed',
                completedAt: new Date()
              }
            case 'dispute':
              return {
                ...payment,
                status: 'disputed',
                disputeReason: reason
              }
            default:
              return payment
          }
        }
        return payment
      }))

      setSuccess(`Payment ${action === 'refund' ? 'refunded' : action === 'mark_paid' ? 'marked as paid' : 'disputed'} successfully`)
      setShowModal(false)
      setSelectedPayment(null)
    } catch (err) {
      setError(`Failed to ${action} payment`)
    }
  }

  const openModal = (type, payment) => {
    setModalType(type)
    setSelectedPayment(payment)
    setShowModal(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      case 'disputed':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount, currency = 'KES') => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const isOverdue = (dueDate, status) => {
    return status === 'pending' && new Date(dueDate) < new Date()
  }

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus
    const matchesSearch = !searchTerm || 
      payment.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.chapterId.title.toLowerCase().includes(searchTerm.toLowerCase())

    let matchesDate = true
    if (dateRange !== 'all') {
      const now = new Date()
      const paymentDate = new Date(payment.createdAt)
      
      switch (dateRange) {
        case 'today':
          matchesDate = paymentDate.toDateString() === now.toDateString()
          break
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = paymentDate >= weekAgo
          break
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = paymentDate >= monthAgo
          break
      }
    }

    return matchesStatus && matchesSearch && matchesDate
  })

  // Calculate totals
  const totals = filteredPayments.reduce((acc, payment) => {
    acc.total += payment.amount
    acc.platformFees += payment.fees.platformFee
    acc.writerShares += payment.fees.writerShare
    acc.adminShares += payment.fees.adminShare
    
    if (payment.status === 'completed') {
      acc.completed += payment.amount
    } else if (payment.status === 'pending') {
      acc.pending += payment.amount
    } else if (payment.status === 'refunded') {
      acc.refunded += payment.amount
    }
    
    return acc
  }, {
    total: 0,
    completed: 0,
    pending: 0,
    refunded: 0,
    platformFees: 0,
    writerShares: 0,
    adminShares: 0
  })

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing Management</h1>
          <p className="text-gray-600">Monitor payments, dues, and financial transactions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
                <p className="text-gray-600 text-sm">Total Revenue</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.completed)}</p>
                <p className="text-gray-600 text-sm">Completed</p>
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
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.pending)}</p>
                <p className="text-gray-600 text-sm">Pending</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {payments.filter(p => isOverdue(p.dueDate, p.status)).length}
                </p>
                <p className="text-gray-600 text-sm">Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.platformFees)}</p>
              <p className="text-gray-600 text-sm">Platform Fees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.writerShares)}</p>
              <p className="text-gray-600 text-sm">Writer Payments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totals.adminShares)}</p>
              <p className="text-gray-600 text-sm">Admin Revenue</p>
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
                placeholder="Search by user, email, or transaction ID..."
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
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="disputed">Disputed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chapter & Writer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id} className={`hover:bg-gray-50 ${isOverdue(payment.dueDate, payment.status) ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.transactionId}</div>
                          <div className="text-sm text-gray-500">{payment.paymentMethod.replace('_', ' ').toUpperCase()}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{payment.userId.name}</div>
                          <div className="text-sm text-gray-500">{payment.userId.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Ch. {payment.chapterId.chapterNumber}: {payment.chapterId.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            Writer: {payment.chapterId.writerId.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: {formatCurrency(payment.fees.platformFee)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status === 'overdue' ? 'Overdue' : payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isOverdue(payment.dueDate, payment.status) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </div>
                        {payment.status === 'completed' && payment.completedAt && (
                          <div className="text-xs text-green-600">
                            Paid: {new Date(payment.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal('view', payment)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          </button>

                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handlePaymentAction('mark_paid', payment._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Paid"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}

                          {(payment.status === 'completed' || payment.status === 'pending') && (
                            <button
                              onClick={() => openModal('refund', payment)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Refund"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}

                          <button
                            onClick={() => openModal('dispute', payment)}
                            className="text-red-600 hover:text-red-900"
                            title="Mark as Disputed"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
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
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              <p className="text-gray-500">No payments match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === 'view' && 'Payment Details'}
                    {modalType === 'refund' && 'Refund Payment'}
                    {modalType === 'dispute' && 'Mark as Disputed'}
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
                  {/* Payment Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Transaction ID:</span>
                        <p className="text-gray-600">{selectedPayment.transactionId}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Amount:</span>
                        <p className="text-gray-600">{formatCurrency(selectedPayment.amount, selectedPayment.currency)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Student:</span>
                        <p className="text-gray-600">{selectedPayment.userId.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Writer:</span>
                        <p className="text-gray-600">{selectedPayment.chapterId.writerId.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Chapter:</span>
                        <p className="text-gray-600">Ch. {selectedPayment.chapterId.chapterNumber}: {selectedPayment.chapterId.title}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Status:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                          {selectedPayment.status.charAt(0).toUpperCase() + selectedPayment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Fee Breakdown</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Platform Fee:</span>
                        <p className="font-medium">{formatCurrency(selectedPayment.fees.platformFee)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Writer Share:</span>
                        <p className="font-medium">{formatCurrency(selectedPayment.fees.writerShare)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Admin Share:</span>
                        <p className="font-medium">{formatCurrency(selectedPayment.fees.adminShare)}</p>
                      </div>
                    </div>
                  </div>

                  {modalType !== 'view' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for {modalType}:
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder={`Enter reason for ${modalType}...`}
                        id="actionReason"
                      />
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
                            const reason = document.getElementById('actionReason').value
                            handlePaymentAction(modalType, selectedPayment._id, reason)
                          }}
                          className={`flex-1 text-white py-2 px-4 rounded-lg font-semibold transition-colors ${
                            modalType === 'refund' ? 'bg-orange-600 hover:bg-orange-700' :
                            'bg-red-600 hover:bg-red-700'
                          }`}
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