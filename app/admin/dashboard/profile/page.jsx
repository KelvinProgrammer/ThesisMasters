// app/admin/dashboard/profile/page.jsx - Admin Profile Management
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function AdminProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    department: 'operations',
    accessLevel: 'junior',
    permissions: [],
    phone: '',
    bio: '',
    avatar: null
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Activity log
  const [activityLog, setActivityLog] = useState([])

  // Permissions data
  const [permissionsData, setPermissionsData] = useState({
    permissions: [],
    accessLevel: 'junior',
    department: 'operations'
  })

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

    fetchProfileData()
    fetchActivityLog()
  }, [status, session, router])

  const fetchProfileData = async () => {
    try {
      // Mock data - replace with actual API call
      const mockProfile = {
        name: session?.user?.name || 'Admin User',
        email: session?.user?.email || 'admin@thesismaster.com',
        department: 'operations',
        accessLevel: 'super_admin',
        permissions: ['user_management', 'writer_management', 'content_management', 'payment_management', 'system_settings'],
        phone: '+254 123 456 789',
        bio: 'Senior administrator managing platform operations and ensuring smooth workflow for all users.',
        avatar: session?.user?.image || null,
        joinedAt: new Date('2023-01-15'),
        lastLogin: new Date(),
        totalActions: 1247,
        monthlyActions: 89
      }
      
      setProfileData(mockProfile)
      setPermissionsData({
        permissions: mockProfile.permissions,
        accessLevel: mockProfile.accessLevel,
        department: mockProfile.department
      })
    } catch (err) {
      setError('Failed to fetch profile data')
    }
  }

  const fetchActivityLog = async () => {
    try {
      // Mock data - replace with actual API call
      const mockActivity = [
        {
          id: 1,
          action: 'Approved writer application',
          details: 'Approved Dr. Sarah Wilson as a new writer',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'writer_management',
          severity: 'info'
        },
        {
          id: 2,
          action: 'Updated system settings',
          details: 'Modified payment processing configuration',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          type: 'system_settings',
          severity: 'warning'
        },
        {
          id: 3,
          action: 'Processed bulk payment reminders',
          details: 'Sent payment reminders to 15 students',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
          type: 'payment_management',
          severity: 'info'
        },
        {
          id: 4,
          action: 'Banned user account',
          details: 'Temporarily suspended problematic user account',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
          type: 'user_management',
          severity: 'error'
        },
        {
          id: 5,
          action: 'Generated monthly report',
          details: 'Created comprehensive platform performance report',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          type: 'content_management',
          severity: 'info'
        }
      ]
      
      setActivityLog(mockActivity)
    } catch (err) {
      setError('Failed to fetch activity log')
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Mock API call - replace with actual implementation
      console.log('Updating profile:', profileData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      setLoading(false)
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }
    
    try {
      // Mock API call - replace with actual implementation
      console.log('Changing password')
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionsUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Mock API call - replace with actual implementation
      console.log('Updating permissions:', permissionsData)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Permissions updated successfully!')
    } catch (err) {
      setError('Failed to update permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError('File size must be less than 2MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const togglePermission = (permission) => {
    setPermissionsData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const availablePermissions = [
    { key: 'user_management', label: 'User Management', description: 'Manage student accounts and profiles' },
    { key: 'writer_management', label: 'Writer Management', description: 'Approve, ban, and manage writers' },
    { key: 'content_management', label: 'Content Management', description: 'Manage chapters and content' },
    { key: 'payment_management', label: 'Payment Management', description: 'Handle payments and billing' },
    { key: 'system_settings', label: 'System Settings', description: 'Configure platform settings' }
  ]

  const getActivityIcon = (type, severity) => {
    const colorClass = severity === 'error' ? 'text-red-500' : 
                      severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'
    
    switch (type) {
      case 'user_management':
        return (
          <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
            </svg>
          </div>
        )
      case 'writer_management':
        return (
          <div className={`w-8 h-8 rounded-full bg-green-100 flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
            </svg>
          </div>
        )
      case 'payment_management':
        return (
          <div className={`w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
            </svg>
          </div>
        )
      case 'system_settings':
        return (
          <div className={`w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
          </div>
        )
      default:
        return (
          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
            <svg className={`w-4 h-4 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
          </div>
        )
    }
  }

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

  const tabs = [
    { id: 'profile', name: 'Profile Information' },
    { id: 'security', name: 'Security Settings' },
    { id: 'permissions', name: 'Permissions & Access' },
    { id: 'activity', name: 'Activity Log' }
  ]

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600">Manage your administrative account and permissions</p>
        </div>

        {/* Profile Overview Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profileData.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.email}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span className="capitalize">
                  {profileData.accessLevel?.replace('_', ' ')} Admin
                </span>
                <span>•</span>
                <span className="capitalize">
                  {profileData.department} Department
                </span>
                <span>•</span>
                <span>
                  {profileData.totalActions} Total Actions
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Login</div>
              <div className="text-gray-900 font-medium">
                {profileData.lastLogin ? new Date(profileData.lastLogin).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Avatar Upload */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      {profileData.avatar ? (
                        <img
                          src={profileData.avatar}
                          alt="Profile"
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {profileData.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          id="avatar-upload"
                        />
                        <label
                          htmlFor="avatar-upload"
                          className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Change Picture
                        </label>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 2MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      placeholder="+254 123 456 789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={profileData.department}
                      onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="operations">Operations</option>
                      <option value="quality_assurance">Quality Assurance</option>
                      <option value="customer_support">Customer Support</option>
                      <option value="finance">Finance</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Settings Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        required
                        minLength={6}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password *
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-blue-900 font-medium mb-2">Password Requirements:</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• At least 6 characters long</li>
                      <li>• Must be different from current password</li>
                      <li>• Should include a mix of letters and numbers</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                {/* Two-Factor Authentication */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                        <p className="text-gray-600 text-sm">Add an extra layer of security to your account</p>
                      </div>
                      <button className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Permissions & Access Tab */}
            {activeTab === 'permissions' && (
              <form onSubmit={handlePermissionsUpdate} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Level
                    </label>
                    <select
                      value={permissionsData.accessLevel}
                      onChange={(e) => setPermissionsData(prev => ({ ...prev, accessLevel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="junior">Junior Admin</option>
                      <option value="senior">Senior Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      value={permissionsData.department}
                      onChange={(e) => setPermissionsData(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="operations">Operations</option>
                      <option value="quality_assurance">Quality Assurance</option>
                      <option value="customer_support">Customer Support</option>
                      <option value="finance">Finance</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {availablePermissions.map((permission) => (
                      <div key={permission.key} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id={permission.key}
                            type="checkbox"
                            checked={permissionsData.permissions.includes(permission.key)}
                            onChange={() => togglePermission(permission.key)}
                            className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor={permission.key} className="font-medium text-gray-700">
                            {permission.label}
                          </label>
                          <p className="text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-5 h-5 text-amber-600 mt-0.5 mr-3">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-amber-800 font-medium mb-1">Important Note</h4>
                      <p className="text-amber-700 text-sm">
                        Permission changes require approval from a Super Admin and will take effect after your next login.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Permissions'}
                  </button>
                </div>
              </form>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{profileData.monthlyActions} actions this month</span>
                    <span>•</span>
                    <span>{profileData.totalActions} total actions</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity.type, activity.severity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatRelativeTime(activity.timestamp)}</span>
                          <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className={`text-xs font-medium px-2 py-1 rounded ${
                        activity.severity === 'error' ? 'bg-red-100 text-red-800' :
                        activity.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.severity.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    Load More Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}