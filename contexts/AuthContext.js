// contexts/AuthContext.js
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user) {
      setUser(session.user)
    } else {
      setUser(null)
    }
    
    setLoading(false)
  }, [session, status])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    updateUser: setUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
