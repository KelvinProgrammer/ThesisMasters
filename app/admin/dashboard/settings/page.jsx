// app/admin/dashboard/settings/page.jsx - Admin System Settings
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function SystemSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('general')
  const [hasChanges, setHasChanges] = useState(false)

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      siteName: 'ThesisMaster',
      siteDescription: 'Professional thesis writing platform',
      supportEmail: 'support@thesismaster.com',
      timezone: 'Africa/Nairobi',
      language: 'en',
      maintenanceMode: false,
      registrationEnabled: true,
      featuredWriters: 5,
      maxFileSize: 10, // MB
      allowedFileTypes: ['pdf', 'doc', 'docx', 'txt']
    },
    
    // Pricing Settings
    pricing: {
      currency: 'KES',
      baseRatePerPage: 400,
      levelMultipliers: {
        masters: 1.0,
        phd: 1.3
      },
      workTypeMultipliers: {
        coursework: 1.0,
        revision: 0.8,
        statistics: 1.4
      },
      urgencyMultipliers: {
        normal: 1.0,
        urgent: 1.5,
        very_urgent: 2.0
      },
      platformFeePercentage: 5,
      writerCommissionPercentage: 90,
      minimumOrderAmount: 1000,
      paymentMethods: ['mpesa', 'card', 'bank_transfer'],
      autoApprovalThreshold: 50000
    },

    // Email & Notifications
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: 'noreply@thesismaster.com',
      smtpPassword: '••••••••',
      fromName: 'ThesisMaster',
      fromEmail: 'noreply@thesismaster.com',
      notifyAdminsNewUser: true,
      notifyAdminsNewWriter: true,
      notifyAdminsPayment: true,
      sendWelcomeEmails: true,
      sendPaymentReminders: true,
      paymentReminderDays: [3, 1], // Days before due date
      sendCompletionEmails: true
    },

    // User Management
    users: {
      requireEmailVerification: true,
      allowSocialLogin: true,
      maxLoginAttempts: 5,
      lockoutDuration: 30, // minutes
      passwordMinLength: 6,
      passwordRequireSpecial: false,
      sessionTimeout: 24, // hours
      autoDeleteInactiveUsers: false,
      inactiveUserDays: 365,
      allowUserProfileEdit: true,
      allowUserDeactivation: true
    },

    // Writer Management
    writers: {
      autoApproveWriters: false,
      requirePortfolio: true,
      minYearsExperience: 2,
      requireEducationProof: true,
      writerApplicationFee: 0,
      maxActiveProjects: 10,
      writerRatingThreshold: 4.0,
      autoSuspendLowRating: false,
      writerPayoutSchedule: 'weekly', // weekly, biweekly, monthly
      writerMinimumPayout: 5000
    },

    // Content & Quality
    content: {
      enablePlagiarismCheck: true,
      plagiarismThreshold: 15, // percentage
      enableAiDetection: true,
      aiDetectionThreshold: 20, // percentage
      autoQualityReview: true,
      requiredWordCountAccuracy: 90, // percentage
      allowRevisionRequests: true,
      maxRevisionRequests: 3,
      revisionDeadlineDays: 5,
      enableContentBackup: true,
      backupFrequency: 'daily'
    },

    // Security
    security: {
      enableTwoFactor: false,
      requireTwoFactorAdmins: true,
      enableLoginNotifications: true,
      enableSuspiciousActivityAlerts: true,
      enableIPWhitelist: false,
      allowedIPs: [],
      enableRateLimiting: true,
      maxRequestsPerMinute: 60,
      enableSqlInjectionProtection: true,
      enableCorsProtection: true,
      dataRetentionPeriod: 7, // years
      enableAuditLogs: true
    },

    // Integration & APIs
    integrations: {
      enableAPI: true,
      apiRateLimit: 1000, // per hour
      webhookSecret: '••••••••',
      enableWebhooks: false,
      webhookUrl: '',
      googleAnalyticsId: '',
      facebookPixelId: '',
      enableChatSupport: true,
      chatProvider: 'intercom',
      enableSmsNotifications: false,
      smsProvider: 'twilio',
      smsApiKey: '••••••••'
    }
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

    fetchSettings()
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      // Mock API call - replace with actual implementation
      console.log('Fetching settings...')
      // Settings are already initialized in state
    } catch (err) {
      setError('Failed to fetch settings')
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const updateNestedSetting = (section, parentKey, childKey, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [childKey]: value
        }
      }
    }))
    setHasChanges(true)
  }

  const handleSaveSettings = async (sectionToSave = null) => {
    setLoading(true)
    setError('')
    
    try {
      // Mock API call - replace with actual implementation
      const dataToSave = sectionToSave ? { [sectionToSave]: settings[sectionToSave] } : settings
      console.log('Saving settings:', dataToSave)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess(`Settings ${sectionToSave ? 'section' : ''} saved successfully!`)
      if (!sectionToSave) setHasChanges(false)
    } catch (err) {
      setError('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values? This action cannot be undone.')) {
      // Reset to defaults
      setError('Reset functionality would restore default settings')
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    try {
      console.log('Testing email configuration...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess('Test email sent successfully!')
    } catch (err) {
      setError('Failed to send test email')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'email', name: 'Email & Notifications', icon: '📧' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'writers', name: 'Writer Settings', icon: '✍️' },
    { id: 'content', name: 'Content & Quality', icon: '📝' },
    { id: 'security', name: 'Security', icon: '🔒' },
    { id: 'integrations', name: 'Integrations', icon: '🔗' }
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
              <p className="text-gray-600">Configure platform settings and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              {hasChanges && (
                <span className="text-orange-600 text-sm font-medium">Unsaved changes</span>
              )}
              <button
                onClick={() => handleSaveSettings()}
                disabled={loading || !hasChanges}
                className="bg-red-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>
          </div>
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
              <h3 className="text-amber-800 font-medium mb-1">System Configuration</h3>
              <p className="text-amber-700 text-sm">
                Changes to these settings will affect the entire platform. Please review carefully before saving.
              </p>
            </div>
          </div>
        </div>

        {/* Settings Interface */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                      activeTab === tab.id
                        ? 'bg-red-50 text-red-600 border-r-2 border-red-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                    <button
                      onClick={() => handleSaveSettings('general')}
                      disabled={loading}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Save Section
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.siteName}
                        onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.general.language}
                        onChange={(e) => updateSetting('general', 'language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      >
                        <option value="en">English</option>
                        <option value="sw">Swahili</option>
                        <option value="fr">French</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.general.maxFileSize}
                        onChange={(e) => updateSetting('general', 'maxFileSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Writers Count
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.general.featuredWriters}
                        onChange={(e) => updateSetting('general', 'featuredWriters', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                    />
                  </div>

                  {/* Toggle Settings */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Platform Controls</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
                        <p className="text-gray-600 text-sm">Enable to disable user access for maintenance</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.maintenanceMode}
                          onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">User Registration</h4>
                        <p className="text-gray-600 text-sm">Allow new users to register accounts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.general.registrationEnabled}
                          onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Settings */}
              {activeTab === 'pricing' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Pricing Configuration</h2>
                    <button
                      onClick={() => handleSaveSettings('pricing')}
                      disabled={loading}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Save Section
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Rate Per Page (KES)
                      </label>
                      <input
                        type="number"
                        min="100"
                        value={settings.pricing.baseRatePerPage}
                        onChange={(e) => updateSetting('pricing', 'baseRatePerPage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Fee Percentage
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        value={settings.pricing.platformFeePercentage}
                        onChange={(e) => updateSetting('pricing', 'platformFeePercentage', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Writer Commission Percentage
                      </label>
                      <input
                        type="number"
                        min="70"
                        max="95"
                        value={settings.pricing.writerCommissionPercentage}
                        onChange={(e) => updateSetting('pricing', 'writerCommissionPercentage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order Amount (KES)
                      </label>
                      <input
                        type="number"
                        min="500"
                        value={settings.pricing.minimumOrderAmount}
                        onChange={(e) => updateSetting('pricing', 'minimumOrderAmount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Level Multipliers */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Level Multipliers</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Masters Level
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="2.0"
                          value={settings.pricing.levelMultipliers.masters}
                          onChange={(e) => updateNestedSetting('pricing', 'levelMultipliers', 'masters', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          PhD Level
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="2.0"
                          value={settings.pricing.levelMultipliers.phd}
                          onChange={(e) => updateNestedSetting('pricing', 'levelMultipliers', 'phd', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Type Multipliers */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Work Type Multipliers</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Coursework
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="2.0"
                          value={settings.pricing.workTypeMultipliers.coursework}
                          onChange={(e) => updateNestedSetting('pricing', 'workTypeMultipliers', 'coursework', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Revision
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="2.0"
                          value={settings.pricing.workTypeMultipliers.revision}
                          onChange={(e) => updateNestedSetting('pricing', 'workTypeMultipliers', 'revision', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Statistics
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="2.0"
                          value={settings.pricing.workTypeMultipliers.statistics}
                          onChange={(e) => updateNestedSetting('pricing', 'workTypeMultipliers', 'statistics', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Urgency Multipliers */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Urgency Multipliers</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Normal
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3.0"
                          value={settings.pricing.urgencyMultipliers.normal}
                          onChange={(e) => updateNestedSetting('pricing', 'urgencyMultipliers', 'normal', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Urgent
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3.0"
                          value={settings.pricing.urgencyMultipliers.urgent}
                          onChange={(e) => updateNestedSetting('pricing', 'urgencyMultipliers', 'urgent', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Very Urgent
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="3.0"
                          value={settings.pricing.urgencyMultipliers.very_urgent}
                          onChange={(e) => updateNestedSetting('pricing', 'urgencyMultipliers', 'very_urgent', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email & Notifications */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Email & Notification Settings</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleTestEmail}
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Test Email
                      </button>
                      <button
                        onClick={() => handleSaveSettings('email')}
                        disabled={loading}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Save Section
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-900 font-medium mb-2">SMTP Configuration</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={settings.email.smtpHost}
                          onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="email"
                          value={settings.email.smtpUsername}
                          onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-800 mb-2">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          value={settings.email.smtpPassword}
                          onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={settings.email.fromName}
                        onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={settings.email.fromEmail}
                        onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'notifyAdminsNewUser', label: 'Notify admins of new user registrations' },
                        { key: 'notifyAdminsNewWriter', label: 'Notify admins of new writer applications' },
                        { key: 'notifyAdminsPayment', label: 'Notify admins of payments received' },
                        { key: 'sendWelcomeEmails', label: 'Send welcome emails to new users' },
                        { key: 'sendPaymentReminders', label: 'Send payment reminder emails' },
                        { key: 'sendCompletionEmails', label: 'Send completion notification emails' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.email[item.key]}
                              onChange={(e) => updateSetting('email', item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                    <button
                      onClick={() => handleSaveSettings('security')}
                      disabled={loading}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Save Section
                    </button>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="w-6 h-6 text-red-600 mt-0.5 mr-3">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-red-800 font-medium mb-1">Security Notice</h3>
                        <p className="text-red-700 text-sm">
                          These settings affect platform security. Changes should be tested in a staging environment first.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Toggles */}
                  <div className="space-y-4">
                    {[
                      { key: 'enableTwoFactor', label: 'Enable Two-Factor Authentication', description: 'Allow users to enable 2FA on their accounts' },
                      { key: 'requireTwoFactorAdmins', label: 'Require 2FA for Admins', description: 'Force all admin accounts to use 2FA' },
                      { key: 'enableLoginNotifications', label: 'Login Notifications', description: 'Send email notifications for new logins' },
                      { key: 'enableSuspiciousActivityAlerts', label: 'Suspicious Activity Alerts', description: 'Alert admins of suspicious user behavior' },
                      { key: 'enableRateLimiting', label: 'Rate Limiting', description: 'Limit API requests per user' },
                      { key: 'enableSqlInjectionProtection', label: 'SQL Injection Protection', description: 'Enable advanced SQL injection protection' },
                      { key: 'enableAuditLogs', label: 'Audit Logging', description: 'Log all admin actions for compliance' }
                    ].map(item => (
                      <div key={item.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.label}</h4>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input
                            type="checkbox"
                            checked={settings.security[item.key]}
                            onChange={(e) => updateSetting('security', item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Security Values */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Requests Per Minute
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={settings.security.maxRequestsPerMinute}
                        onChange={(e) => updateSetting('security', 'maxRequestsPerMinute', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Retention Period (Years)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.security.dataRetentionPeriod}
                        onChange={(e) => updateSetting('security', 'dataRetentionPeriod', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Add other tab contents here */}
              {activeTab === 'users' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management Settings</h3>
                  <p className="text-gray-500">User management settings would be configured here.</p>
                </div>
              )}

              {activeTab === 'writers' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✍️</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Writer Settings</h3>
                  <p className="text-gray-500">Writer-specific settings would be configured here.</p>
                </div>
              )}

              {activeTab === 'content' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content & Quality Settings</h3>
                  <p className="text-gray-500">Content moderation and quality settings would be configured here.</p>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Settings</h3>
                  <p className="text-gray-500">Third-party integrations and API settings would be configured here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow border border-red-200 mt-8">
          <div className="p-6 border-b border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
            <p className="text-red-700 text-sm mt-1">These actions are irreversible and can cause data loss.</p>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900">Reset All Settings</h3>
                <p className="text-gray-600 text-sm">Reset all platform settings to default values.</p>
              </div>
              <button
                onClick={handleResetSettings}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Reset Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}