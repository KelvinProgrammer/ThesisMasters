// app/admin/dashboard/chats/page.jsx - Admin Chat Management
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import AdminDashboardLayout from '@/components/AdminDashboardLayout'
import Alert from '@/components/Alert'

export default function AdminChats() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const messagesEndRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  
  // Chat states
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [aiSettings, setAiSettings] = useState({
    autoRespond: true,
    responseDelay: 5, // seconds
    confidenceThreshold: 0.8,
    enableForStudents: true,
    enableForWriters: false,
    workingHours: { start: '08:00', end: '18:00' }
  })

  // AI Response states
  const [aiResponding, setAiResponding] = useState(false)
  const [showAiSettings, setShowAiSettings] = useState(false)

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

    fetchChats()
  }, [status, session, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChats = async () => {
    try {
      // Mock data - replace with actual API call
      const mockChats = [
        {
          id: '1',
          student: {
            id: 'user1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            avatar: null,
            online: true
          },
          writer: {
            id: 'writer1',
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@example.com',
            avatar: null,
            online: false
          },
          chapter: {
            id: 'chapter1',
            title: 'Literature Review',
            number: 2
          },
          status: 'active',
          lastMessage: {
            text: 'When can I expect the first draft?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            sender: 'student'
          },
          unreadCount: 2,
          aiResponses: 3,
          totalMessages: 15,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
        },
        {
          id: '2',
          student: {
            id: 'user2',
            name: 'Alice Johnson',
            email: 'alice.johnson@example.com',
            avatar: null,
            online: false
          },
          writer: {
            id: 'writer2',
            name: 'Prof. Michael Chen',
            email: 'michael.chen@example.com',
            avatar: null,
            online: true
          },
          chapter: {
            id: 'chapter2',
            title: 'Methodology',
            number: 3
          },
          status: 'active',
          lastMessage: {
            text: 'I\'ve uploaded the revised methodology section',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sender: 'writer'
          },
          unreadCount: 0,
          aiResponses: 1,
          totalMessages: 28,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
        },
        {
          id: '3',
          student: {
            id: 'user3',
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            avatar: null,
            online: true
          },
          writer: {
            id: 'writer3',
            name: 'Dr. Maria Rodriguez',
            email: 'maria.rodriguez@example.com',
            avatar: null,
            online: false
          },
          chapter: {
            id: 'chapter3',
            title: 'Data Analysis',
            number: 4
          },
          status: 'escalated',
          lastMessage: {
            text: 'I need urgent help with SPSS analysis',
            timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
            sender: 'student'
          },
          unreadCount: 5,
          aiResponses: 0,
          totalMessages: 8,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
        },
        {
          id: '4',
          student: {
            id: 'user4',
            name: 'Sarah Davis',
            email: 'sarah.davis@example.com',
            avatar: null,
            online: false
          },
          writer: {
            id: 'writer1',
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@example.com',
            avatar: null,
            online: false
          },
          chapter: {
            id: 'chapter4',
            title: 'Introduction',
            number: 1
          },
          status: 'resolved',
          lastMessage: {
            text: 'Thank you for the great work!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            sender: 'student'
          },
          unreadCount: 0,
          aiResponses: 7,
          totalMessages: 42,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
        }
      ]
      setChats(mockChats)
    } catch (err) {
      setError('Failed to fetch chats')
    }
  }

  const fetchMessages = async (chatId) => {
    try {
      // Mock messages - replace with actual API call
      const mockMessages = [
        {
          id: '1',
          text: 'Hi! I need help with my Literature Review chapter.',
          sender: 'student',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          isAI: false
        },
        {
          id: '2',
          text: 'Hello! I\'d be happy to help you with your Literature Review. Could you please share more details about what specific assistance you need?',
          sender: 'writer',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 15),
          isAI: false
        },
        {
          id: '3',
          text: 'I need help structuring the literature review and finding relevant sources for my research on AI in education.',
          sender: 'student',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 30),
          isAI: false
        },
        {
          id: '4',
          text: 'Based on your research topic "AI in Education," here are some key areas to focus on in your literature review:\n\n1. Historical development of AI in educational contexts\n2. Current applications and tools\n3. Benefits and challenges\n4. Future trends and implications\n\nWould you like me to help you find specific sources for any of these areas?',
          sender: 'ai',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 35),
          isAI: true,
          confidence: 0.92
        },
        {
          id: '5',
          text: 'That\'s very helpful! Could you recommend some recent papers on AI applications in higher education?',
          sender: 'student',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          isAI: false
        },
        {
          id: '6',
          text: 'When can I expect the first draft?',
          sender: 'student',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          isAI: false
        }
      ]
      setMessages(mockMessages)
    } catch (err) {
      setError('Failed to fetch messages')
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    fetchMessages(chat.id)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'admin',
      timestamp: new Date(),
      isAI: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update chat's last message
    setChats(prev => prev.map(chat => 
      chat.id === selectedChat.id 
        ? { ...chat, lastMessage: { text: newMessage, timestamp: new Date(), sender: 'admin' } }
        : chat
    ))
  }

  const handleAIRespond = async (chatId) => {
    setAiResponding(true)
    try {
      // Mock AI response - replace with actual AI integration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiResponse = {
        id: Date.now().toString(),
        text: 'Based on your timeline, I recommend starting with the literature review structure this week. I can provide you with a detailed outline and begin gathering relevant sources. The first draft should be ready within 5-7 business days.',
        sender: 'ai',
        timestamp: new Date(),
        isAI: true,
        confidence: 0.89
      }

      setMessages(prev => [...prev, aiResponse])
      
      // Update AI response count
      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, aiResponses: chat.aiResponses + 1 }
          : chat
      ))

      setSuccess('AI response generated successfully')
    } catch (err) {
      setError('Failed to generate AI response')
    } finally {
      setAiResponding(false)
    }
  }

  const handleEscalateChat = (chatId) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, status: 'escalated' }
        : chat
    ))
    setSuccess('Chat escalated successfully')
  }

  const handleResolveChat = (chatId) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, status: 'resolved' }
        : chat
    ))
    setSuccess('Chat marked as resolved')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'escalated':
        return 'bg-red-100 text-red-800'
      case 'resolved':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (timestamp) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  // Filter chats based on active tab and search
  const filteredChats = chats.filter(chat => {
    const matchesTab = activeTab === 'all' || chat.status === activeTab
    const matchesSearch = !searchTerm || 
      chat.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesTab && matchesSearch
  })

  const tabs = [
    { id: 'active', name: 'Active', count: chats.filter(c => c.status === 'active').length },
    { id: 'escalated', name: 'Escalated', count: chats.filter(c => c.status === 'escalated').length },
    { id: 'resolved', name: 'Resolved', count: chats.filter(c => c.status === 'resolved').length },
    { id: 'all', name: 'All', count: chats.length }
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Chat Management</h1>
              <p className="text-gray-600">Monitor and manage student-writer communications</p>
            </div>
            <button
              onClick={() => setShowAiSettings(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              AI Settings
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
                <p className="text-gray-600 text-sm">Total Chats</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chats.filter(c => c.status === 'active').length}
                </p>
                <p className="text-gray-600 text-sm">Active Chats</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {chats.reduce((sum, chat) => sum + chat.aiResponses, 0)}
                </p>
                <p className="text-gray-600 text-sm">AI Responses</p>
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
                  {chats.filter(c => c.status === 'escalated').length}
                </p>
                <p className="text-gray-600 text-sm">Escalated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-1 p-4" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-100 text-red-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.name} ({tab.count})
                    </button>
                  ))}
                </nav>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900 text-sm">
                          {chat.student.name}
                        </div>
                        <div className="text-gray-500 text-xs">→</div>
                        <div className="font-medium text-gray-900 text-sm">
                          {chat.writer.name}
                        </div>
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Ch. {chat.chapter.number}: {chat.chapter.title}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(chat.lastMessage.timestamp)}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-1 truncate">
                      {chat.lastMessage.text}
                    </div>
                    
                    {chat.aiResponses > 0 && (
                      <div className="text-xs text-purple-600 mt-1">
                        🤖 {chat.aiResponses} AI responses
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {selectedChat.student.name} ↔ {selectedChat.writer.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Chapter {selectedChat.chapter.number}: {selectedChat.chapter.title}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAIRespond(selectedChat.id)}
                          disabled={aiResponding}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                          {aiResponding ? 'Generating...' : '🤖 AI Respond'}
                        </button>
                        {selectedChat.status !== 'escalated' && (
                          <button
                            onClick={() => handleEscalateChat(selectedChat.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                          >
                            Escalate
                          </button>
                        )}
                        {selectedChat.status !== 'resolved' && (
                          <button
                            onClick={() => handleResolveChat(selectedChat.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'admin'
                              ? 'bg-red-500 text-white'
                              : message.isAI
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : message.sender === 'student'
                              ? 'bg-gray-100 text-gray-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                              {message.sender === 'admin' ? 'Admin' :
                               message.isAI ? '🤖 AI Assistant' :
                               message.sender === 'student' ? 'Student' : 'Writer'}
                            </span>
                            <span className="text-xs opacity-75">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          {message.isAI && message.confidence && (
                            <div className="text-xs opacity-75 mt-1">
                              Confidence: {(message.confidence * 100).toFixed(0)}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message as admin..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
                    <p className="text-gray-500">Choose a conversation from the list to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Settings Modal */}
        {showAiSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">AI Auto-Response Settings</h2>
                  <button
                    onClick={() => setShowAiSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* General AI Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">Enable Auto-Response</h4>
                          <p className="text-gray-600 text-sm">AI will automatically respond to messages</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aiSettings.autoRespond}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, autoRespond: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Response Delay (seconds)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={aiSettings.responseDelay}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, responseDelay: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confidence Threshold
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={aiSettings.confidenceThreshold}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Type Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">User Type Settings</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">Enable for Students</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aiSettings.enableForStudents}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, enableForStudents: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-900">Enable for Writers</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={aiSettings.enableForWriters}
                            onChange={(e) => setAiSettings(prev => ({ ...prev, enableForWriters: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Working Hours</h3>
                    <p className="text-gray-600 text-sm mb-4">AI responses will only be sent during these hours</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={aiSettings.workingHours.start}
                          onChange={(e) => setAiSettings(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, start: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={aiSettings.workingHours.end}
                          onChange={(e) => setAiSettings(prev => ({
                            ...prev,
                            workingHours: { ...prev.workingHours, end: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      onClick={() => {
                        setSuccess('AI settings updated successfully')
                        setShowAiSettings(false)
                      }}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      Save Settings
                    </button>
                    <button
                      onClick={() => setShowAiSettings(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
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