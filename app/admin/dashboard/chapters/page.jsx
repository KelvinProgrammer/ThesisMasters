// app/admin/dashboard/chapters/page.jsx - Enhanced with bid management
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminDashboardLayout from "@/components/AdminDashboardLayout"
import Alert from "@/components/Alert"

export default function ChaptersManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPaid, setFilterPaid] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState("") // 'view', 'assign', 'reassign', 'status', 'bids'
  const [statistics, setStatistics] = useState({})
  const [pagination, setPagination] = useState({})
  const [writers, setWriters] = useState([]) // Available writers for assignment

  // Modal form data
  const [modalData, setModalData] = useState({
    writerId: "",
    status: "",
    deadline: "",
    estimatedCost: "",
    reason: "",
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (session?.user?.role !== "admin") {
      router.push("/dashboard")
      return
    }

    fetchChapters()
    fetchWriters()
  }, [status, session, router])

  useEffect(() => {
    fetchChapters()
  }, [filterStatus, filterPaid, searchTerm])

  const fetchChapters = async (page = 1) => {
    try {
      setLoading(true)
      setError("")

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })

      if (filterStatus !== "all") {
        params.append("status", filterStatus)
      }

      if (filterPaid !== "all") {
        params.append("isPaid", filterPaid)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await fetch(`/api/admin/chapters?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch chapters")
      }

      const data = await response.json()
      setChapters(data.chapters || [])
      setStatistics(data.statistics || {})
      setPagination(data.pagination || {})
    } catch (err) {
      console.error("Fetch chapters error:", err)
      setError(err.message || "Failed to fetch chapters")
    } finally {
      setLoading(false)
    }
  }

  const fetchWriters = async () => {
    try {
      const response = await fetch("/api/admin/users?role=writer&status=active&verified=true&limit=100", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWriters(data.users || [])
      }
    } catch (err) {
      console.error("Fetch writers error:", err)
    }
  }

  const handleBidAction = async (chapterId, bidId, action) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/admin/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterId,
          action: "manage_bid",
          data: { bidId, bidAction: action },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} bid`)
      }

      const result = await response.json()
      setSuccess(result.message)

      // Update local state
      setChapters((prev) => prev.map((chapter) => (chapter._id === chapterId ? result.chapter : chapter)))

      // Close modal if open
      if (showModal && modalType === "bids") {
        setShowModal(false)
      }
    } catch (err) {
      console.error(`Bid ${action} error:`, err)
      setError(err.message || `Failed to ${action} bid`)
    } finally {
      setLoading(false)
    }
  }

  const handleChapterAction = async (action, chapterId, data = {}) => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch("/api/admin/chapters", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterId,
          action,
          data,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to ${action} chapter`)
      }

      const result = await response.json()
      setSuccess(result.message)

      // Update local state
      setChapters((prev) => prev.map((chapter) => (chapter._id === chapterId ? result.chapter : chapter)))

      setShowModal(false)
      setSelectedChapter(null)
      setModalData({
        writerId: "",
        status: "",
        deadline: "",
        estimatedCost: "",
        reason: "",
      })
    } catch (err) {
      console.error(`Chapter ${action} error:`, err)
      setError(err.message || `Failed to ${action} chapter`)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (type, chapter) => {
    setModalType(type)
    setSelectedChapter(chapter)
    setShowModal(true)

    // Pre-populate modal data based on chapter and type
    if (type === "status") {
      setModalData({ ...modalData, status: chapter.status })
    } else if (type === "assign" || type === "reassign") {
      setModalData({ ...modalData, writerId: chapter.writerId?._id || "" })
    }
  }

  const handleModalSubmit = () => {
    if (!selectedChapter) return

    let actionData = {}

    switch (modalType) {
      case "assign":
      case "reassign":
        if (!modalData.writerId) {
          setError("Please select a writer")
          return
        }
        actionData = { writerId: modalData.writerId }
        break

      case "status":
        if (!modalData.status) {
          setError("Please select a status")
          return
        }
        actionData = { status: modalData.status }
        break

      case "extend_deadline":
        if (!modalData.deadline) {
          setError("Please select a new deadline")
          return
        }
        actionData = { deadline: modalData.deadline }
        break

      case "update_cost":
        if (!modalData.estimatedCost || modalData.estimatedCost <= 0) {
          setError("Please enter a valid cost")
          return
        }
        actionData = { estimatedCost: Number.parseFloat(modalData.estimatedCost) }
        break
    }

    const action =
      modalType === "assign" || modalType === "reassign"
        ? "assign_writer"
        : modalType === "status"
          ? "change_status"
          : modalType

    handleChapterAction(action, selectedChapter._id, actionData)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "revision":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBidStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "normal":
        return "bg-gray-100 text-gray-800"
      case "urgent":
        return "bg-orange-100 text-orange-800"
      case "very_urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount)
  }

  const isOverdue = (deadline, status) => {
    return ["draft", "in_progress", "revision"].includes(status) && new Date(deadline) < new Date()
  }

  const getPendingBidsCount = (chapter) => {
    return chapter.bids?.filter((bid) => bid.status === "pending").length || 0
  }

  if (loading && chapters.length === 0) {
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
        {error && <Alert type="error" message={error} onClose={() => setError("")} className="mb-6" />}

        {success && <Alert type="success" message={success} onClose={() => setSuccess("")} className="mb-6" />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chapters Management</h1>
              <p className="text-gray-600">Monitor all chapter orders, bids, assignments, and progress</p>
            </div>
            <button
              onClick={() => fetchChapters()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.total || 0}</p>
                <p className="text-gray-600 text-sm">Total Chapters</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.pendingBids || 0}</p>
                <p className="text-gray-600 text-sm">Pending Bids</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.completed || 0}</p>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{statistics.overdue || 0}</p>
                <p className="text-gray-600 text-sm">Overdue</p>
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
                <option value="pending">Pending Bids</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="revision">Under Revision</option>
                <option value="approved">Approved</option>
                <option value="overdue">Overdue</option>
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
          {chapters.length > 0 ? (
            <>
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
                        Bids
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
                    {chapters.map((chapter) => {
                      const pendingBids = getPendingBidsCount(chapter)

                      return (
                        <tr key={chapter._id} className={`hover:bg-gray-50 ${chapter.isOverdue ? "bg-red-50" : ""}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                Ch. {chapter.chapterNumber}: {chapter.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {chapter.level?.toUpperCase()} • {chapter.workType?.replace("_", " ")}
                              </div>
                              {chapter.urgency && (
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(chapter.urgency)}`}
                                >
                                  {chapter.urgency.replace("_", " ").toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{chapter.user?.name || "Unknown"}</div>
                              <div className="text-sm text-gray-500">{chapter.user?.email || "No email"}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {chapter.writer ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{chapter.writer.name}</div>
                                <div className="text-sm text-gray-500">{chapter.writer.email}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-red-500">Unassigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {chapter.bids && chapter.bids.length > 0 ? (
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{chapter.bids.length} bid(s)</div>
                                  {pendingBids > 0 && (
                                    <div className="text-xs text-yellow-600">{pendingBids} pending</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">No bids</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chapter.status)}`}
                            >
                              {chapter.status === "in_progress"
                                ? "In Progress"
                                : chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(chapter.estimatedCost || 0)}
                              </div>
                              <div className={`text-sm ${chapter.isPaid ? "text-green-600" : "text-red-600"}`}>
                                {chapter.isPaid ? "Paid" : "Unpaid"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`text-sm ${chapter.isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}
                            >
                              {chapter.deadline ? new Date(chapter.deadline).toLocaleDateString() : "No deadline"}
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
                                onClick={() => openModal("view", chapter)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>

                              {/* Show bids button if there are bids */}
                              {chapter.bids && chapter.bids.length > 0 && (
                                <button
                                  onClick={() => openModal("bids", chapter)}
                                  className={`relative text-purple-600 hover:text-purple-900 ${pendingBids > 0 ? "bg-yellow-100 rounded-full p-1" : ""}`}
                                  title={`${chapter.bids.length} bid(s) - ${pendingBids} pending`}
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                  </svg>
                                  {pendingBids > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                      {pendingBids}
                                    </span>
                                  )}
                                </button>
                              )}

                              {!chapter.writer && (
                                <button
                                  onClick={() => openModal("assign", chapter)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Assign Writer"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                                  </svg>
                                </button>
                              )}

                              {chapter.writer && (
                                <button
                                  onClick={() => openModal("reassign", chapter)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Reassign Writer"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                  </svg>
                                </button>
                              )}

                              <button
                                onClick={() => openModal("status", chapter)}
                                className="text-orange-600 hover:text-orange-900"
                                title="Change Status"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - same as before */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => fetchChapters(pagination.current - 1)}
                      disabled={pagination.current <= 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchChapters(pagination.current + 1)}
                      disabled={pagination.current >= pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.current - 1) * pagination.limit + 1}</span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(pagination.current * pagination.limit, pagination.total)}
                        </span>{" "}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => fetchChapters(pagination.current - 1)}
                          disabled={pagination.current <= 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <button
                              key={page}
                              onClick={() => fetchChapters(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.current
                                  ? "z-10 bg-red-50 border-red-500 text-red-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => fetchChapters(pagination.current + 1)}
                          disabled={pagination.current >= pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters found</h3>
              <p className="text-gray-500">No chapters match your current search criteria.</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showModal && selectedChapter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modalType === "view" && "Chapter Details"}
                    {modalType === "assign" && "Assign Writer"}
                    {modalType === "reassign" && "Reassign Writer"}
                    {modalType === "status" && "Change Status"}
                    {modalType === "bids" && "Manage Bids"}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
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
                        <p className="text-gray-600">{selectedChapter.user?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Level:</span>
                        <p className="text-gray-600">{selectedChapter.level?.toUpperCase() || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Work Type:</span>
                        <p className="text-gray-600">{selectedChapter.workType?.replace("_", " ") || "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Cost:</span>
                        <p className="text-gray-600">{formatCurrency(selectedChapter.estimatedCost || 0)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Progress:</span>
                        <p className="text-gray-600">
                          {selectedChapter.wordCount || 0} / {selectedChapter.targetWordCount || 0} words
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Deadline:</span>
                        <p className="text-gray-600">
                          {selectedChapter.deadline
                            ? new Date(selectedChapter.deadline).toLocaleDateString()
                            : "No deadline"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bids Management Modal Content */}
                  {modalType === "bids" && selectedChapter.bids && selectedChapter.bids.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Writer Bids ({selectedChapter.bids.length} total)
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {selectedChapter.bids.map((bid) => (
                          <div
                            key={bid._id}
                            className={`border rounded-lg p-4 ${bid.status === "pending" ? "border-yellow-300 bg-yellow-50" : "border-gray-200"}`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-medium text-gray-900">{bid.writer?.name || "Unknown Writer"}</h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getBidStatusColor(bid.status)}`}
                                  >
                                    {bid.status.toUpperCase()}
                                  </span>
                                  {bid.writer?.writerProfile?.rating && (
                                    <div className="flex items-center text-yellow-500">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                      <span className="text-sm text-gray-600 ml-1">
                                        {bid.writer.writerProfile.rating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                                  <div>
                                    <span className="font-medium text-gray-700">Bid Amount:</span>
                                    <p className="text-lg font-semibold text-green-600">
                                      {formatCurrency(bid.bidAmount)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Delivery Time:</span>
                                    <p className="text-gray-900 font-medium">{bid.estimatedDays} days</p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700">Submitted:</span>
                                    <p className="text-gray-900">{new Date(bid.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {bid.bidMessage && (
                                  <div className="text-sm bg-gray-50 p-3 rounded">
                                    <span className="font-medium text-gray-700">Writer's Message:</span>
                                    <p className="text-gray-600 mt-1 italic">"{bid.bidMessage}"</p>
                                  </div>
                                )}
                                {bid.writer?.writerProfile && (
                                  <div className="text-sm text-gray-600 mt-2">
                                    <span className="font-medium">Experience:</span>{" "}
                                    {bid.writer.writerProfile.specializations?.join(", ") || "General"}
                                    {bid.writer.writerProfile.completedOrders && (
                                      <span className="ml-2">
                                        • {bid.writer.writerProfile.completedOrders} completed orders
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {bid.status === "pending" && (
                                <div className="flex flex-col gap-2 ml-4">
                                  <button
                                    onClick={() => handleBidAction(selectedChapter._id, bid._id, "accept")}
                                    disabled={loading}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Accept Bid
                                  </button>
                                  <button
                                    onClick={() => handleBidAction(selectedChapter._id, bid._id, "reject")}
                                    disabled={loading}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Reject Bid
                                  </button>
                                </div>
                              )}

                              {bid.status !== "pending" && (
                                <div className="ml-4 text-sm">
                                  {bid.status === "accepted" && (
                                    <div className="text-green-600 font-medium flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      ACCEPTED
                                    </div>
                                  )}
                                  {bid.status === "rejected" && (
                                    <div className="text-red-600 font-medium flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      REJECTED
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedChapter.bids.filter((bid) => bid.status === "pending").length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>{selectedChapter.bids.filter((bid) => bid.status === "pending").length}</strong>{" "}
                            bid(s) awaiting your approval. Review and approve the best bid to assign this chapter to a
                            writer.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regular Modal Content for other types */}
                  {(modalType === "assign" || modalType === "reassign") && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Writer:</label>
                      <select
                        value={modalData.writerId}
                        onChange={(e) => setModalData({ ...modalData, writerId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a writer...</option>
                        {writers.map((writer) => (
                          <option key={writer._id} value={writer._id}>
                            {writer.name} ({writer.writerProfile?.specializations?.join(", ") || "No specializations"})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {modalType === "status" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Status:</label>
                      <select
                        value={modalData.status}
                        onChange={(e) => setModalData({ ...modalData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending Bids</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="revision">Under Revision</option>
                        <option value="approved">Approved</option>
                      </select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    {modalType === "view" || modalType === "bids" ? (
                      <button
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleModalSubmit}
                          disabled={loading}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Saving..." : `Confirm ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
                        </button>
                        <button
                          onClick={() => setShowModal(false)}
                          disabled={loading}
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
