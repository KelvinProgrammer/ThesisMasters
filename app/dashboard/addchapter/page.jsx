// app/dashboard/addchapter/page.jsx - Enhanced with Price Calculator
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Alert from '@/components/Alert'

export default function AddChapter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    chapterNumber: '',
    targetWordCount: '2000',
    deadline: '',
    tags: '',
    // Pricing fields
    level: 'masters',
    workType: 'coursework',
    urgency: 'normal', // normal, urgent, very_urgent
    estimatedPages: ''
  })

  const [pricing, setPricing] = useState({
    basePrice: 0,
    urgencyMultiplier: 1,
    levelMultiplier: 1,
    workTypeMultiplier: 1,
    totalPrice: 0
  })

  // Pricing configuration
  const pricingConfig = {
    baseRate: 400, // KSH per page
    urgency: {
      normal: { multiplier: 1, label: '7+ days', description: 'Standard delivery' },
      urgent: { multiplier: 1.5, label: '3-7 days', description: '50% extra charge' },
      very_urgent: { multiplier: 2, label: '1-3 days', description: '100% extra charge' }
    },
    level: {
      masters: { multiplier: 1, label: 'Masters Level', description: 'Standard academic level' },
      phd: { multiplier: 1.3, label: 'PhD Level', description: '30% extra for advanced research' }
    },
    workType: {
      coursework: { multiplier: 1, label: 'Coursework', description: 'Regular assignments and essays' },
      revision: { multiplier: 0.8, label: 'Revision', description: '20% discount for revisions' },
      statistics: { multiplier: 1.4, label: 'Statistics', description: '40% extra for statistical analysis' }
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
  }, [status, router])

  // Calculate pricing whenever relevant fields change
  useEffect(() => {
    calculatePricing()
  }, [formData.targetWordCount, formData.level, formData.workType, formData.urgency, formData.estimatedPages])

  const calculatePricing = () => {
    const pages = parseInt(formData.estimatedPages) || Math.ceil(parseInt(formData.targetWordCount || 0) / 250)
    const basePrice = pages * pricingConfig.baseRate
    
    const urgencyMultiplier = pricingConfig.urgency[formData.urgency]?.multiplier || 1
    const levelMultiplier = pricingConfig.level[formData.level]?.multiplier || 1
    const workTypeMultiplier = pricingConfig.workType[formData.workType]?.multiplier || 1
    
    const totalPrice = Math.round(basePrice * urgencyMultiplier * levelMultiplier * workTypeMultiplier)

    setPricing({
      basePrice,
      urgencyMultiplier,
      levelMultiplier,
      workTypeMultiplier,
      totalPrice,
      estimatedPages: pages
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-calculate pages when word count changes
    if (name === 'targetWordCount') {
      const pages = Math.ceil(parseInt(value || 0) / 250)
      setFormData(prev => ({
        ...prev,
        estimatedPages: pages.toString()
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Process tags
      const tagsArray = formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []

      const submitData = {
        ...formData,
        chapterNumber: parseInt(formData.chapterNumber),
        targetWordCount: parseInt(formData.targetWordCount),
        deadline: formData.deadline || undefined,
        tags: tagsArray,
        // Include pricing information
        pricing: {
          ...pricing,
          currency: 'KSH',
          pricePerPage: pricingConfig.baseRate
        },
        estimatedCost: pricing.totalPrice,
        estimatedPages: pricing.estimatedPages
      }

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create chapter')
      }

      setSuccess(`Chapter created successfully! Estimated cost: KSH ${pricing.totalPrice.toLocaleString()}`)
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        chapterNumber: '',
        targetWordCount: '2000',
        deadline: '',
        tags: '',
        level: 'masters',
        workType: 'coursework',
        urgency: 'normal',
        estimatedPages: ''
      })

      // Redirect to chapter list after a delay
      setTimeout(() => {
        router.push('/dashboard/currentchapters')
      }, 3000)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Chapter</h1>
          <p className="text-gray-600">Create a new chapter for your thesis with pricing estimation</p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Chapter Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter chapter title"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="chapterNumber" className="block text-sm font-medium text-gray-700 mb-2">
                          Chapter Number *
                        </label>
                        <input
                          type="number"
                          id="chapterNumber"
                          name="chapterNumber"
                          value={formData.chapterNumber}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="1"
                        />
                      </div>

                      <div>
                        <label htmlFor="targetWordCount" className="block text-sm font-medium text-gray-700 mb-2">
                          Target Word Count
                        </label>
                        <input
                          type="number"
                          id="targetWordCount"
                          name="targetWordCount"
                          value={formData.targetWordCount}
                          onChange={handleChange}
                          min="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="2000"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                        Chapter Summary
                      </label>
                      <textarea
                        id="summary"
                        name="summary"
                        value={formData.summary}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of what this chapter will cover..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing Configuration */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Level *
                      </label>
                      <select
                        id="level"
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(pricingConfig.level).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="workType" className="block text-sm font-medium text-gray-700 mb-2">
                        Type of Work *
                      </label>
                      <select
                        id="workType"
                        name="workType"
                        value={formData.workType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(pricingConfig.workType).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency *
                      </label>
                      <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(pricingConfig.urgency).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="estimatedPages" className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Pages
                      </label>
                      <input
                        type="number"
                        id="estimatedPages"
                        name="estimatedPages"
                        value={formData.estimatedPages}
                        onChange={handleChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Auto-calculated from word count"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Auto-calculated: ~250 words per page
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                        Deadline (Optional)
                      </label>
                      <input
                        type="date"
                        id="deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="methodology, literature review, analysis (comma-separated)"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Separate multiple tags with commas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Chapter...
                      </div>
                    ) : (
                      `Create Chapter (KSH ${pricing.totalPrice.toLocaleString()})`
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/overview')}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Price Calculator Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Price Calculator</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      KSH {pricing.totalPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-600">
                      Total Estimated Cost
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Rate:</span>
                    <span className="font-medium">KSH {pricingConfig.baseRate}/page</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Pages:</span>
                    <span className="font-medium">{pricing.estimatedPages || 0}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Cost:</span>
                    <span className="font-medium">KSH {pricing.basePrice.toLocaleString()}</span>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between">
                    <span className="text-gray-600">Level Multiplier:</span>
                    <span className="font-medium">×{pricing.levelMultiplier}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Work Type Multiplier:</span>
                    <span className="font-medium">×{pricing.workTypeMultiplier}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgency Multiplier:</span>
                    <span className="font-medium">×{pricing.urgencyMultiplier}</span>
                  </div>
                </div>

                {/* Pricing Explanations */}
                <div className="mt-6 space-y-3">
                  <div className="text-xs text-gray-500">
                    <div className="font-medium">Current Selection:</div>
                    <div>• {pricingConfig.level[formData.level]?.description}</div>
                    <div>• {pricingConfig.workType[formData.workType]?.description}</div>
                    <div>• {pricingConfig.urgency[formData.urgency]?.description}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-green-50 rounded-lg p-4 mt-6">
              <h4 className="text-sm font-medium text-green-900 mb-2">💡 Pricing Tips</h4>
              <div className="text-xs text-green-800 space-y-1">
                <div>• Revisions cost 20% less than new work</div>
                <div>• Plan ahead to avoid urgency charges</div>
                <div>• Statistics work requires specialized expertise</div>
                <div>• PhD level work involves advanced research</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}