// app/admin/dashboard/reports/page.jsx - Admin Reports & Analytics
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function AdminReports() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30') // days
  const [reportData, setReportData] = useState({})

  // Report filters
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    userType: 'all', // all, students, writers
    status: 'all', // all, active, inactive
    region: 'all'
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

    fetchReportData()
  }, [status, session, router, dateRange, filters])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockData = {
        overview: {
          totalRevenue: 2450000,
          totalUsers: 1247,
          totalWriters: 58,
          totalChapters: 2341,
          completedChapters: 1890,
          pendingPayments: 156000,
          avgOrderValue: 18500,
          conversionRate: 23.5,
          userGrowthRate: 12.3,
          writerGrowthRate: 8.7,
          revenueGrowthRate: 15.2,
          completionRate: 94.2
        },
        
        financial: {
          monthlyRevenue: [
            { month: 'Jan', revenue: 180000, orders: 95, avgValue: 18947 },
            { month: 'Feb', revenue: 210000, orders: 112, avgValue: 18750 },
            { month: 'Mar', revenue: 245000, orders: 128, avgValue: 19140 },
            { month: 'Apr', revenue: 198000, orders: 105, avgValue: 18857 },
            { month: 'May', revenue: 267000, orders: 142, avgValue: 18802 },
            { month: 'Jun', revenue: 290000, orders: 156, avgValue: 18589 }
          ],
          revenueBreakdown: {
            platformFees: 122500,
            writerPayments: 2205000,
            adminRevenue: 122500,
            refunds: 45000
          },
          paymentMethods: [
            { method: 'M-Pesa', amount: 1470000, percentage: 60 },
            { method: 'Credit Card', amount: 735000, percentage: 30 },
            { method: 'Bank Transfer', amount: 245000, percentage: 10 }
          ]
        },
        
        users: {
          registrationTrend: [
            { date: '2024-01-01', students: 45, writers: 3 },
            { date: '2024-01-02', students: 52, writers: 2 },
            { date: '2024-01-03', students: 38, writers: 4 },
            { date: '2024-01-04', students: 61, writers: 1 },
            { date: '2024-01-05', students: 49, writers: 3 },
            { date: '2024-01-06', students: 55, writers: 2 },
            { date: '2024-01-07', students: 43, writers: 5 }
          ],
          demographics: {
            ageGroups: [
              { age: '18-24', count: 456, percentage: 36.5 },
              { age: '25-34', count: 523, percentage: 42.0 },
              { age: '35-44', count: 198, percentage: 15.9 },
              { age: '45+', count: 70, percentage: 5.6 }
            ],
            locations: [
              { location: 'Nairobi', count: 445, percentage: 35.7 },
              { location: 'Mombasa', count: 187, percentage: 15.0 },
              { location: 'Kisumu', count: 125, percentage: 10.0 },
              { location: 'Nakuru', count: 98, percentage: 7.9 },
              { location: 'Other', count: 392, percentage: 31.4 }
            ]
          }
        },
        
        writers: {
          performance: [
            { name: 'Dr. Sarah Wilson', completed: 43, rating: 4.8, earnings: 156000 },
            { name: 'Prof. Michael Chen', completed: 76, rating: 4.9, earnings: 276000 },
            { name: 'Dr. Alice Johnson', completed: 29, rating: 4.6, earnings: 105000 },
            { name: 'Dr. Maria Rodriguez', completed: 53, rating: 4.7, earnings: 192000 },
            { name: 'John Smith', completed: 12, rating: 4.2, earnings: 43000 }
          ],
          specializations: [
            { field: 'Academic Writing', count: 23, percentage: 39.7 },
            { field: 'Research', count: 18, percentage: 31.0 },
            { field: 'Statistics', count: 8, percentage: 13.8 },
            { field: 'Data Analysis', count: 6, percentage: 10.3 },
            { field: 'Literature Review', count: 3, percentage: 5.2 }
          ]
        },
        
        content: {
          chaptersByLevel: [
            { level: 'Masters', count: 1756, percentage: 75.0 },
            { level: 'PhD', count: 585, percentage: 25.0 }
          ],
          chaptersByType: [
            { type: 'Coursework', count: 1405, percentage: 60.0 },
            { type: 'Revision', count: 703, percentage: 30.0 },
            { type: 'Statistics', count: 233, percentage: 10.0 }
          ],
          completionTimes: [
            { range: '0-3 days', count: 468, percentage: 20.0 },
            { range: '4-7 days', count: 936, percentage: 40.0 },
            { range: '8-14 days', count: 702, percentage: 30.0 },
            { range: '15+ days', count: 235, percentage: 10.0 }
          ]
        }
      }
      
      setReportData(mockData)
    } catch (err) {
      setError('Failed to fetch report data')
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async (reportType, format) => {
    setLoading(true)
    try {
      // Mock export - replace with actual implementation
      console.log(`Exporting ${reportType} report as ${format}`)
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(`${reportType} report exported successfully as ${format.toUpperCase()}`)
    } catch (err) {
      setError('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  // Simple Chart Components (replace with actual chart library)
  const BarChart = ({ data, title, valueKey, labelKey }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{item[labelKey]}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(item[valueKey] / Math.max(...data.map(d => d[valueKey]))) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="w-20 text-sm font-medium text-gray-900 text-right">
              {typeof item[valueKey] === 'number' && item[valueKey] > 1000 
                ? formatCurrency(item[valueKey])
                : item[valueKey]
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const LineChart = ({ data, title, xKey, yKey }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className="bg-blue-600 rounded-t w-full transition-all duration-500"
              style={{ 
                height: `${(item[yKey] / Math.max(...data.map(d => d[yKey]))) * 200}px`,
                minHeight: '4px'
              }}
            ></div>
            <div className="text-xs text-gray-600 mt-2 transform -rotate-45">
              {item[xKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const PieChart = ({ data, title, valueKey, labelKey }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded mr-3"
                style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
              ></div>
              <span className="text-sm text-gray-700">{item[labelKey]}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {typeof item[valueKey] === 'number' && item[valueKey] > 1000 
                ? formatCurrency(item[valueKey])
                : item[valueKey]
              } ({item.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'financial', name: 'Financial', icon: '💰' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'writers', name: 'Writers', icon: '✍️' },
    { id: 'content', name: 'Content', icon: '📝' },
    { id: 'system', name: 'System', icon: '⚙️' }
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive platform performance insights</p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
              <button
                onClick={() => handleExportReport(activeTab, 'pdf')}
                disabled={loading}
                className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
              <select
                value={filters.userType}
                onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="writers">Writers Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && reportData.overview && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{formatCurrency(reportData.overview.totalRevenue)}</p>
                        <p className="text-blue-100 text-sm">Total Revenue</p>
                        <p className="text-blue-200 text-xs">+{reportData.overview.revenueGrowthRate}% from last period</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{reportData.overview.totalUsers.toLocaleString()}</p>
                        <p className="text-green-100 text-sm">Total Users</p>
                        <p className="text-green-200 text-xs">+{reportData.overview.userGrowthRate}% growth rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{reportData.overview.totalChapters.toLocaleString()}</p>
                        <p className="text-purple-100 text-sm">Total Chapters</p>
                        <p className="text-purple-200 text-xs">{reportData.overview.completionRate}% completion rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-3xl font-bold">{reportData.overview.totalWriters}</p>
                        <p className="text-orange-100 text-sm">Active Writers</p>
                        <p className="text-orange-200 text-xs">+{reportData.overview.writerGrowthRate}% growth rate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.overview.avgOrderValue)}</p>
                        <p className="text-gray-600 text-sm">Avg Order Value</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatPercentage(reportData.overview.conversionRate)}</p>
                        <p className="text-gray-600 text-sm">Conversion Rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.overview.pendingPayments)}</p>
                        <p className="text-gray-600 text-sm">Pending Payments</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{reportData.overview.completedChapters.toLocaleString()}</p>
                        <p className="text-gray-600 text-sm">Completed Chapters</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Tab */}
            {activeTab === 'financial' && reportData.financial && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <LineChart 
                    data={reportData.financial.monthlyRevenue}
                    title="Monthly Revenue Trend"
                    xKey="month"
                    yKey="revenue"
                  />
                  
                  <PieChart
                    data={reportData.financial.paymentMethods}
                    title="Payment Methods Distribution"
                    valueKey="amount"
                    labelKey="method"
                  />
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {formatCurrency(reportData.financial.revenueBreakdown.platformFees)}
                      </div>
                      <div className="text-gray-600 text-sm">Platform Fees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(reportData.financial.revenueBreakdown.writerPayments)}
                      </div>
                      <div className="text-gray-600 text-sm">Writer Payments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {formatCurrency(reportData.financial.revenueBreakdown.adminRevenue)}
                      </div>
                      <div className="text-gray-600 text-sm">Admin Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {formatCurrency(reportData.financial.revenueBreakdown.refunds)}
                      </div>
                      <div className="text-gray-600 text-sm">Refunds</div>
                    </div>
                  </div>
                </div>

                {/* Monthly Performance Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Value</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.financial.monthlyRevenue.map((month, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {month.month}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(month.revenue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {month.orders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(month.avgValue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && reportData.users && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <BarChart
                    data={reportData.users.demographics.ageGroups}
                    title="User Demographics by Age"
                    valueKey="count"
                    labelKey="age"
                  />
                  
                  <PieChart
                    data={reportData.users.demographics.locations}
                    title="Users by Location"
                    valueKey="count"
                    labelKey="location"
                  />
                </div>

                {/* Registration Trend */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Registration Trend</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Date</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Students</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Writers</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.users.registrationTrend.map((day, index) => (
                          <tr key={index}>
                            <td className="py-2 text-sm text-gray-900">
                              {new Date(day.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 text-sm text-gray-900">{day.students}</td>
                            <td className="py-2 text-sm text-gray-900">{day.writers}</td>
                            <td className="py-2 text-sm font-medium text-gray-900">{day.students + day.writers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Writers Tab */}
            {activeTab === 'writers' && reportData.writers && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <PieChart
                    data={reportData.writers.specializations}
                    title="Writer Specializations"
                    valueKey="count"
                    labelKey="field"
                  />

                  {/* Top Performers */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Writers</h3>
                    <div className="space-y-4">
                      {reportData.writers.performance.map((writer, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{writer.name}</div>
                            <div className="text-sm text-gray-600">
                              {writer.completed} completed • ⭐ {writer.rating}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatCurrency(writer.earnings)}
                            </div>
                            <div className="text-sm text-gray-600">earnings</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && reportData.content && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <PieChart
                    data={reportData.content.chaptersByLevel}
                    title="Chapters by Academic Level"
                    valueKey="count"
                    labelKey="level"
                  />
                  
                  <PieChart
                    data={reportData.content.chaptersByType}
                    title="Chapters by Work Type"
                    valueKey="count"
                    labelKey="type"
                  />
                  
                  <BarChart
                    data={reportData.content.completionTimes}
                    title="Completion Time Distribution"
                    valueKey="count"
                    labelKey="range"
                  />
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">System Reports</h3>
                <p className="text-gray-500 mb-4">System performance and usage analytics</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">99.9%</div>
                    <div className="text-gray-600 text-sm">Uptime</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">1.2s</div>
                    <div className="text-gray-600 text-sm">Avg Response</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">15.2TB</div>
                    <div className="text-gray-600 text-sm">Data Usage</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">247</div>
                    <div className="text-gray-600 text-sm">API Calls/min</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExportReport(activeTab, 'pdf')}
              disabled={loading}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Export as PDF
            </button>
            <button
              onClick={() => handleExportReport(activeTab, 'excel')}
              disabled={loading}
              className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Export as Excel
            </button>
            <button
              onClick={() => handleExportReport(activeTab, 'csv')}
              disabled={loading}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Export as CSV
            </button>
            <button
              onClick={() => handleExportReport('comprehensive', 'pdf')}
              disabled={loading}
              className="bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Full Report (PDF)
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  )
}