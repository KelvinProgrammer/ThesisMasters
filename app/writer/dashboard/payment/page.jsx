// app/writer/dashboard/payment/page.jsx - Writer Payment Settings
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import WriterDashboardLayout from '@/components/WriterDashboardLayout'
import Alert from '@/components/Alert'

export default function WriterPaymentSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // State management
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('payment-methods')
  
  // Payment settings form data
  const [paymentSettings, setPaymentSettings] = useState({
    preferredMethod: 'mpesa',
    mpesa: {
      phoneNumber: '',
      accountName: ''
    },
    bankAccount: {
      accountNumber: '',
      bankName: '',
      accountName: '',
      swiftCode: ''
    },
    paypal: {
      email: ''
    },
    preferences: {
      minimumPayout: 1000,
      autoPayoutEnabled: false,
      payoutFrequency: 'weekly',
      currency: 'KES'
    },
    taxInfo: {
      kraPin: '',
      taxExempt: false,
      witholdingTax: true
    }
  })

  const banks = [
    'Equity Bank', 'KCB Bank', 'Cooperative Bank', 'ABSA Bank',
    'Standard Chartered', 'Barclays Bank', 'DTB Bank', 'I&M Bank',
    'Diamond Trust Bank', 'Family Bank', 'Stanbic Bank', 'Other'
  ]

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/writer/login')
      return
    }
    if (session?.user?.role !== 'writer') {
      router.push('/dashboard')
      return
    }

    fetchPaymentSettings()
  }, [status, session, router])

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/writer/profile')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile')
      }

      setProfile(data.writer)
      
      // Set existing payment settings if available
      if (data.writer.paymentSettings) {
        setPaymentSettings({
          ...paymentSettings,
          ...data.writer.paymentSettings
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const response = await fetch('/api/writer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentSettings
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message)

      setSuccess('Payment settings updated successfully!')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const validateForm = () => {
    if (paymentSettings.preferredMethod === 'mpesa' && !paymentSettings.mpesa.phoneNumber) {
      setError('M-Pesa phone number is required')
      return false
    }
    if (paymentSettings.preferredMethod === 'bank' && 
        (!paymentSettings.bankAccount.accountNumber || !paymentSettings.bankAccount.bankName)) {
      setError('Bank account details are required')
      return false
    }
    if (paymentSettings.preferredMethod === 'paypal' && !paymentSettings.paypal.email) {
      setError('PayPal email is required')
      return false
    }
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      handleSave(e)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  if (loading) {
    return (
      <WriterDashboardLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </WriterDashboardLayout>
    )
  }

  return (
    <WriterDashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
          <p className="text-gray-600 mt-1">Configure your payment methods and preferences</p>
        </div>

        {/* Alerts */}
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'payment-methods'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('tax-info')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tax-info'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tax Information
              </button>
            </nav>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit}>
              {/* Payment Methods Tab */}
              {activeTab === 'payment-methods' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Preferred Payment Method
                    </label>
                    <div className="space-y-4">
                      {/* M-Pesa Option */}
                      <div className={`border rounded-lg p-4 ${paymentSettings.preferredMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="mpesa"
                            checked={paymentSettings.preferredMethod === 'mpesa'}
                            onChange={(e) => setPaymentSettings({...paymentSettings, preferredMethod: e.target.value})}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-xs">M-PESA</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">M-Pesa</div>
                              <div className="text-sm text-gray-500">Mobile money transfer (Recommended)</div>
                            </div>
                          </div>
                        </label>
                        
                        {paymentSettings.preferredMethod === 'mpesa' && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                value={paymentSettings.mpesa.phoneNumber}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  mpesa: {...paymentSettings.mpesa, phoneNumber: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="254712345678"
                                required={paymentSettings.preferredMethod === 'mpesa'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Name
                              </label>
                              <input
                                type="text"
                                value={paymentSettings.mpesa.accountName}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  mpesa: {...paymentSettings.mpesa, accountName: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="Full name on M-Pesa account"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bank Account Option */}
                      <div className={`border rounded-lg p-4 ${paymentSettings.preferredMethod === 'bank' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank"
                            checked={paymentSettings.preferredMethod === 'bank'}
                            onChange={(e) => setPaymentSettings({...paymentSettings, preferredMethod: e.target.value})}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
                                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Bank Account</div>
                              <div className="text-sm text-gray-500">Direct bank transfer</div>
                            </div>
                          </div>
                        </label>

                        {paymentSettings.preferredMethod === 'bank' && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bank Name
                              </label>
                              <select
                                value={paymentSettings.bankAccount.bankName}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  bankAccount: {...paymentSettings.bankAccount, bankName: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                required={paymentSettings.preferredMethod === 'bank'}
                              >
                                <option value="">Select Bank</option>
                                {banks.map((bank) => (
                                  <option key={bank} value={bank}>{bank}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Number
                              </label>
                              <input
                                type="text"
                                value={paymentSettings.bankAccount.accountNumber}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  bankAccount: {...paymentSettings.bankAccount, accountNumber: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="Account number"
                                required={paymentSettings.preferredMethod === 'bank'}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Name
                              </label>
                              <input
                                type="text"
                                value={paymentSettings.bankAccount.accountName}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  bankAccount: {...paymentSettings.bankAccount, accountName: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="Full name on bank account"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                SWIFT Code (Optional)
                              </label>
                              <input
                                type="text"
                                value={paymentSettings.bankAccount.swiftCode}
                                onChange={(e) => setPaymentSettings({
                                  ...paymentSettings,
                                  bankAccount: {...paymentSettings.bankAccount, swiftCode: e.target.value}
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="SWIFT/BIC code"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PayPal Option */}
                      <div className={`border rounded-lg p-4 ${paymentSettings.preferredMethod === 'paypal' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="paypal"
                            checked={paymentSettings.preferredMethod === 'paypal'}
                            onChange={(e) => setPaymentSettings({...paymentSettings, preferredMethod: e.target.value})}
                            className="mr-3"
                          />
                          <div className="flex items-center">
                            <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-xs">PayPal</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">PayPal</div>
                              <div className="text-sm text-gray-500">International payments</div>
                            </div>
                          </div>
                        </label>

                        {paymentSettings.preferredMethod === 'paypal' && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              PayPal Email
                            </label>
                            <input
                              type="email"
                              value={paymentSettings.paypal.email}
                              onChange={(e) => setPaymentSettings({
                                ...paymentSettings,
                                paypal: {...paymentSettings.paypal, email: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                              placeholder="your.paypal@email.com"
                              required={paymentSettings.preferredMethod === 'paypal'}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Payout Amount
                      </label>
                      <select
                        value={paymentSettings.preferences.minimumPayout}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          preferences: {...paymentSettings.preferences, minimumPayout: parseInt(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value={500}>KES 500</option>
                        <option value={1000}>KES 1,000</option>
                        <option value={2000}>KES 2,000</option>
                        <option value={5000}>KES 5,000</option>
                        <option value={10000}>KES 10,000</option>
                      </select>
                      <p className="text-sm text-gray-500 mt-1">
                        Minimum amount before payout is available
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payout Frequency
                      </label>
                      <select
                        value={paymentSettings.preferences.payoutFrequency}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          preferences: {...paymentSettings.preferences, payoutFrequency: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="manual">Manual</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.preferences.autoPayoutEnabled}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          preferences: {...paymentSettings.preferences, autoPayoutEnabled: e.target.checked}
                        })}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Enable Automatic Payouts</span>
                        <p className="text-sm text-gray-500">
                          Automatically request payout when minimum amount is reached
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Payout Information</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Payouts are processed within 1-3 business days</li>
                      <li>• M-Pesa transfers are usually instant</li>
                      <li>• Bank transfers may take 1-2 business days</li>
                      <li>• PayPal transfers may take 3-5 business days</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tax Information Tab */}
              {activeTab === 'tax-info' && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Tax Information</h4>
                    <p className="text-sm text-yellow-700">
                      Please consult with a tax professional for advice on your specific situation.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        KRA PIN (Optional)
                      </label>
                      <input
                        type="text"
                        value={paymentSettings.taxInfo.kraPin}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          taxInfo: {...paymentSettings.taxInfo, kraPin: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                        placeholder="Your KRA PIN"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.taxInfo.witholdingTax}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          taxInfo: {...paymentSettings.taxInfo, witholdingTax: e.target.checked}
                        })}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Withholding Tax</span>
                        <p className="text-sm text-gray-500">
                          Subject to withholding tax as per Kenyan tax regulations
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={paymentSettings.taxInfo.taxExempt}
                        onChange={(e) => setPaymentSettings({
                          ...paymentSettings,
                          taxInfo: {...paymentSettings.taxInfo, taxExempt: e.target.checked}
                        })}
                        className="rounded border-gray-300 mr-3"
                      />
                      <div>
                        <span className="font-medium text-gray-900">Tax Exempt</span>
                        <p className="text-sm text-gray-500">
                          Check if you are exempt from tax deductions
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 mt-6 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Settings Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
              <p className="text-gray-600 capitalize">
                {paymentSettings.preferredMethod.replace('_', ' ')}
              </p>
              {paymentSettings.preferredMethod === 'mpesa' && paymentSettings.mpesa.phoneNumber && (
                <p className="text-sm text-gray-500">{paymentSettings.mpesa.phoneNumber}</p>
              )}
              {paymentSettings.preferredMethod === 'bank' && paymentSettings.bankAccount.bankName && (
                <p className="text-sm text-gray-500">
                  {paymentSettings.bankAccount.bankName} - ***{paymentSettings.bankAccount.accountNumber?.slice(-4)}
                </p>
              )}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Payout Settings</h4>
              <p className="text-gray-600">
                Minimum: {formatCurrency(paymentSettings.preferences.minimumPayout)}
              </p>
              <p className="text-sm text-gray-500 capitalize">
                {paymentSettings.preferences.payoutFrequency} payouts
              </p>
            </div>
          </div>
        </div>
      </div>
    </WriterDashboardLayout>
  )
}