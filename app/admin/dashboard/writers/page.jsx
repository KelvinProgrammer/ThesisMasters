// app/admin/dashboard/writers/page.jsx - Writers Management
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function WritersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [writers, setWriters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWriter, setSelectedWriter] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'approve', 'ban', 'promote', 'view'
  const [actionReason, setActionReason] = useState('')

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

    fetchWriters()
  }, [status, session, router])

  const fetchWriters = async () => {
    try {
      // Mock data - replace with actual API call
      const mockWriters = [
        {
          _id: '1',
          name: 'Dr. Sarah Wilson',
          email: 'sarah.wilson@example.com',
          role: 'writer',
          emailVerified: true,
          createdAt: new Date('2024-01-15'),
          writerProfile: {
            specializations: ['academic_writing', 'research', 'methodology'],
            yearsExperience: 8,
            education: {
              level: 'phd',
              field: 'Psychology',
              institution: 'University of Nairobi'
            },
            rating: 4.8,
            totalProjects: 45,
            completedProjects: 43,
            isVerified: false,
            availability: 'available'
          },
          adminProfile: null
        },
        {
          _id: '2',
          name: 'Prof. Michael Chen',
          email: 'michael.chen@example.com',
          role: 'writer',
          emailVerified: true,
          createdAt: new Date('2023-11-20'),
          writerProfile: {
            specializations: ['statistics', 'data_analysis', 'research'],
            yearsExperience: 12,
            education: {
              level: 'phd',
              field: 'Statistics',
              institution: 'Kenyatta University'
            },
            rating: 4.9,
            totalProjects: 78,
            completedProjects: 76,
            isVerified: true,
            availability: 'available'
          },
          adminProfile: null
        },
        {
          _id: '3',
          name: 'Dr. Alice Johnson',
          email: 'alice.johnson@example.com',
          role: 'writer',
          emailVerified: true,
          createdAt: new Date('2024-02-10'),
          writerProfile: {
            specializations: ['literature_review', 'academic_writing'],
            yearsExperience: 6,
            education: {
              level: 'masters',
              field: 'English Literature',
              institution: 'Moi University'
            },
            rating: 4.6,
            totalProjects: 32,
            completedProjects: 29,
            isVerified: true,
            availability: 'busy'
          },
          adminProfile: null
        },
        {
          _id: '4',
          name: 'John Smith',
          email: 'john.smith@example.com',
          role: 'writer',
          emailVerified: false,
          createdAt: new Date('2024-03-01'),
          writerProfile: {
            specializations: ['academic_writing'],
            yearsExperience: 3,
            education: {
              level: 'masters',
              field: 'Business Administration',
              institution: 'Strathmore University'
            },
            rating: 0,
            totalProjects: 0,
            completedProjects: 0,
            isVerified: false,
            availability: 'available'
          },
          adminProfile: null
        },
        {
          _id: '5',
          name: 'Dr. Maria Rodriguez',
          email: 'maria.rodriguez@example.com',
          role: 'writer',
          emailVerified: true,
          createdAt: new Date('2023-09-12'),
          writerProfile: {
            specializations: ['research', 'methodology', 'statistics'],
            yearsExperience: 10,
            education: {
              level: 'phd',
              field: 'Economics',
              institution: 'University of Nairobi'
            },
            rating: 4.7,
            totalProjects: 56,
            completedProjects: 53,
            isVerified: true,
            availability: 'unavailable'
          },
          adminProfile: null
        }
      ]

      setWriters(mockWriters)
    } catch (err) {
      setError('Failed to fetch writers')
    } finally {
      setLoading(false)
    }
  }

  const handleWriterAction = async (action, writerId, reason = '') => {
    try {
      // Mock API call - replace with actual implementation
      console.log(`${action} writer ${writerId}:`, reason)
      
      // Update local state
      setWriters(prev => prev.map(writer => {
        if (writer._id === writerId) {
          switch (action) {
            case 'approve':
              return {
                ...writer,
                writerProfile: { ...writer.writerProfile, isVerified: true }
              }
            case 'ban':
              return {
                ...writer,
                writerProfile: { ...writer.writerProfile, availability: 'unavailable', isVerified: false }
              }
            case 'activate':
              return {
                ...writer,
                writerProfile: { ...writer.writerProfile, availability: 'available' }
              }
            case 'promote':
              return {
                ...writer,
                role: 'admin',
                adminProfile: {
                  permissions: ['writer_management'],
                  department: 'operations',
                  accessLevel: 'junior'
                }
              }
            default:
              return writer
          }
        }
        return writer
      }))

      setSuccess(`Writer ${action === 'approve' ? 'approved' : action === 'ban' ? 'banned' : action === 'promote' ? 'promoted to admin' : 'updated'} successfully`)
      setShowModal(false)
      setSelectedWriter(null)
      setActionReason('')
    } catch (err) {
      setError(`Failed to ${action} writer`)
    }
  }

  const openModal = (type, writer) => {
    setModalType(type)
    setSelectedWriter(writer)
    setShowModal(true)
    setActionReason('')
  }

  const getStatusBadge = (writer) => {
    if (!writer.writerProfile.isVerified && writer.writerProfile.totalProjects === 0) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">Pending Approval</span>
    }
    if (!writer.writerProfile.isVerified) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Not Verified</span>
    }
    if (writer.writerProfile.availability === 'unavailable') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">Banned</span>
    }
    if (writer.writerProfile.availability === 'busy') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Busy</span>
    }
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Active</span>
  }

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return 'text-green-600'
      case 'busy': return 'text-yellow-600'
      case 'unavailable': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Filter writers based on status and search term
  const filteredWriters = writers.filter(writer => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'pending' && !writer.writerProfile.isVerified && writer.writerProfile.totalProjects === 0) ||
      (filterStatus === 'verified' && writer.writerProfile.isVerified) ||
      (filterStatus === 'banned' && writer.writerProfile.availability === 'unavailable') ||
      (filterStatus === 'active' && writer.writerProfile.isVerified && writer.writerProfile.availability !== 'unavailable')

    const matchesSearch = !searchTerm || 
      writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.writerProfile.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Writers Management</h1>
          <p className="text-gray-600">Manage writer applications, approvals, and permissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{writers.length}</p>
                <p className="text-gray-600 text-sm">Total Writers</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {writers.filter(w => w.writerProfile.isVerified).length}
                </p>
                <p className="text-gray-600 text-sm">Verified</p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {writers.filter(w => !w.writerProfile.isVerified && w.writerProfile.totalProjects === 0).length}
                </p>
                <p className="text-gray-600 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {writers.filter(w => w.writerProfile.availability === 'unavailable').length}
                </p>
                <p className="text-gray-600 text-sm">Banned</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Writers</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or specialization..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Approval</option>
                <option value="verified">Verified</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Writers List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredWriters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Writer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specializations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWriters.map((writer) => (
                    <tr key={writer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-sm font-medium text-blue-600">
                              {writer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{writer.name}</div>
                            <div className="text-sm text-gray-500">{writer.email}</div>
                            <div className="text-xs text-gray-400">
                              {writer.writerProfile.education.level.toUpperCase()} in {writer.writerProfile.education.field}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {writer.writerProfile.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                            >
                              {spec.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {writer.writerProfile.rating > 0 && (
                            <div className="flex items-center mb-1">
                              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                              </svg>
                              <span className="font-medium">{writer.writerProfile.rating}</span>
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {writer.writerProfile.completedProjects}/{writer.writerProfile.totalProjects} projects
                          </div>
                          <div className="text-xs text-gray-500">
                            {writer.writerProfile.yearsExperience} years exp.
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(writer)}
                          <div className={`text-xs font-medium capitalize ${getAvailabilityColor(writer.writerProfile.availability)}`}>
                            {writer.writerProfile.availability}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {writer.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal('view', writer)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                          </button>

                          {!writer.writerProfile.isVerified && writer.writerProfile.totalProjects === 0 && (
                            <button
                              onClick={() => openModal('approve', writer)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve Writer"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}

                          {writer.writerProfile.availability !== 'unavailable' && (
                            <button
                              onClick={() => openModal('ban', writer)}
                              className="text-red-600 hover:text-red-900"
                              title="Ban Writer"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}

                          {writer.writerProfile.availability === 'unavailable' && (
                            <button
                              onClick={() => handleWriterAction('activate', writer._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Activate Writer"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}

                          {writer.role === 'writer' && writer.writerProfile.isVerified && (
                            <button
                              onClick={() => openModal('promote', writer)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Promote to Admin"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                              </svg>
                            </button>
                          )}
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
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No writers found</h3>
              <p className="text-gray-500">No writers match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && selectedWriter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === 'view' && 'Writer Details'}
                    {modalType === 'approve' && 'Approve Writer'}
                    {modalType === 'ban' && 'Ban Writer'}
                    {modalType === 'promote' && 'Promote to Admin'}
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
                  {/* Writer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-lg font-medium text-blue-600">
                          {selectedWriter.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedWriter.name}</h3>
                        <p className="text-gray-600">{selectedWriter.email}</p>
                        <p className="text-sm text-gray-500">
                          {selectedWriter.writerProfile.education.level.toUpperCase()} in {selectedWriter.writerProfile.education.field}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Experience:</span>
                        <p className="text-gray-600">{selectedWriter.writerProfile.yearsExperience} years</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Rating:</span>
                        <p className="text-gray-600">
                          {selectedWriter.writerProfile.rating > 0 ? selectedWriter.writerProfile.rating : 'No rating yet'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Projects:</span>
                        <p className="text-gray-600">
                          {selectedWriter.writerProfile.completedProjects}/{selectedWriter.writerProfile.totalProjects}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Form */}
                  {modalType !== 'view' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for {modalType}:
                      </label>
                      <textarea
                        value={actionReason}
                        onChange={(e) => setActionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder={`Enter reason for ${modalType}...`}
                        required={modalType !== 'approve'}
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
                          onClick={() => handleWriterAction(modalType, selectedWriter._id, actionReason)}
                          className={`flex-1 text-white py-2 px-4 rounded-lg font-semibold transition-colors ${
                            modalType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                            modalType === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                            'bg-purple-600 hover:bg-purple-700'
                          }`}
                          disabled={modalType !== 'approve' && !actionReason.trim()}
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